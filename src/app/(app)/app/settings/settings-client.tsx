"use client";

import React, { useState } from "react";
import { LargeTitleHeader } from "@/components/ui/large-title-header";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ListRow } from "@/components/ui/list-row";
import { useToast } from "@/components/ui/toast";
import { updateOrgSettingsAction } from "@/features/settings/actions";
import {
  createSignatoryAction,
  deleteSignatoryAction,
  SignatoryItem,
} from "@/features/signatories/actions";
import { PenTool, Plus, Trash2 } from "lucide-react";

interface SettingsClientViewProps {
  orgId: string;
  initialSettings: {
    name: string;
    brandColor: string;
    logoPath: string | null;
    senderName: string;
    replyTo: string;
    retentionDays: number;
    creditBalance: number;
    plan: string;
    verified: boolean;
  };
  initialSignatories: SignatoryItem[];
  userRole: string;
}

export function SettingsClientView({
  orgId,
  initialSettings,
  initialSignatories,
  userRole,
}: SettingsClientViewProps) {
  const { showToast } = useToast();
  const isPrivileged = userRole === "owner" || userRole === "admin";

  // General Settings State
  const [name, setName] = useState(initialSettings.name);
  const [brandColor, setBrandColor] = useState(initialSettings.brandColor);
  const [senderName, setSenderName] = useState(initialSettings.senderName);
  const [replyTo, setReplyTo] = useState(initialSettings.replyTo);
  const [retentionDays, setRetentionDays] = useState(String(initialSettings.retentionDays));
  const [savingSettings, setSavingSettings] = useState(false);

  // Signatories State
  const [signatories, setSignatories] = useState<SignatoryItem[]>(initialSignatories);
  const [isAddSignatoryOpen, setIsAddSignatoryOpen] = useState(false);
  const [newSigName, setNewSigName] = useState("");
  const [newSigTitle, setNewSigTitle] = useState("");
  const [creatingSignatory, setCreatingSignatory] = useState(false);

  // Handle Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPrivileged) return;

    setSavingSettings(true);
    try {
      await updateOrgSettingsAction(orgId, {
        name,
        brandColor,
        senderName: senderName || undefined,
        replyTo: replyTo || undefined,
        retentionDays: Number(retentionDays) || 0,
      });

      showToast({
        title: "Settings Saved",
        description: "Organization profile and email preferences updated.",
        variant: "success",
      });
    } catch (err: unknown) {
      showToast({
        title: "Save Failed",
        description: err instanceof Error ? err.message : "Could not update settings.",
        variant: "error",
      });
    } finally {
      setSavingSettings(false);
    }
  };

  // Handle Create Signatory
  const handleCreateSignatory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSigName.trim() || !isPrivileged) return;

    setCreatingSignatory(true);
    try {
      const res = await createSignatoryAction({
        orgId,
        name: newSigName.trim(),
        title: newSigTitle.trim() || undefined,
      });

      setSignatories((prev) => [...prev, res.signatory]);
      setNewSigName("");
      setNewSigTitle("");
      setIsAddSignatoryOpen(false);

      showToast({
        title: "Signatory Added",
        description: `${res.signatory.name} can now be attached to certificates.`,
        variant: "success",
      });
    } catch (err: unknown) {
      showToast({
        title: "Failed to Add Signatory",
        description: err instanceof Error ? err.message : "Error saving signatory.",
        variant: "error",
      });
    } finally {
      setCreatingSignatory(false);
    }
  };

  // Handle Delete Signatory
  const handleDeleteSignatory = async (signatoryId: string, signatoryName: string) => {
    if (!isPrivileged) return;

    try {
      await deleteSignatoryAction(orgId, signatoryId);
      setSignatories((prev) => prev.filter((s) => s.id !== signatoryId));

      showToast({
        title: "Signatory Removed",
        description: `${signatoryName} has been deleted.`,
        variant: "success",
      });
    } catch (err: unknown) {
      showToast({
        title: "Deletion Failed",
        description: err instanceof Error ? err.message : "Could not delete signatory.",
        variant: "error",
      });
    }
  };

  return (
    <div className="space-y-10">
      <LargeTitleHeader
        title="Organization Settings"
        subtitle="Manage branding, email delivery, signatories, and compliance."
      />

      {/* 1. General Profile & Branding */}
      <section className="space-y-6 rounded-card border border-hairline bg-surface p-6 sm:p-8">
        <div className="flex items-center justify-between border-b border-hairline pb-4">
          <div>
            <h2 className="text-lg font-bold text-ink">Profile & Brand Identity</h2>
            <p className="text-xs text-ink-secondary">
              Configure your organization display name and accent colors.
            </p>
          </div>
          {initialSettings.verified ? (
            <Badge variant="verified">Verified Issuer</Badge>
          ) : (
            <Badge variant="neutral">Unverified</Badge>
          )}
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field
              label="Organization Name"
              required
              disabled={!isPrivileged}
              value={name}
              onChange={(e) => setName(e.target.value)}
              helperText="Appears as issuer on all public verification links."
            />

            <div className="space-y-1.5 text-left">
              <label htmlFor="settings-brand-color" className="block text-xs font-semibold uppercase tracking-wider text-ink-secondary">
                Brand Accent Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="settings-brand-color"
                  name="brandColor"
                  type="color"
                  disabled={!isPrivileged}
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="h-11 w-16 cursor-pointer rounded-control border border-hairline bg-transparent p-1"
                />
                <span className="font-mono text-sm text-ink-secondary">
                  {brandColor.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-ink-secondary">
                Used for verification tags, seals, and email buttons.
              </p>
            </div>
          </div>

          <div className="border-t border-hairline pt-5">
            <h3 className="text-sm font-bold text-ink mb-1">Email Delivery Options</h3>
            <p className="text-xs text-ink-secondary mb-4">
              Emails will be sent as &quot;{senderName || name} via CertiVault&quot;.
            </p>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field
                label="Sender Display Name"
                placeholder={name}
                disabled={!isPrivileged}
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                helperText="Custom sender name in recipient inboxes."
              />
              <Field
                label="Reply-To Email Address"
                type="email"
                placeholder="contact@college.edu"
                disabled={!isPrivileged}
                value={replyTo}
                onChange={(e) => setReplyTo(e.target.value)}
                helperText="Where recipients reply with questions."
              />
            </div>
          </div>

          <div className="border-t border-hairline pt-5">
            <h3 className="text-sm font-bold text-ink mb-1">Data Retention & Compliance</h3>
            <p className="text-xs text-ink-secondary mb-4">
              DPDP Act aligned. Automatically anonymize recipient PII after expiration.
            </p>

            <div className="max-w-xs">
              <Select
                label="PII Retention Period"
                value={retentionDays}
                onValueChange={setRetentionDays}
                options={[
                  { value: "0", label: "Permanent (No auto-deletion)" },
                  { value: "90", label: "90 Days" },
                  { value: "180", label: "180 Days (6 Months)" },
                  { value: "365", label: "365 Days (1 Year)" },
                  { value: "1095", label: "3 Years" },
                ]}
              />
            </div>
          </div>

          {isPrivileged && (
            <div className="flex justify-end pt-4 border-t border-hairline">
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={savingSettings}
              >
                Save Settings
              </Button>
            </div>
          )}
        </form>
      </section>

      {/* 2. Signatories Management */}
      <section className="space-y-6 rounded-card border border-hairline bg-surface p-6 sm:p-8">
        <div className="flex items-center justify-between border-b border-hairline pb-4">
          <div>
            <h2 className="text-lg font-bold text-ink">Authorized Signatories</h2>
            <p className="text-xs text-ink-secondary">
              Signatories and digital signatures to place on generated certificates.
            </p>
          </div>

          {isPrivileged && (
            <Dialog open={isAddSignatoryOpen} onOpenChange={setIsAddSignatoryOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                  Add Signatory
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Signatory</DialogTitle>
                  <DialogDescription>
                    Add an authorized signatory (e.g. Principal, Faculty Advisor, HOD).
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleCreateSignatory} className="space-y-4 mt-2">
                  <Field
                    label="Full Name"
                    required
                    placeholder="e.g. Dr. Rajesh Kumar"
                    value={newSigName}
                    onChange={(e) => setNewSigName(e.target.value)}
                  />
                  <Field
                    label="Official Title / Designation"
                    placeholder="e.g. Dean of Academic Affairs"
                    value={newSigTitle}
                    onChange={(e) => setNewSigTitle(e.target.value)}
                  />

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setIsAddSignatoryOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      loading={creatingSignatory}
                      disabled={!newSigName.trim()}
                    >
                      Save Signatory
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {signatories.length === 0 ? (
          <EmptyState
            icon={PenTool}
            title="No signatories added yet"
            description="Add department heads, conveners, or exam officers to sign certificates."
          />
        ) : (
          <div className="overflow-hidden rounded-control border border-hairline bg-surface">
            {signatories.map((sig) => (
              <ListRow
                key={sig.id}
                title={sig.name}
                subtitle={sig.title || "Authorized Signatory"}
                leftIcon={<PenTool className="w-4 h-4 text-accent" />}
                trailing={
                  <div className="flex items-center gap-3">
                    <Badge variant="neutral">Active</Badge>
                    {isPrivileged && (
                      <button
                        type="button"
                        onClick={() => handleDeleteSignatory(sig.id, sig.name)}
                        className="rounded-control p-2 text-ink-secondary hover:text-danger press-feedback"
                        aria-label={`Delete signatory ${sig.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                }
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
