import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Registrati" };

export default function RegistratiPage() {
  return <AuthForm mode="registrati" />;
}
