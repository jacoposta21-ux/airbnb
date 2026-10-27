"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, registrati, type AuthState } from "@/app/(auth)/actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/field";
import { GoogleButton } from "./google-button";

interface AuthFormProps {
  mode: "login" | "registrati";
  next?: string;
  initialError?: string;
}

/** Form unico per accesso e registrazione (email + password, oppure Google). */
export function AuthForm({ mode, next, initialError }: AuthFormProps) {
  const isLogin = mode === "login";
  const [state, action, pending] = useActionState<AuthState, FormData>(isLogin ? login : registrati, {
    error: initialError,
  });

  return (
    <Card className="p-6 sm:p-8">
      <h1 className="font-serif text-3xl font-semibold">{isLogin ? "Bentornato" : "Crea il tuo account"}</h1>
      <p className="mt-2 text-grigio">
        {isLogin
          ? "Accedi per gestire le guide dei tuoi appartamenti."
          : "Gratis per sempre la bozza: paghi solo quando pubblichi."}
      </p>

      <div className="mt-6">
        <GoogleButton next={next} />
      </div>

      <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wide text-grigio">
        <span className="h-px flex-1 bg-bordo" /> oppure con email <span className="h-px flex-1 bg-bordo" />
      </div>

      {state.message ? (
        <Alert tone="success">{state.message}</Alert>
      ) : (
        <form action={action} className="space-y-4" noValidate>
          <input type="hidden" name="next" value={next ?? "/dashboard"} />
          {!isLogin && (
            <Field label="Il tuo nome" htmlFor="nome">
              <Input id="nome" name="nome" autoComplete="name" required defaultValue={state.fields?.nome} />
            </Field>
          )}
          <Field label="Email" htmlFor="email">
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              required
              defaultValue={state.fields?.email}
            />
          </Field>
          <Field label="Password" htmlFor="password" hint={isLogin ? undefined : "Almeno 8 caratteri."}>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              required
              minLength={isLogin ? undefined : 8}
            />
          </Field>

          {state.error && <Alert tone="error">{state.error}</Alert>}

          <Button type="submit" className="w-full" loading={pending}>
            {isLogin ? "Accedi" : "Crea account"}
          </Button>
          {!isLogin && (
            <p className="text-center text-xs text-grigio">
              Creando l&apos;account accetti i{" "}
              <Link href="/termini" className="underline underline-offset-2">
                Termini di servizio
              </Link>{" "}
              e confermi di aver letto l&apos;
              <Link href="/privacy" className="underline underline-offset-2">
                Informativa privacy
              </Link>
              .
            </p>
          )}
        </form>
      )}

      <p className="mt-6 text-center text-sm text-grigio">
        {isLogin ? "Non hai un account? " : "Hai già un account? "}
        <Link
          href={isLogin ? "/registrati" : "/login"}
          className="font-medium text-terracotta underline-offset-4 hover:underline"
        >
          {isLogin ? "Registrati" : "Accedi"}
        </Link>
      </p>
    </Card>
  );
}
