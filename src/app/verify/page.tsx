export default function VerifyLookupPage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-md p-6 bg-surface rounded-card border shadow-sm space-y-5">
        <h1 className="text-2xl font-bold text-ink">Verify a Certificate</h1>
        <p className="text-sm text-ink-secondary">
          Enter the unique certificate public ID found on the certificate or scan the QR code.
        </p>

        <form className="space-y-3 pt-2">
          <input
            type="text"
            placeholder="e.g. CV-26-7K3M9QXT"
            className="w-full px-4 py-2.5 rounded-control bg-canvas border text-ink font-mono uppercase text-center focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            type="button"
            className="w-full py-2.5 rounded-control bg-accent hover:bg-accent-hover text-white font-medium press-feedback shadow-sm"
          >
            Check Certificate
          </button>
        </form>
      </div>
    </main>
  );
}
