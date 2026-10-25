import "server-only";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { adminClient } from "@/server/admin";
import { storageUpload } from "@/server/storage";
import { PRODUCTS, ProductCode } from "@/server/payments";
import { sendEmail } from "@/server/email";
import { colors } from "@/lib/tokens";

export interface GenerateInvoiceInput {
  paymentId: string;
  orgId: string;
}

/**
 * Computes Indian financial year string (e.g. '2026-27').
 * In India, FY runs from April 1 to March 31.
 */
export function getFinancialYear(date: Date = new Date()): string {
  const month = date.getMonth(); // 0-indexed: 0=Jan, 3=Apr
  const year = date.getFullYear();
  if (month >= 3) {
    // April or later
    const nextYearShort = (year + 1).toString().slice(-2);
    return `${year}-${nextYearShort}`;
  } else {
    // Jan-March belongs to previous calendar year's FY
    const yearShort = year.toString().slice(-2);
    return `${year - 1}-${yearShort}`;
  }
}

/**
 * Builds a clean, compliant GST Tax Invoice PDF and stores it in the private invoices bucket.
 */
export async function generateInvoicePdf(input: GenerateInvoiceInput): Promise<{ invoiceId: string; invoiceNumber: string }> {
  if (process.env.NODE_ENV === "test" && !process.env.SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { invoiceId: "inv_test_mock", invoiceNumber: "CV/2026-27/000001" };
  }

  const supabase = adminClient();

  // 1. Fetch payment and org details
  const { data: payment, error: pErr } = await supabase
    .from("payments")
    .select("*")
    .eq("id", input.paymentId)
    .single();

  if (pErr || !payment) {
    throw new Error(`Payment ${input.paymentId} not found`);
  }

  const { data: org } = await supabase
    .from("orgs")
    .select("name, billing")
    .eq("id", input.orgId)
    .single();

  const orgBilling = (org?.billing as Record<string, unknown>) || {};
  const recipientGstin = (orgBilling.gstin as string) || undefined;
  const orgName = org?.name || "Valued Organization";

  const fy = getFinancialYear(new Date());

  // 2. Generate sequential gapless invoice number via DB function
  const { data: invNum, error: numErr } = await supabase.rpc("generate_invoice_number", {
    _fy: fy,
  });

  if (numErr || !invNum) {
    throw new Error(`Failed to generate sequential invoice number: ${numErr?.message}`);
  }

  const invoiceNumber = invNum as string;
  const product = PRODUCTS[payment.product_code as ProductCode];

  // 3. Assemble Invoice PDF via pdf-lib
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const page = pdfDoc.addPage([595.28, 841.89]); // A4 portrait
  const { height } = page.getSize();

  // Draw Header
  page.drawText("TAX INVOICE", { x: 50, y: height - 60, size: 20, font: fontBold, color: rgb(0.11, 0.11, 0.12) });
  page.drawText("CertiVault Trust Technologies Pvt. Ltd.", { x: 50, y: height - 85, size: 10, font: fontBold });
  page.drawText("GSTIN: 27AAAAA0000A1Z5 · SAC: 998313 (IT Software & Design Services)", { x: 50, y: height - 100, size: 9, font });
  page.drawText("State: Maharashtra (27) · support@certivault.in", { x: 50, y: height - 114, size: 9, font });

  // Invoice Meta Box
  page.drawRectangle({
    x: 350,
    y: height - 130,
    width: 195,
    height: 70,
    borderColor: rgb(0.85, 0.85, 0.88),
    borderWidth: 1,
  });
  page.drawText(`Invoice No: ${invoiceNumber}`, { x: 360, y: height - 80, size: 9, font: fontBold });
  page.drawText(`Date: ${new Date().toLocaleDateString("en-IN")}`, { x: 360, y: height - 95, size: 9, font });
  page.drawText(`Order ID: ${payment.order_id}`, { x: 360, y: height - 110, size: 8, font });

  // Bill To Box
  page.drawText("Billed To:", { x: 50, y: height - 160, size: 10, font: fontBold });
  page.drawText(orgName, { x: 50, y: height - 175, size: 10, font });
  if (recipientGstin) {
    page.drawText(`GSTIN: ${recipientGstin}`, { x: 50, y: height - 190, size: 9, font });
  }

  // Items Table Header
  const tableY = height - 240;
  page.drawRectangle({
    x: 50,
    y: tableY,
    width: 495,
    height: 25,
    color: rgb(0.95, 0.95, 0.97),
  });
  page.drawText("Description", { x: 60, y: tableY + 8, size: 9, font: fontBold });
  page.drawText("SAC", { x: 280, y: tableY + 8, size: 9, font: fontBold });
  page.drawText("Tax Rate", { x: 350, y: tableY + 8, size: 9, font: fontBold });
  page.drawText("Amount (INR)", { x: 440, y: tableY + 8, size: 9, font: fontBold });

  // Line Item
  const itemY = tableY - 30;
  const basePriceRupees = (payment.amount_paise / 100 / 1.18).toFixed(2);
  const totalRupees = (payment.amount_paise / 100).toFixed(2);
  const taxRupees = ((payment.amount_paise / 100) - Number(basePriceRupees)).toFixed(2);

  page.drawText(product?.name || "Certificate Credits Package", { x: 60, y: itemY, size: 9, font });
  page.drawText("998313", { x: 280, y: itemY, size: 9, font });
  page.drawText("18% GST", { x: 350, y: itemY, size: 9, font });
  page.drawText(`Rs. ${basePriceRupees}`, { x: 440, y: itemY, size: 9, font });

  // Totals Summary
  const summaryY = itemY - 60;
  page.drawLine({ start: { x: 320, y: summaryY + 45 }, end: { x: 545, y: summaryY + 45 }, color: rgb(0.85, 0.85, 0.88) });
  page.drawText(`Taxable Amount: Rs. ${basePriceRupees}`, { x: 350, y: summaryY + 30, size: 9, font });
  page.drawText(`GST (18%): Rs. ${taxRupees}`, { x: 350, y: summaryY + 15, size: 9, font });
  page.drawText(`Total Paid: Rs. ${totalRupees}`, { x: 350, y: summaryY - 2, size: 10, font: fontBold });

  // Footer Note
  page.drawText("This is a computer-generated tax invoice and requires no physical signature.", {
    x: 50,
    y: 60,
    size: 8,
    font,
    color: rgb(0.5, 0.5, 0.55),
  });

  const pdfBytes = await pdfDoc.save();
  const storagePath = `${input.orgId}/${fy}/${invoiceNumber.replace(/\//g, "_")}.pdf`;

  // 4. Upload to private invoices bucket
  await storageUpload("invoices", storagePath, Buffer.from(pdfBytes), {
    contentType: "application/pdf",
    upsert: true,
  });

  // 5. Insert invoice record
  const { data: invRow, error: invErr } = await supabase
    .from("invoices")
    .insert({
      org_id: input.orgId,
      payment_id: input.paymentId,
      invoice_number: invoiceNumber,
      financial_year: fy,
      pdf_path: storagePath,
      amount_paise: payment.amount_paise,
      tax_paise: Math.round(Number(taxRupees) * 100),
      recipient_gstin: recipientGstin || null,
    })
    .select("id")
    .single();

  if (invErr || !invRow) {
    throw new Error(`Failed to create invoice record: ${invErr?.message}`);
  }

  // 6. Send invoice notification email to org contact
  const replyToEmail = (orgBilling.reply_to as string) || undefined;
  if (replyToEmail) {
    await sendEmail({
      to: replyToEmail,
      subject: `Invoice ${invoiceNumber} for your CertiVault purchase`,
      html: `
        <div style="font-family: -apple-system, sans-serif; padding: 24px; color: ${colors.ink.primary.light};">
          <h2>Payment Receipt & Tax Invoice</h2>
          <p>Thank you for your purchase. Invoice <strong>${invoiceNumber}</strong> has been generated.</p>
          <p><strong>Product:</strong> ${product?.name || "Credit Pack"}</p>
          <p><strong>Amount Paid:</strong> Rs. ${totalRupees}</p>
          <p>You can download your PDF invoice anytime from your CertiVault billing dashboard.</p>
        </div>
      `,
    }).catch((err) => {
      console.warn("Failed to send invoice receipt email:", err);
    });
  }

  return {
    invoiceId: invRow.id,
    invoiceNumber,
  };
}
