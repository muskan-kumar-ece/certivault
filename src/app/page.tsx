import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border text-ink-secondary text-sm font-medium">
          <span className="w-2 h-2 rounded-full bg-seal animate-pulse" />
          <span>CertiVault Foundation Ready</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-ink">
          Issue 1,000 verified certificates in 5 minutes.
        </h1>

        <p className="text-lg text-ink-secondary max-w-xl mx-auto">
          Bulk certificate issuance and instant public verification for
          colleges, universities, and student organizations.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            href="/login"
            className="w-full sm:w-auto px-6 py-3 rounded-control bg-accent hover:bg-accent-hover text-white font-medium press-feedback shadow-sm"
          >
            Start Free (50 Certificates)
          </Link>
          <Link
            href="/verify"
            className="w-full sm:w-auto px-6 py-3 rounded-control bg-surface hover:bg-surface-raised border text-ink font-medium press-feedback"
          >
            Verify a Certificate
          </Link>
        </div>
      </div>
    </main>
  );
}
