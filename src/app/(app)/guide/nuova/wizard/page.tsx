import type { Metadata } from "next";
import { Wizard } from "@/components/wizard/wizard";
import { requireHost } from "@/lib/auth";

export const metadata: Metadata = { title: "Procedura guidata" };

export default async function WizardPage() {
  const { host } = await requireHost();
  return <Wizard nomeHost={host.nome ?? ""} telefonoHost={host.telefono ?? ""} />;
}
