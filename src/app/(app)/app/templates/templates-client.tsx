"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LargeTitleHeader } from "@/components/ui/large-title-header";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import {
  TemplateRecord,
  createTemplateAction,
  duplicateTemplateAction,
  renderTemplatePreviewAction,
} from "@/features/templates/actions";
import { PresetDefinition } from "@/server/presets";
import {
  LayoutTemplate,
  Plus,
  Copy,
  Eye,
  FileCheck2,
  ExternalLink,
} from "lucide-react";

interface TemplatesClientViewProps {
  orgId: string;
  initialTemplates: TemplateRecord[];
  presets: PresetDefinition[];
  userRole: string;
}

export function TemplatesClientView({
  orgId,
  initialTemplates,
  presets,
  userRole,
}: TemplatesClientViewProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const isPrivileged = userRole === "owner" || userRole === "admin" || userRole === "issuer";

  const [activeTab, setActiveTab] = useState<"all" | "mine" | "presets">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [templates, setTemplates] = useState<TemplateRecord[]>(initialTemplates);

  // Preview Modal
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState("");

  // New Preset Modal
  const [isNewPresetOpen, setIsNewPresetOpen] = useState(false);
  const [creatingFromPreset, setCreatingFromPreset] = useState(false);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return templates.filter((tpl) => {
      // Tab filter
      if (activeTab === "mine" && !tpl.org_id) return false;
      if (activeTab === "presets" && tpl.org_id) return false;

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          tpl.name.toLowerCase().includes(query) ||
          tpl.page_size.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [templates, activeTab, searchQuery]);

  // Handle Live Preview
  const handlePreview = async (template: TemplateRecord) => {
    setPreviewTitle(template.name);
    try {
      const dataUrl = await renderTemplatePreviewAction(template.schema);
      setPreviewUrl(dataUrl);
    } catch (err: unknown) {
      showToast({
        title: "Preview Failed",
        description: err instanceof Error ? err.message : "Could not render template preview.",
        variant: "error",
      });
    }
  };

  // Handle Duplicate
  const handleDuplicate = async (template: TemplateRecord) => {
    if (!isPrivileged) return;

    try {
      const res = await duplicateTemplateAction(template.id, orgId);
      setTemplates((prev) => [res.template, ...prev]);

      showToast({
        title: "Template Cloned",
        description: `Created copy: ${res.template.name}.`,
        variant: "success",
      });
    } catch (err: unknown) {
      showToast({
        title: "Cloning Failed",
        description: err instanceof Error ? err.message : "Error copying template.",
        variant: "error",
      });
    }
  };

  // Handle Create From Preset
  const handleCreateFromPreset = async (preset: PresetDefinition) => {
    if (!isPrivileged) return;

    setCreatingFromPreset(true);
    try {
      const res = await createTemplateAction({
        orgId,
        name: preset.name,
        pageSize: preset.pageSize,
        schema: preset.schema,
        fieldKeys: preset.fieldKeys,
      });

      setTemplates((prev) => [res.template, ...prev]);
      setIsNewPresetOpen(false);

      showToast({
        title: "Template Created",
        description: `Created custom template from ${preset.name}.`,
        variant: "success",
      });

      router.push(`/app/templates/${res.template.id}`);
    } catch (err: unknown) {
      showToast({
        title: "Creation Failed",
        description: err instanceof Error ? err.message : "Error creating template.",
        variant: "error",
      });
    } finally {
      setCreatingFromPreset(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <LargeTitleHeader
          title="Certificate Templates"
          subtitle="Design, customize, and manage verifiable certificate layouts."
        />

        {isPrivileged && (
          <Dialog open={isNewPresetOpen} onOpenChange={setIsNewPresetOpen}>
            <DialogTrigger asChild>
              <Button variant="primary" size="md" leftIcon={<Plus className="w-4 h-4" />}>
                New Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[85dvh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Choose a Starter Template</DialogTitle>
                <DialogDescription>
                  Start with an Apple-style preset, or customize borders and typography.
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {presets.map((preset) => (
                  <div
                    key={preset.name}
                    className="flex flex-col justify-between p-4 rounded-control border border-hairline bg-surface hover:bg-surface-raised transition-colors space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm text-ink">{preset.name}</h4>
                        <Badge variant="neutral">{preset.pageSize}</Badge>
                      </div>
                      <p className="text-xs text-ink-secondary mt-1 line-clamp-2">
                        {preset.description}
                      </p>
                    </div>

                    <Button
                      size="sm"
                      variant="tinted"
                      disabled={creatingFromPreset}
                      onClick={() => handleCreateFromPreset(preset)}
                      className="w-full"
                    >
                      Use Preset
                    </Button>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="max-w-md">
          <SegmentedControl
            options={[
              { value: "all", label: "All Templates" },
              { value: "mine", label: "My Custom" },
              { value: "presets", label: "Presets" },
            ]}
            value={activeTab}
            onChange={(val) => setActiveTab(val as "all" | "mine" | "presets")}
          />
        </div>

        <div className="w-full sm:w-64">
          <Field
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <EmptyState
          icon={LayoutTemplate}
          title="No templates found"
          description="Try adjusting your filter or search query to find your certificate templates."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => {
            const isPreset = !template.org_id;

            return (
              <div
                key={template.id}
                className="flex flex-col justify-between overflow-hidden rounded-card border border-hairline bg-surface p-5 shadow-sm hover:border-accent/40 transition-all space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant={isPreset ? "accent" : "verified"}>
                      {isPreset ? "Preset" : "Custom"}
                    </Badge>
                    <span className="text-xs font-mono text-ink-secondary">
                      {template.page_size}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-ink line-clamp-1">
                      {template.name}
                    </h3>
                    <p className="text-xs text-ink-secondary mt-1">
                      {template.field_keys?.length || 0} fields mapped (includes QR & ID)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-hairline">
                  <Button
                    size="sm"
                    variant="secondary"
                    leftIcon={<Eye className="w-3.5 h-3.5" />}
                    onClick={() => handlePreview(template)}
                    className="flex-1"
                  >
                    Preview
                  </Button>

                  {isPreset ? (
                    <Button
                      size="sm"
                      variant="tinted"
                      leftIcon={<Copy className="w-3.5 h-3.5" />}
                      onClick={() => handleDuplicate(template)}
                      className="flex-1"
                    >
                      Clone & Edit
                    </Button>
                  ) : (
                    <Link href={`/app/templates/${template.id}`} className="flex-1">
                      <Button
                        size="sm"
                        variant="primary"
                        leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
                        className="w-full"
                      >
                        Edit
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PDF Live Preview Modal */}
      {previewUrl && (
        <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
          <DialogContent className="max-w-4xl h-[90dvh] flex flex-col p-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-seal" />
                <span>Preview: {previewTitle}</span>
              </DialogTitle>
              <DialogDescription>
                High fidelity vector PDF preview generated with embedded fonts and Crockford ID.
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 rounded-control overflow-hidden border border-hairline mt-3 bg-canvas">
              <iframe
                src={previewUrl}
                title="Certificate PDF Preview"
                className="w-full h-full border-0"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
