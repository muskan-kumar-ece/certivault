interface PublicVerifyPageProps {
  params: Promise<{ publicId: string }>;
}

export default async function PublicVerifyPage({ params }: PublicVerifyPageProps) {
  const { publicId } = await params;

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-lg p-8 bg-surface rounded-card border shadow-sm space-y-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-seal/10 text-seal mx-auto">
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-ink">Verified Certificate</h1>
          <p className="text-sm font-mono text-ink-secondary">{publicId}</p>
        </div>

        <div className="p-4 rounded-control bg-canvas border text-left text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-ink-secondary">Status</span>
            <span className="font-medium text-seal">Valid & Verified</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-secondary">Issued To</span>
            <span className="font-medium text-ink">Sample Recipient</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-secondary">Verification Engine</span>
            <span className="font-medium text-ink">CertiVault Trust Registry</span>
          </div>
        </div>
      </div>
    </main>
  );
}
