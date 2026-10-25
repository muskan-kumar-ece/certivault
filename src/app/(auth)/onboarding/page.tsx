"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createOrganizationAction } from "@/features/org/actions";
import { OrgKind } from "@/lib/schemas/org";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [kind, setKind] = useState<OrgKind>("club");
  const [city, setCity] = useState("");
  const [brandColor, setBrandColor] = useState("#3355FF");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (name.trim().length < 2) {
        setError("Please enter a valid organization name (at least 2 characters).");
        return;
      }
      setError(null);
      setStep(2);
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
    <main className="flex-1 flex flex-col items-center justify-center p-6 bg-canvas">
      <div className="w-full max-w-md p-8 bg-surface rounded-card border shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="space-y-0.5">
            <span className="text-xs uppercase font-semibold text-accent tracking-wider">
              Step {step} of 2
            </span>
            <h1 className="text-xl font-bold text-ink">
              {step === 1 ? "Set up your organization" : "Customize your brand"}
            </h1>
          </div>
          <div className="flex gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${step === 1 ? "bg-accent" : "bg-hairline"}`} />
            <span className={`w-2.5 h-2.5 rounded-full ${step === 2 ? "bg-accent" : "bg-hairline"}`} />
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-control bg-danger/10 border border-danger/20 text-danger text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {step === 1 ? (
            <>
              <div className="space-y-1.5">
                <label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
                  Organization Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  placeholder="e.g. IEEE Student Branch, Coding Club, Exam Cell"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-control bg-canvas border text-ink text-base focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
                  Organization Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["club", "college", "university", "other"] as OrgKind[]).map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setKind(k)}
                      className={`px-3 py-2 rounded-control border text-sm font-medium capitalize press-feedback text-center ${
                        kind === k
                          ? "bg-accent/10 border-accent text-accent"
                          : "bg-surface border-hairline text-ink hover:bg-surface-raised"
                      }`}
                    >
                      {k}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="city" className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
                  City (Optional)
                </label>
                <input
                  id="city"
                  type="text"
                  placeholder="e.g. Mumbai, Bengaluru, Delhi"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-control bg-canvas border text-ink text-base focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-control bg-accent hover:bg-accent-hover text-white font-medium press-feedback shadow-sm"
              >
                Continue
              </button>
            </>
          ) : (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
                  Brand Accent Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="w-12 h-10 rounded-control border cursor-pointer bg-canvas"
                  />
                  <span className="font-mono text-sm uppercase text-ink">{brandColor}</span>
                </div>
                <p className="text-xs text-ink-secondary">
                  This color highlights verified seals, buttons, and certificate accents.
                </p>
              </div>

              <div className="p-4 rounded-card bg-canvas border space-y-2">
                <div className="flex items-center gap-2 text-seal">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-semibold text-sm">50 Free Starter Credits Included</span>
                </div>
                <p className="text-xs text-ink-secondary">
                  Issue and test your first 50 verified certificates immediately upon setup.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-2.5 rounded-control bg-surface hover:bg-surface-raised border text-ink font-medium press-feedback"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-control bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-medium press-feedback shadow-sm"
                >
                  {loading ? "Creating..." : "Launch Organization"}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </main>
  );
}
