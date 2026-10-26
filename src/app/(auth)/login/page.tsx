import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Accedi" };

const ERRORI: Record<string, string> = {
  google: "Accesso con Google non riuscito. Riprova.",
  link: "Il link non è valido o è scaduto. Accedi o richiedi una nuova email.",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next, errore } = await searchParams;
  return (
    <AuthForm
      mode="login"
      next={typeof next === "string" ? next : undefined}
      initialError={typeof errore === "string" ? ERRORI[errore] : undefined}
    />
  );
}
