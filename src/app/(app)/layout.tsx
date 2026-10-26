import { AppHeader } from "@/components/app-header";
import { requireHost } from "@/lib/auth";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const { host } = await requireHost();
  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader nome={host.nome} email={host.email} />
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
