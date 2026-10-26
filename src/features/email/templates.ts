import { colors } from "@/lib/tokens";

export interface CertificateDeliveryEmailProps {
  recipientName: string;
  orgName: string;
  certificateTitle: string;
  verifyUrl: string;
  publicId: string;
  customMessage?: string;
}

export function renderCertificateDeliveryEmail({
  recipientName,
  orgName,
  certificateTitle,
  verifyUrl,
  publicId,
  customMessage,
}: CertificateDeliveryEmailProps): { html: string; text: string } {
  const text = `Hi ${recipientName},\n\nYour official certificate for "${certificateTitle}" from ${orgName} has been issued.\n\nView and verify your certificate here:\n${verifyUrl}\n\nCertificate ID: ${publicId}\n\nPowered by CertiVault.`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Certificate from ${orgName}</title>
    </head>
    <body style="margin: 0; padding: 32px 16px; background-color: ${colors.canvas.light}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: ${colors.ink.primary.light};">
      <div style="max-width: 560px; margin: 0 auto; background-color: ${colors.surface.light}; border-radius: 16px; border: 1px solid ${colors.hairline.light}; padding: 36px 32px; box-shadow: 0 4px 16px rgba(0,0,0,0.04);">
        <div style="margin-bottom: 24px;">
          <span style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: ${colors.ink.secondary.light};">
            ${orgName}
          </span>
          <h1 style="font-size: 24px; font-weight: 700; color: ${colors.ink.primary.light}; margin: 8px 0 0 0; line-height: 1.25;">
            Your Certificate is Ready
          </h1>
        </div>

        <p style="font-size: 16px; line-height: 24px; color: ${colors.ink.secondary.light}; margin-bottom: 24px;">
          Congratulations, <strong>${recipientName}</strong>! Your official certificate for <strong>${certificateTitle}</strong> has been issued and permanently anchored in the CertiVault trust registry.
        </p>

        ${
          customMessage
            ? `<div style="padding: 16px; border-radius: 12px; background-color: ${colors.canvas.light}; margin-bottom: 28px; font-size: 14px; line-height: 22px; color: ${colors.ink.primary.light};">
                ${customMessage}
              </div>`
            : ""
        }

        <div style="margin: 32px 0; text-align: center;">
          <a href="${verifyUrl}" style="background-color: ${colors.accent.ultramarine.light}; color: ${colors.surface.light}; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: 600; font-size: 15px; display: inline-block;">
            View & Verify Certificate
          </a>
        </div>

        <div style="border-top: 1px solid ${colors.hairline.light}; padding-top: 20px; font-size: 12px; color: ${colors.ink.secondary.light}; line-height: 20px;">
          <div><strong>Certificate ID:</strong> <span style="font-family: monospace;">${publicId}</span></div>
          <div><strong>Instant Verification:</strong> Anyone can scan your certificate QR code or visit the link above to verify its authenticity.</div>
        </div>
      </div>

      <div style="max-width: 560px; margin: 20px auto 0 auto; text-align: center; font-size: 11px; color: ${colors.ink.secondary.light};">
        Sent via <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://certivault.venopai.in"}" style="color: ${colors.ink.secondary.light}; text-decoration: underline;">CertiVault</a> — Tamper-Proof Digital Credentials.
      </div>
    </body>
    </html>
  `;

  return { html, text };
}

export interface BatchCompleteEmailProps {
  orgName: string;
  batchName: string;
  total: number;
  generated: number;
  failed: number;
  batchUrl: string;
}

export function renderBatchCompleteEmail({
  orgName,
  batchName,
  total,
  generated,
  failed,
  batchUrl,
}: BatchCompleteEmailProps): { html: string; text: string } {
  const text = `Batch "${batchName}" complete!\n\n${generated} of ${total} certificates generated successfully.${failed > 0 ? ` (${failed} failed)` : ""}\n\nView batch:\n${batchUrl}\n\nCertiVault.`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head><meta charset="utf-8"><title>Batch Completed</title></head>
    <body style="margin: 0; padding: 32px 16px; background-color: ${colors.canvas.light}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 560px; margin: 0 auto; background-color: ${colors.surface.light}; border-radius: 16px; border: 1px solid ${colors.hairline.light}; padding: 32px;">
        <h1 style="font-size: 22px; font-weight: 700; color: ${colors.ink.primary.light}; margin-top: 0;">
          Batch Issuance Finished
        </h1>
        <p style="font-size: 15px; color: ${colors.ink.secondary.light}; line-height: 22px;">
          Your batch <strong>${batchName}</strong> for <strong>${orgName}</strong> has completed generation.
        </p>
        <div style="display: flex; gap: 12px; margin: 24px 0;">
          <div style="flex: 1; padding: 12px; background-color: ${colors.canvas.light}; border-radius: 8px; text-align: center;">
            <div style="font-size: 12px; color: ${colors.ink.secondary.light};">Total</div>
            <div style="font-size: 20px; font-weight: 700; color: ${colors.ink.primary.light};">${total}</div>
          </div>
          <div style="flex: 1; padding: 12px; background-color: ${colors.canvas.light}; border-radius: 8px; text-align: center;">
            <div style="font-size: 12px; color: ${colors.seal.verified.light};">Issued</div>
            <div style="font-size: 20px; font-weight: 700; color: ${colors.seal.verified.light};">${generated}</div>
          </div>
          <div style="flex: 1; padding: 12px; background-color: ${colors.canvas.light}; border-radius: 8px; text-align: center;">
            <div style="font-size: 12px; color: ${colors.danger.light};">Failed</div>
            <div style="font-size: 20px; font-weight: 700; color: ${colors.danger.light};">${failed}</div>
          </div>
        </div>
        <div style="text-align: center; margin-top: 28px;">
          <a href="${batchUrl}" style="background-color: ${colors.accent.ultramarine.light}; color: ${colors.surface.light}; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-weight: 600; font-size: 14px; display: inline-block;">
            Open Batch Registry
          </a>
        </div>
      </div>
    </body>
    </html>
  `;

  return { html, text };
}

export interface TeamInviteEmailProps {
  inviterName: string;
  orgName: string;
  role: string;
  inviteUrl: string;
}

export function renderTeamInviteEmail({
  inviterName,
  orgName,
  role,
  inviteUrl,
}: TeamInviteEmailProps): { html: string; text: string } {
  const text = `${inviterName} has invited you to join ${orgName} as ${role} on CertiVault.\n\nAccept invite:\n${inviteUrl}\n`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head><meta charset="utf-8"><title>Team Invitation</title></head>
    <body style="margin: 0; padding: 32px 16px; background-color: ${colors.canvas.light}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 560px; margin: 0 auto; background-color: ${colors.surface.light}; border-radius: 16px; border: 1px solid ${colors.hairline.light}; padding: 32px;">
        <h1 style="font-size: 22px; font-weight: 700; color: ${colors.ink.primary.light}; margin-top: 0;">
          Join ${orgName} on CertiVault
        </h1>
        <p style="font-size: 15px; color: ${colors.ink.secondary.light}; line-height: 22px;">
          <strong>${inviterName}</strong> has invited you to collaborate on <strong>${orgName}</strong> with the role of <strong>${role}</strong>.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${inviteUrl}" style="background-color: ${colors.accent.ultramarine.light}; color: ${colors.surface.light}; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: 600; font-size: 15px; display: inline-block;">
            Accept Invitation
          </a>
        </div>
        <p style="font-size: 12px; color: ${colors.ink.secondary.light};">
          This invitation will expire in 7 days. If you were not expecting this, you can ignore this email.
        </p>
      </div>
    </body>
    </html>
  `;

  return { html, text };
}
