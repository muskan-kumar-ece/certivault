import { getUserOrganizationsAction, UserOrgItem } from "@/features/org/actions";
import { OrgSwitcher } from "@/features/org/components/org-switcher";
import { AppShell } from "@/components/ui/app-shell";
import { signOutAction } from "@/features/auth/actions";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let organizations: UserOrgItem[] = [];
  try {
    organizations = await getUserOrganizationsAction();
  } catch {
    redirect("/login");
  }

  if (organizations.length === 0) {
    redirect("/onboarding");
  }

  const activeOrg = organizations[0]?.org;

  return (
    <AppShell
      headerContent={
        <OrgSwitcher
          organizations={organizations}
          currentOrgId={activeOrg?.id}
        />
      }
      headerRight={
        <form action={signOutAction}>
          <button
            type="submit"
            className="rounded-lg p-2 text-ink-secondary hover:text-ink press-feedback"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </form>
      }
      creditBalance={activeOrg?.credit_balance ?? 0}
    >
      {children}
    </AppShell>
  );
}
