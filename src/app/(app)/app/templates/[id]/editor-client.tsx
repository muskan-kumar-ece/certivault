"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { LargeTitleHeader } from "@/components/ui/large-title-header";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import {
  TemplateRecord,
  updateTemplateAction,
  renderTemplatePreviewAction,
} from "@/features/templates/actions";
import { validateTemplateUsability } from "@/lib/schemas/template";
import {
  Save,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Monitor,
  Trash2,
  Plus,
} from "lucide-react";

interface TemplateEditorClientViewProps {
  orgId: string;
  template: TemplateRecord;
  userRole: string;
}

interface SchemaField {
  name: string;
  type: string;
  position: { x: number; y: number };
  width: number;
  height: number;
  fontSize?: number;
  alignment?: "left" | "center" | "right";
  fontName?: string;
}

export function TemplateEditorClientView({
  orgId,
  template,
  userRole,
}: TemplateEditorClientViewProps) {
  const { showToast } = useToast();
  const isPrivileged = userRole === "owner" || userRole === "admin" || userRole === "issuer";
  const isPreset = !template.org_id;

  const [name, setName] = useState(template.name);
  const [pageSize, setPageSize] = useState(template.page_size);
  const [schema, setSchema] = useState<Record<string, unknown>>(template.schema);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  // Stress test toggle
  const [stressTestName, setStressTestName] = useState(false);

  // Extract fields from schema
  const schemasArray = ((schema.schemas as unknown[]) || []) as SchemaField[][];
  const currentFields: SchemaField[] = schemasArray[0] || [];

  // Usability validation
  const usability = validateTemplateUsability(schema);

  // Render preview
  const refreshPreview = React.useCallback(async (updatedSchema: Record<string, unknown>, useStressTest = false) => {
    setLoadingPreview(true);
    try {
      const sample: Record<string, string> = useStressTest
        ? { recipient_name: "Dr. Venkata Ramanujam Sriharsha Subramanian" }
        : {};
      const dataUrl = await renderTemplatePreviewAction(updatedSchema, sample);
      setPreviewUrl(dataUrl);
    } catch (err: unknown) {
      console.warn("Preview render error:", err);
    } finally {
      setLoadingPreview(false);
    }
  }, []);

  useEffect(() => {
    refreshPreview(schema, stressTestName);
  }, [schema, stressTestName, refreshPreview]);

  // Handle Save
  const handleSave = async () => {
    if (isPreset || !isPrivileged) return;

    if (!usability.usable) {
      showToast({
        title: "Cannot Save Template",
        description: `Missing required verification fields: ${usability.missingFields.join(", ")}.`,
        variant: "error",
      });
      return;
    }

    setSaving(true);
    try {
      const fieldKeys = currentFields.map((f) => f.name);
      await updateTemplateAction({
        id: template.id,
        orgId,
        name,
        pageSize: pageSize as "A4-landscape" | "A4-portrait" | "A3-landscape" | "custom",
        schema,
        fieldKeys,
      });

      showToast({
        title: "Template Saved",
        description: "Your layout changes have been saved.",
        variant: "success",
      });
    } catch (err: unknown) {
      showToast({
        title: "Save Failed",
        description: err instanceof Error ? err.message : "Error saving template.",
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  // Update a single field in schema
  const handleFieldChange = (index: number, updates: Partial<SchemaField>) => {
    const nextFields = [...currentFields];
    nextFields[index] = { ...nextFields[index], ...updates };

    const nextSchema = {
      ...schema,
      schemas: [nextFields],
    };
    setSchema(nextSchema);
  };

  // Add field
  const handleAddField = () => {
    const fieldName = `field_${currentFields.length + 1}`;
    const newField: SchemaField = {
      name: fieldName,
      type: "text",
      position: { x: 30, y: 130 },
      width: 100,
      height: 15,
      fontSize: 14,
      fontName: "Inter",
      alignment: "left",
    };

    const nextSchema = {
      ...schema,
      schemas: [[...currentFields, newField]],
    };
    setSchema(nextSchema);
  };

  // Remove field
  const handleRemoveField = (index: number) => {
    const nextFields = currentFields.filter((_, i) => i !== index);
    const nextSchema = {
      ...schema,
      schemas: [nextFields],
    };
    setSchema(nextSchema);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-hairline pb-4">
        <div>
          <Link
            href="/app/templates"
            className="text-xs font-semibold text-accent hover:underline mb-1 inline-block"
          >
            ← Back to Templates
          </Link>
          <LargeTitleHeader
            title={name}
            subtitle={isPreset ? "Read-only Platform Preset" : "Custom Layout Editor"}
          />
        </div>

        <div className="flex items-center gap-3">
          {usability.usable ? (
            <Badge variant="verified">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verifiable
              </span>
            </Badge>
          ) : (
            <Badge variant="danger">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Missing QR/ID
              </span>
            </Badge>
          )}

          {!isPreset && isPrivileged && (
            <Button
              variant="primary"
              size="md"
              loading={saving}
              onClick={handleSave}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Template
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Notice Banner (PRD §7.6) */}
      <div className="block lg:hidden rounded-control bg-accent/10 border border-accent/20 p-3.5 text-xs text-ink flex items-start gap-2.5">
        <Monitor className="w-4 h-4 text-accent shrink-0 mt-0.5" />
        <span>
          <strong>Design on desktop:</strong> Move fields, adjust coordinates, and preview fonts on a tablet or computer for pixel-perfect drag control.
        </span>
      </div>

      {/* Main Grid: Left Preview + Right Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Live Vector PDF Preview */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-ink">Live Vector Preview</span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={stressTestName ? "tinted" : "secondary"}
                onClick={() => setStressTestName(!stressTestName)}
              >
                {stressTestName ? "Long Name Stress: ON" : "Stress Test Name"}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => refreshPreview(schema, stressTestName)}
                leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loadingPreview ? "animate-spin" : ""}`} />}
              >
                Refresh
              </Button>
            </div>
          </div>

          <div className="w-full aspect-[1.414/1] rounded-card border border-hairline bg-surface overflow-hidden shadow-sm flex items-center justify-center">
            {previewUrl ? (
              <iframe
                src={previewUrl}
                title="Template Live Preview"
                className="w-full h-full border-0"
              />
            ) : (
              <span className="text-xs text-ink-secondary">Generating vector preview...</span>
            )}
          </div>
        </div>

        {/* Right: Field Inspector */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-card border border-hairline bg-surface p-5 space-y-4">
            <h3 className="font-bold text-base text-ink">Template Properties</h3>

            <Field
              label="Template Name"
              disabled={isPreset || !isPrivileged}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <Select
              label="Orientation & Size"
              disabled={isPreset || !isPrivileged}
              value={pageSize}
              onValueChange={setPageSize}
              options={[
                { value: "A4-landscape", label: "A4 Landscape (297 × 210 mm)" },
                { value: "A4-portrait", label: "A4 Portrait (210 × 297 mm)" },
              ]}
            />
          </div>

          {/* Fields list */}
          <div className="rounded-card border border-hairline bg-surface p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-ink">
                Fields ({currentFields.length})
              </h3>
              {!isPreset && isPrivileged && (
                <Button
                  size="sm"
                  variant="tinted"
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  onClick={handleAddField}
                >
                  Add Field
                </Button>
              )}
            </div>

            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {currentFields.map((field, idx) => (
                <div
                  key={`${field.name}-${idx}`}
                  className="rounded-control border border-hairline bg-canvas p-3 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-ink">{field.name}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant={field.type === "qrcode" ? "verified" : "neutral"}>
                        {field.type}
                      </Badge>
                      {!isPreset && isPrivileged && field.name !== "qr" && field.name !== "id" && (
                        <button
                          type="button"
                          onClick={() => handleRemoveField(idx)}
                          className="text-ink-secondary hover:text-danger p-1"
                          aria-label={`Remove field ${field.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {field.type === "text" && (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <label htmlFor={`font-name-${idx}`} className="text-[10px] text-ink-secondary block">Font</label>
                        <select
                          id={`font-name-${idx}`}
                          name={`fontName_${idx}`}
                          disabled={isPreset || !isPrivileged}
                          value={field.fontName || "Inter"}
                          onChange={(e) =>
                            handleFieldChange(idx, { fontName: e.target.value })
                          }
                          className="w-full bg-surface border border-hairline rounded px-1.5 py-1 text-xs"
                        >
                          <option value="Inter">Inter (Sans-serif)</option>
                          <option value="PlayfairDisplay">Playfair Display (Serif)</option>
                          <option value="NotoSansDevanagari">Noto Devanagari (Hindi)</option>
                          <option value="NotoSansTelugu">Noto Telugu</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor={`font-size-${idx}`} className="text-[10px] text-ink-secondary block">Font Size (pt)</label>
                        <input
                          id={`font-size-${idx}`}
                          name={`fontSize_${idx}`}
                          type="number"
                          disabled={isPreset || !isPrivileged}
                          value={field.fontSize || 12}
                          onChange={(e) =>
                            handleFieldChange(idx, { fontSize: Number(e.target.value) })
                          }
                          className="w-full bg-surface border border-hairline rounded px-1.5 py-1 text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
