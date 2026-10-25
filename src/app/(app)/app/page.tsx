export default function DashboardPage() {
  return (
    <div className="flex-1 p-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-ink">Dashboard</h1>
        <p className="text-sm text-ink-secondary">
          Manage your certificate batches, templates, and delivery status.
        </p>
      </header>
      <div className="p-8 text-center bg-surface rounded-card border space-y-3">
        <h2 className="text-lg font-semibold text-ink">No batches issued yet</h2>
        <p className="text-sm text-ink-secondary max-w-md mx-auto">
          Design your first certificate template or import a student list to start issuing.
        </p>
      </div>
    </div>
  );
}
