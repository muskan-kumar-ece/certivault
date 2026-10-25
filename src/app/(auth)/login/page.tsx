export default function LoginPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-sm p-6 bg-surface rounded-card border shadow-sm space-y-4">
        <h1 className="text-xl font-bold text-ink">Sign in to CertiVault</h1>
        <p className="text-sm text-ink-secondary">
          Enter your email to receive a 6-digit access code.
        </p>
        <div className="pt-2">
          <input
            type="email"
            placeholder="name@college.edu"
            className="w-full px-3 py-2 rounded-control bg-canvas border text-ink text-base focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>
    </div>
  );
}
