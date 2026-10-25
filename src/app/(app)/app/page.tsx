import Link from "next/link";
import { getUserOrganizationsAction } from "@/features/org/actions";

export default async function AppHomePage() {
  const orgs = await getUserOrganizationsAction();
  const current = orgs[0];
  const org = current?.org;

  return (
    <div className="space-y-8">
      {/* Greeting & Org Banner */}
      <section className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-ink">
          Welcome, {org?.name ?? "Organization"}
        </h1>
        <p className="text-sm text-ink-secondary">
          {org?.kind ? `${org.kind.toUpperCase()} Organization` : "Verified Issuance Workspace"} · Status:{" "}
          <span className="text-seal font-medium">{org?.verified ? "Verified Issuer" : "Standard"}</span>
        </p>
      </section>

      {/* Credit Overview & Action Banner */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 rounded-card bg-surface border shadow-sm space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
            Credit Balance
          </span>
          <div className="text-3xl font-bold text-ink font-mono">
            {org?.credit_balance ?? 0}
          </div>
          <p className="text-xs text-ink-secondary">
            1 credit = 1 issued certificate. Includes 50 free credits.
          </p>
        </div>

        <div className="p-6 rounded-card bg-surface border shadow-sm space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
            Current Tier
          </span>
          <div className="text-3xl font-bold text-accent capitalize">
            {org?.plan ?? "Free"}
          </div>
          <p className="text-xs text-ink-secondary">
            Upgrade to Campus plan for unlimited seats and verified domain.
          </p>
        </div>

        <div className="p-6 rounded-card bg-surface border shadow-sm space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
            Total Batches
          </span>
          <div className="text-3xl font-bold text-ink font-mono">0</div>
          <p className="text-xs text-ink-secondary">
            Ready to issue your first verified certificate batch.
          </p>
        </div>
      </section>

      {/* Quick Actions Hero */}
      <section className="p-8 rounded-card bg-surface border shadow-sm space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-ink">Ready to issue certificates?</h2>
          <p className="text-sm text-ink-secondary max-w-xl">
            Choose a starter template, import your recipient roster (CSV/XLSX), and issue tamper-proof certificates with QR codes in minutes.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="/app/issue"
            className="w-full sm:w-auto px-6 py-3 rounded-control bg-accent hover:bg-accent-hover text-white font-medium press-feedback shadow-sm text-center"
          >
            Issue New Batch
          </Link>
          <Link
            href="/app/templates"
            className="w-full sm:w-auto px-6 py-3 rounded-control bg-canvas hover:bg-surface-raised border text-ink font-medium press-feedback text-center"
          >
            Browse Starter Templates
          </Link>
        </div>
      </section>
    </div>
  );
}
