import { AppHeader } from "@/components/app-header";
import { isAdmin } from "@/lib/admin";
import { requireHost } from "@/lib/auth";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const { host, user } = await requireHost();
  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader nome={host.nome} email={host.email} admin={isAdmin(user.email)} />
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
