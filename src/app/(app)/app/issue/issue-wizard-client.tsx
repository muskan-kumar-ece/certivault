"use client";

import React, { useState, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Coins,
  Send,
  Loader2,
  Sparkles,
  RefreshCw,
  FileCheck,
} from "lucide-react";
import { Stepper } from "@/components/ui/stepper";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileDropZone } from "@/components/ui/file-drop-zone";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import {
  parseCSV,
  parseExcel,
  autoMatchColumns,
  sanitizeAndValidateRows,
  type ParsedRow,
  type ParseResult,
} from "@/features/issue/parser";
import {
  saveDraftBatchAction,
  issueBatchAction,
  sendTestCertificateAction,
  getBatchProgressAction,
} from "@/features/issue/actions";

interface TemplateItem {
  id: string;
  name: string;
  page_size: string;
  description: string;
  field_keys: string[];
  thumbnail_path?: string;
  org_id?: string | null;
  schema: Record<string, unknown>;
}

interface IssueWizardClientProps {
  org: {
    id: string;
    name: string;
    credit_balance: number;
    brand_color: string;
  };
  userRole: string;
  templates: TemplateItem[];
  initialStep?: number;
  initialBatchId?: string;
}

const STEPS = [
  { label: "Template", description: "Choose design" },
  { label: "Recipients", description: "Import CSV/XLSX" },
  { label: "Match", description: "Align columns" },
  { label: "Review", description: "Audit & costs" },
  { label: "Issue", description: "Delivery mode" },
];

export function IssueWizardClient({
  org,
  userRole: _userRole,
  templates,
  initialStep = 1,
  initialBatchId,
}: IssueWizardClientProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [step, setStep] = useState(initialStep);
  const [isPending, startTransition] = useTransition();

  // Wizard state
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    templates[0]?.id || ""
  );
  const [batchName, setBatchName] = useState("Batch " + new Date().toLocaleDateString("en-IN"));
  const [fileHeaders, setFileHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [validCount, setValidCount] = useState(0);
  const [invalidCount, setInvalidCount] = useState(0);

  // Delivery options
  const [deliveryMode, setDeliveryMode] = useState<"email" | "none">("email");
  const [emailSubject, setEmailSubject] = useState(`Your certificate from ${org.name}`);
  const [emailBody, setEmailBody] = useState(
    `Congratulations! Your official certificate from ${org.name} has been issued and is available for instant verification.`
  );

  // Batch lifecycle & active issue tracking
  const [activeBatchId, setActiveBatchId] = useState<string | undefined>(initialBatchId);
  const [isIssuing, setIsIssuing] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{
    status: string;
    total: number;
    generated: number;
    failed: number;
  } | null>(null);

  // Test certificate state
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-match columns whenever template or file headers change
  useEffect(() => {
    if (selectedTemplate && fileHeaders.length > 0) {
      const templateKeys = ["recipient_name", "recipient_email", ...(selectedTemplate.field_keys || [])];
      const mapping = autoMatchColumns(templateKeys, fileHeaders);
      setColumnMapping(mapping);
    }
  }, [selectedTemplate, fileHeaders]);

  // Re-run validation whenever mapping or rawRows change
  useEffect(() => {
    if (rawRows.length > 0) {
      const res = sanitizeAndValidateRows(fileHeaders, rawRows, columnMapping);
      setParsedRows(res.rows);
      setValidCount(res.validCount);
      setInvalidCount(res.invalidCount);
    }
  }, [columnMapping, rawRows, fileHeaders]);

  // File import handler (CSV & Excel)
  const handleSingleFileUpload = async (file: File) => {
    const extension = file.name.split(".").pop()?.toLowerCase();

    try {
      let result: ParseResult;
      if (extension === "xlsx" || extension === "xls") {
        const buffer = await file.arrayBuffer();
        result = parseExcel(buffer);
      } else {
        const text = await file.text();
        result = parseCSV(text);
      }

      if (!result.headers.length || !result.rows.length) {
        showToast({ title: "File empty", description: "File contains no recognizable rows.", variant: "error" });
        return;
      }

      setFileHeaders(result.headers);
      setRawRows(result.rows.map((r) => r.raw));
      showToast({ title: "File imported", description: `Loaded ${result.totalRows} rows from ${file.name}`, variant: "success" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to parse file";
      showToast({ title: "Import failed", description: msg, variant: "error" });
    }
  };

  // Handle manual data paste
  const handlePasteData = (pastedText: string) => {
    if (!pastedText.trim()) return;
    try {
      const result = parseCSV(pastedText);
      if (result.headers.length && result.rows.length) {
        setFileHeaders(result.headers);
        setRawRows(result.rows.map((r) => r.raw));
        showToast({ title: "Data loaded", description: `Parsed ${result.totalRows} rows from paste`, variant: "success" });
      } else {
        showToast({ title: "Parse error", description: "Ensure data is tab/comma separated with a header row.", variant: "error" });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to parse pasted data";
      showToast({ title: "Error", description: msg, variant: "error" });
    }
  };

  // Next step handler
  const handleContinue = () => {
    if (step === 1) {
      if (!selectedTemplateId) {
        showToast({ title: "Template required", description: "Please select a template to continue.", variant: "warning" });
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!rawRows.length) {
        showToast({ title: "Recipients required", description: "Upload a spreadsheet or paste recipient rows.", variant: "warning" });
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!columnMapping.recipient_name) {
        showToast({ title: "Column mapping needed", description: "Match a column for Recipient Name.", variant: "warning" });
        return;
      }
      setStep(4);
    } else if (step === 4) {
      if (validCount === 0) {
        showToast({ title: "No valid rows", description: "Please fix validation errors to continue.", variant: "error" });
        return;
      }
      // Save draft batch to server
      startTransition(async () => {
        try {
          const validRecipients = parsedRows
            .filter((r) => r.isValid)
            .map((r) => ({
              name: r.name,
              email: r.email || "",
              fields: r.fields,
            }));

          const res = await saveDraftBatchAction({
            batchId: activeBatchId,
            orgId: org.id,
            templateId: selectedTemplateId,
            name: batchName,
            deliveryMode,
            emailSubject,
            emailBody,
            recipients: validRecipients,
          });

          setActiveBatchId(res.batchId);
          setStep(5);
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Failed to save draft";
          showToast({ title: "Save failed", description: msg, variant: "error" });
        }
      });
    }
  };

  // Final issue action execution
  const handleExecuteIssue = async () => {
    if (!activeBatchId) {
      showToast({ title: "Draft missing", description: "Please review the batch again.", variant: "error" });
      return;
    }

    setConfirmDialogOpen(false);
    setIsIssuing(true);

    try {
      await issueBatchAction({
        batchId: activeBatchId,
        orgId: org.id,
      });

      showToast({ title: "Issuance started", description: `Queued ${validCount} certificates for generation.`, variant: "success" });

      // Begin polling for progress
      pollIntervalRef.current = setInterval(async () => {
        try {
          const progress = await getBatchProgressAction(activeBatchId, org.id);
          setBatchProgress({
            status: progress.status,
            total: progress.total,
            generated: progress.generated,
            failed: progress.failed,
          });

          if (
            progress.status === "completed" ||
            progress.status === "completed_with_errors" ||
            progress.status === "failed"
          ) {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          }
        } catch {
          // Keep polling
        }
      }, 2000);
    } catch (err: unknown) {
      setIsIssuing(false);
      const msg = err instanceof Error ? err.message : "Failed to issue batch";
      showToast({ title: "Issuance error", description: msg, variant: "error" });
    }
  };

  // Clean up poll on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  // Send single test certificate
  const handleSendTestCertificate = async () => {
    if (!selectedTemplateId) return;
    setIsSendingTest(true);

    try {
      const res = await sendTestCertificateAction({
        orgId: org.id,
        templateId: selectedTemplateId,
        recipientName: "Test Student (Sample)",
        email: "test@example.com",
        fields: { title: "Sample Workshop Completion", date: new Date().toLocaleDateString("en-IN") },
      });

      showToast({ title: "Test certificate ready", description: `Generated ID: ${res.publicId}`, variant: "success" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send test";
      showToast({ title: "Test send failed", description: msg, variant: "error" });
    } finally {
      setIsSendingTest(false);
    }
  };

  const isShortOnCredits = validCount > org.credit_balance;

  // Active generating view
  if (isIssuing && batchProgress) {
    const isCompleted =
      batchProgress.status === "completed" ||
      batchProgress.status === "completed_with_errors";
    const percent =
      batchProgress.total > 0
        ? Math.round(
            ((batchProgress.generated + batchProgress.failed) / batchProgress.total) *
              100
          )
        : 0;

    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <div className="bg-surface rounded-card p-8 border border-hairline shadow-sm">
          <div className="flex justify-center mb-6">
            <ProgressRing
              progress={percent}
              size={120}
              strokeWidth={8}
              ariaLabel="Generation progress"
            />
          </div>

          <h2 className="text-2xl font-bold text-ink mb-2">
            {isCompleted
              ? "Issuance Complete!"
              : `Generating ${batchProgress.generated} of ${batchProgress.total} Certificates`}
          </h2>

          <p className="text-ink-secondary text-sm mb-6">
            {isCompleted
              ? "All certificates have been rendered and stamped with cryptographic SHA-256 signatures."
              : "Generating tamper-proof PDFs with vector QR codes and cloud storage backup. You can safely navigate away."}
          </p>

          <div className="grid grid-cols-3 gap-4 mb-8 max-w-md mx-auto">
            <div className="p-3 bg-canvas rounded-control text-center">
              <div className="text-xs text-ink-secondary">Total</div>
              <div className="text-lg font-bold text-ink">{batchProgress.total}</div>
            </div>
            <div className="p-3 bg-canvas rounded-control text-center">
              <div className="text-xs text-seal">Generated</div>
              <div className="text-lg font-bold text-seal">{batchProgress.generated}</div>
            </div>
            <div className="p-3 bg-canvas rounded-control text-center">
              <div className="text-xs text-danger">Failed</div>
              <div className="text-lg font-bold text-danger">{batchProgress.failed}</div>
            </div>
          </div>

          {isCompleted ? (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="primary"
                onClick={() => router.push("/app/certificates")}
              >
                View in Certificates Registry
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setIsIssuing(false);
                  setBatchProgress(null);
                  setStep(1);
                  setRawRows([]);
                }}
              >
                Issue Another Batch
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 text-xs text-ink-secondary">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Updating live via Realtime queue worker...</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 pb-28">
      {/* Top Header & Credits Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ink">Issue Certificates</h1>
          <p className="text-ink-secondary text-sm">
            Batch issue tamper-proof certificates with vector QR verification.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-surface rounded-full border border-hairline text-xs font-semibold text-ink">
            <Coins className="w-3.5 h-3.5 text-accent" />
            <span>{org.credit_balance.toLocaleString()} credits available</span>
          </div>
        </div>
      </div>

      {/* 5-Step Stepper Header */}
      <div className="mb-8 bg-surface rounded-card p-4 border border-hairline shadow-sm">
        <Stepper
          steps={STEPS}
          currentStep={step - 1}
          onStepClick={(i) => {
            if (i + 1 < step) setStep(i + 1);
          }}
        />
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {/* STEP 1: CHOOSE TEMPLATE */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-ink">1. Select a Template</h2>
                <Badge variant="accent">{templates.length} templates available</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {templates.map((tpl) => {
                  const isSelected = tpl.id === selectedTemplateId;
                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => setSelectedTemplateId(tpl.id)}
                      className={`relative p-4 rounded-card text-left transition-all border ${
                        isSelected
                          ? "border-accent ring-2 ring-accent/20 bg-surface shadow-md"
                          : "border-hairline bg-surface hover:border-ink-secondary/40"
                      }`}
                    >
                      <div className="aspect-[1.414/1] rounded-control bg-canvas border border-hairline/60 flex items-center justify-center mb-3 overflow-hidden">
                        <FileCheck className={`w-8 h-8 ${isSelected ? "text-accent" : "text-ink-secondary"}`} />
                      </div>

                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-ink text-sm leading-tight mb-1">
                            {tpl.name}
                          </h3>
                          <p className="text-ink-secondary text-xs line-clamp-2">
                            {tpl.description}
                          </p>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                        )}
                      </div>

                      <div className="mt-3 flex items-center gap-1.5">
                        <Badge variant="neutral">
                          {tpl.page_size === "A4-landscape" ? "Landscape" : "Portrait"}
                        </Badge>
                        <Badge variant="neutral">
                          {(tpl.field_keys || []).length} fields
                        </Badge>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: RECIPIENTS IMPORT */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-ink">2. Upload Recipients</h2>
                  <p className="text-xs text-ink-secondary">
                    Import a CSV or Excel (.xlsx) file with your recipient list (up to 5,000 rows).
                  </p>
                </div>
                {rawRows.length > 0 && (
                  <Badge variant="verified">{rawRows.length} rows loaded</Badge>
                )}
              </div>

              <div className="bg-surface rounded-card p-6 border border-hairline shadow-sm">
                <FileDropZone
                  accept=".csv,.xlsx,.xls"
                  onFileSelect={handleSingleFileUpload}
                  title="Drop your recipient CSV or XLSX spreadsheet here"
                  subtitle="First row must contain column headers (e.g. Name, Email, Course, Date)"
                />

                <div className="mt-6 pt-6 border-t border-hairline">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-ink-secondary uppercase tracking-wider">
                      Or Paste Data
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handlePasteData(
                          "Name,Email,Course,Date\nAarav Sharma,aarav@college.edu,AI Engineering,25 Oct 2026\nPriya Patel,priya@college.edu,Web Architecture,25 Oct 2026\nRahul Verma,rahul@college.edu,Cloud Systems,25 Oct 2026"
                        )
                      }
                      className="text-xs text-accent hover:underline flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      Load sample rows
                    </button>
                  </div>

                  <textarea
                    rows={4}
                    placeholder="Paste comma or tab-delimited text with headers..."
                    className="w-full text-xs font-mono p-3 rounded-control border border-hairline bg-canvas text-ink focus:outline-none focus:ring-2 focus:ring-accent"
                    onBlur={(e) => handlePasteData(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: MATCH COLUMNS */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-ink">3. Match Columns</h2>
                  <p className="text-xs text-ink-secondary">
                    Connect each certificate field with the appropriate column from your uploaded file.
                  </p>
                </div>
                <Badge variant="accent">Fuzzy match applied</Badge>
              </div>

              <div className="bg-surface rounded-card p-6 border border-hairline shadow-sm space-y-4">
                {/* Name Mapping (Mandatory) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center p-3 rounded-control bg-canvas border border-hairline">
                  <div>
                    <label className="text-sm font-semibold text-ink flex items-center gap-1.5">
                      <span>Recipient Name</span>
                      <span className="text-danger text-xs">* Required</span>
                    </label>
                    <p className="text-xs text-ink-secondary">
                      Full recipient name printed as primary headline
                    </p>
                  </div>
                  <select
                    value={columnMapping.recipient_name || ""}
                    onChange={(e) =>
                      setColumnMapping({ ...columnMapping, recipient_name: e.target.value })
                    }
                    className="w-full h-10 px-3 text-sm rounded-control border border-hairline bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="">Select column...</option>
                    {fileHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Email Mapping (Optional) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center p-3 rounded-control bg-canvas border border-hairline">
                  <div>
                    <label className="text-sm font-semibold text-ink flex items-center gap-1.5">
                      <span>Recipient Email</span>
                      <span className="text-xs text-ink-secondary">(Optional)</span>
                    </label>
                    <p className="text-xs text-ink-secondary">
                      Used for delivery notifications (never exposed publicly)
                    </p>
                  </div>
                  <select
                    value={columnMapping.recipient_email || ""}
                    onChange={(e) =>
                      setColumnMapping({ ...columnMapping, recipient_email: e.target.value })
                    }
                    className="w-full h-10 px-3 text-sm rounded-control border border-hairline bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="">(None - generate only)</option>
                    {fileHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Template Custom Fields */}
                {(selectedTemplate?.field_keys || []).map((fieldKey) => {
                  if (fieldKey === "recipient_name" || fieldKey === "id" || fieldKey === "qr") {
                    return null;
                  }
                  return (
                    <div
                      key={fieldKey}
                      className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center p-3 rounded-control bg-canvas border border-hairline"
                    >
                      <div>
                        <label className="text-sm font-semibold text-ink capitalize">
                          {fieldKey.replace(/_/g, " ")}
                        </label>
                        <p className="text-xs text-ink-secondary">
                          Dynamic template placeholder
                        </p>
                      </div>
                      <select
                        value={columnMapping[fieldKey] || ""}
                        onChange={(e) =>
                          setColumnMapping({ ...columnMapping, [fieldKey]: e.target.value })
                        }
                        className="w-full h-10 px-3 text-sm rounded-control border border-hairline bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-accent"
                      >
                        <option value="">(Blank / unmapped)</option>
                        {fileHeaders.map((h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & COST SUMMARY */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-ink">4. Review & Audit</h2>
                  <p className="text-xs text-ink-secondary">
                    Verify row validations, preview sample certificates, and review credit costs.
                  </p>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleSendTestCertificate}
                  disabled={isSendingTest}
                  className="flex items-center gap-1.5"
                >
                  {isSendingTest ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Send me a test certificate</span>
                </Button>
              </div>

              {/* Validation Summary Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-surface rounded-card p-4 border border-hairline shadow-sm">
                  <div className="text-xs text-ink-secondary mb-1">Total Recipients</div>
                  <div className="text-2xl font-bold text-ink">{rawRows.length}</div>
                </div>
                <div className="bg-surface rounded-card p-4 border border-hairline shadow-sm">
                  <div className="text-xs text-seal mb-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Valid Rows</span>
                  </div>
                  <div className="text-2xl font-bold text-seal">{validCount}</div>
                </div>
                <div className="bg-surface rounded-card p-4 border border-hairline shadow-sm">
                  <div className="text-xs text-danger mb-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Invalid / Skipped</span>
                  </div>
                  <div className="text-2xl font-bold text-danger">{invalidCount}</div>
                </div>
              </div>

              {/* Cost Summary Box */}
              <div className="bg-surface rounded-card p-6 border border-hairline shadow-sm">
                <h3 className="font-semibold text-ink text-sm mb-4">Credit Cost Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-ink-secondary">
                    <span>Certificates to issue</span>
                    <span className="font-medium text-ink">{validCount}</span>
                  </div>
                  <div className="flex justify-between text-ink-secondary">
                    <span>Credits required (1 per certificate)</span>
                    <span className="font-medium text-ink">{validCount} credits</span>
                  </div>
                  <div className="flex justify-between text-ink-secondary">
                    <span>Available credit balance</span>
                    <span className="font-medium text-ink">{org.credit_balance} credits</span>
                  </div>
                  <div className="pt-3 border-t border-hairline flex justify-between font-bold text-base">
                    <span>Remaining balance after issuing</span>
                    <span
                      className={
                        isShortOnCredits ? "text-danger" : "text-seal"
                      }
                    >
                      {org.credit_balance - validCount} credits
                    </span>
                  </div>
                </div>

                {isShortOnCredits && (
                  <div className="mt-4 p-4 rounded-control bg-danger/10 border border-danger/20 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-danger">Insufficient Credits</h4>
                      <p className="text-xs text-danger/90 mt-0.5">
                        You need {validCount - org.credit_balance} more credits to issue this batch.
                        Add credits from your billing settings to continue.
                      </p>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="mt-3 text-xs"
                        onClick={() => router.push("/app/account/billing")}
                      >
                        Buy Credit Pack
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 5: DELIVERY & FINAL CONFIRM */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-ink">5. Delivery & Confirmation</h2>
                <p className="text-xs text-ink-secondary">
                  Choose delivery method and enter batch name before launching issuance.
                </p>
              </div>

              <div className="bg-surface rounded-card p-6 border border-hairline shadow-sm space-y-6">
                <div>
                  <label className="text-sm font-semibold text-ink mb-1.5 block">
                    Batch Name
                  </label>
                  <input
                    type="text"
                    value={batchName}
                    onChange={(e) => setBatchName(e.target.value)}
                    className="w-full h-11 px-3 text-sm rounded-control border border-hairline bg-canvas text-ink focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="e.g. Annual Symposium 2026"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-ink mb-2 block">
                    Delivery Mode
                  </label>
                  <SegmentedControl
                    options={[
                      { value: "email", label: "Email recipients now" },
                      { value: "none", label: "Generate PDFs only" },
                    ]}
                    value={deliveryMode}
                    onChange={(val) => setDeliveryMode(val as "email" | "none")}
                  />
                </div>

                {deliveryMode === "email" && (
                  <div className="space-y-4 pt-4 border-t border-hairline">
                    <div>
                      <label className="text-sm font-semibold text-ink mb-1.5 block">
                        Email Subject
                      </label>
                      <input
                        type="text"
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        className="w-full h-10 px-3 text-sm rounded-control border border-hairline bg-canvas text-ink focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-ink mb-1.5 block">
                        Email Message
                      </label>
                      <textarea
                        rows={3}
                        value={emailBody}
                        onChange={(e) => setEmailBody(e.target.value)}
                        className="w-full p-3 text-sm rounded-control border border-hairline bg-canvas text-ink focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-surface/80 backdrop-blur-md border-t border-hairline py-3 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button
            variant="secondary"
            onClick={() => setStep((s) => Math.max(s - 1, 1))}
            disabled={step === 1 || isPending}
            className="flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>

          <div className="text-xs text-ink-secondary">
            Step {step} of 5
          </div>

          {step < 5 ? (
            <Button
              variant="primary"
              onClick={handleContinue}
              disabled={isPending || (step === 4 && isShortOnCredits)}
              className="flex items-center gap-1.5"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={() => setConfirmDialogOpen(true)}
              disabled={isPending || isShortOnCredits || validCount === 0}
              className="flex items-center gap-1.5"
            >
              <span>Issue {validCount} certificates</span>
            </Button>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        title="Confirm Certificate Issuance"
        description={`You are about to issue ${validCount} certificates using ${validCount} credits. This action will enqueue generation jobs and cannot be undone.`}
      >
        <div className="py-4 space-y-3">
          <div className="p-3 bg-canvas rounded-control text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-ink-secondary">Batch Name:</span>
              <span className="font-semibold text-ink">{batchName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-secondary">Delivery:</span>
              <span className="font-semibold text-ink">
                {deliveryMode === "email" ? "Instant Email Delivery" : "Generate Only"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-secondary">Credits to reserve:</span>
              <span className="font-semibold text-accent">{validCount} credits</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={() => setConfirmDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleExecuteIssue}>
            Confirm and Issue
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
