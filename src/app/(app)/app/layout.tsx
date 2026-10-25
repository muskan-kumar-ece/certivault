import Link from "next/link";
import { getUserOrganizationsAction, UserOrgItem } from "@/features/org/actions";
import { OrgSwitcher } from "@/features/org/components/org-switcher";
import { signOutAction } from "@/features/auth/actions";
import { redirect } from "next/navigation";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let organizations: UserOrgItem[] = [];
  try {
    organizations = await getUserOrganizationsAction();
  } catch {
    // If not authenticated, middleware handles it, or redirect to login
    redirect("/login");
  }

  if (organizations.length === 0) {
    redirect("/onboarding");
  }

  const activeOrg = organizations[0]?.org;

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-canvas">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 h-14 bg-surface/80 backdrop-blur-md border-b px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/app" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-control bg-accent flex items-center justify-center text-white font-bold text-sm shadow-sm">
              CV
            </div>
            <span className="font-bold tracking-tight text-ink hidden sm:inline">
              CertiVault
            </span>
          </Link>

          <span className="text-hairline">/</span>

          <OrgSwitcher organizations={organizations} currentOrgId={activeOrg?.id} />
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-canvas border text-xs font-mono font-medium text-ink">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span>{activeOrg?.credit_balance ?? 0} Credits</span>
          </div>

          <form action={signOutAction}>
            <button
              type="submit"
              className="text-xs px-3 py-1.5 rounded-control bg-surface hover:bg-surface-raised border text-ink-secondary hover:text-ink font-medium press-feedback"
            >
              Sign Out
            </button>
          </form>
        </div>
      </header>

      {/* Main App Content Area */}
      <main className="flex-1 flex flex-col max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-8">
        {children}
      </main>

      {/* Mobile Tab Bar Placeholder (Desktop uses top bar) */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 h-14 bg-surface/90 backdrop-blur-md border-t flex items-center justify-around px-2 z-30">
        <Link href="/app" className="flex flex-col items-center text-xs font-medium text-accent">
          <span>Home</span>
        </Link>
        <Link href="/app/templates" className="flex flex-col items-center text-xs font-medium text-ink-secondary">
          <span>Templates</span>
        </Link>
        <Link href="/app/issue" className="flex flex-col items-center text-xs font-bold text-accent">
          <span>+ Issue</span>
        </Link>
        <Link href="/app/certificates" className="flex flex-col items-center text-xs font-medium text-ink-secondary">
          <span>Certificates</span>
        </Link>
        <Link href="/app/account" className="flex flex-col items-center text-xs font-medium text-ink-secondary">
          <span>Account</span>
        </Link>
      </nav>
    </div>
  );
}
