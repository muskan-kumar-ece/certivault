"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createOrganizationAction } from "@/features/org/actions";
import { OrgKind } from "@/lib/schemas/org";
import { colors } from "@/lib/tokens";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Stepper } from "@/components/ui/stepper";
import { Select } from "@/components/ui/select";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<0 | 1>(0);
  const [name, setName] = useState("");
  const [kind, setKind] = useState<OrgKind>("club");
  const [city, setCity] = useState("");
  const [brandColor, setBrandColor] = useState<string>(colors.accent.ultramarine.light);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 0) {
      if (name.trim().length < 2) {
        setError("Please enter a valid organization name (at least 2 characters).");
        return;
      }
      setError(null);
      setStep(1);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createOrganizationAction({
        name,
        kind,
        city: city || undefined,
        brandColor,
      });
      router.push("/app");
      router.refresh();
    } catch (err: unknown) {
      setLoading(false);
      setError(err instanceof Error ? err.message : "Failed to create organization.");
    }
  };

  return (
    <main className="flex min-h-screen flex-1 flex-col items-center justify-center bg-canvas p-6">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-hairline bg-surface p-8 shadow-sm">
        <div className="space-y-4 border-b border-hairline pb-4">
          <Stepper
            currentStep={step}
            steps={[{ label: "Organization Profile" }, { label: "Brand Details" }]}
          />
          <h1 className="text-xl font-bold text-ink">
            {step === 0 ? "Set up your organization" : "Customize your brand"}
          </h1>
        </div>

        {error && (
          <div className="rounded-xl border border-danger/20 bg-danger/10 p-3 text-sm text-danger" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {step === 0 ? (
            <>
              <Field
                label="Organization Name"
                required
                placeholder="e.g. IEEE Student Branch, Coding Club, Exam Cell"
                value={name}
                onChange={(e) => setName(e.target.value)}
                helperText="This name will appear on all issued certificates."
              />

              <Select
                label="Organization Type"
                options={[
                  { value: "club", label: "Student Club / Society" },
                  { value: "college", label: "College / Department" },
                  { value: "university", label: "University Exam Cell" },
                  { value: "other", label: "Other Organization" },
                ]}
                value={kind}
                onValueChange={(val) => setKind(val as OrgKind)}
              />

              <Field
                label="City / Campus Location (Optional)"
                placeholder="e.g. Mumbai, Bengaluru, Hyderabad"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />

              <Button type="submit" variant="primary" size="md" className="w-full">
                Continue to Brand Setup →
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-ink">
                  Primary Brand Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="h-10 w-16 cursor-pointer rounded-xl border border-hairline bg-transparent p-1"
                  />
                  <span className="font-mono text-sm text-ink-secondary">
                    {brandColor.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-ink-secondary">
                  Used for header accents, seal borders, and verified tags.
                </p>
              </div>

              <div className="rounded-xl border border-hairline bg-surface-raised p-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
                  Starter Bonus
                </span>
                <p className="mt-1 text-sm font-medium text-ink">
                  🎉 You will receive 50 complimentary credits upon organization creation.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => setStep(0)}
                  disabled={loading}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={loading}
                  className="flex-1"
                >
                  Create Organization
                </Button>
              </div>
            </>
          )}
        </form>
      </div>
    </main>
  );
}
