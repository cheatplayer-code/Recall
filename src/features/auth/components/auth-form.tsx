"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Aurora } from "@/components/ui/aurora";
import { authErrorMessage } from "@/lib/api/error-message";

import { useAuth } from "../hooks/use-auth";

const IS_DEV = process.env.NODE_ENV === "development";
const DEV = { email: "dev@recall.dev", password: "recall-dev-password" };

/**
 * The login / register experience. One presentational form for both modes — it
 * owns its field + error state and delegates the session work to `useAuth`. On
 * success it redirects to the `next` param (or Home). There is no auto-login:
 * a session is only ever created by submitting this form.
 */
export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isRegister = mode === "register";
  const pending = login.isPending || register.isPending;
  const next = searchParams.get("next") || "/home";

  async function run(values: { name?: string; email: string; password: string }) {
    setError(null);
    try {
      if (isRegister) {
        await register.mutateAsync({
          name: values.name ?? "",
          email: values.email,
          password: values.password,
        });
      } else {
        await login.mutateAsync({ email: values.email, password: values.password });
      }
      router.replace(next);
    } catch (err) {
      setError(authErrorMessage(err, mode));
    }
  }

  return (
    <div className="relative flex min-h-svh items-center justify-center px-4 py-10">
      <Aurora className="pointer-events-none absolute inset-x-0 top-0 h-64 opacity-60" />

      <div className="relative w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link
            href="/home"
            className="font-editorial text-2xl tracking-tight text-foreground"
          >
            Recall
          </Link>
          <p className="mt-2 text-sm text-muted-foreground">
            {isRegister
              ? "Create your account to start remembering."
              : "Welcome back — sign in to your memory."}
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void run({ name, email, password });
          }}
          className="space-y-4 rounded-2xl bg-card/60 p-6 ring-1 ring-white/[0.06]"
        >
          {isRegister && (
            <Field
              id="name"
              label="Name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={setName}
              placeholder="Your name"
            />
          )}
          <Field
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
          />
          <Field
            id="password"
            label="Password"
            type="password"
            autoComplete={isRegister ? "new-password" : "current-password"}
            required
            value={password}
            onChange={setPassword}
            placeholder={isRegister ? "At least 8 characters" : "Your password"}
          />

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive ring-1 ring-destructive/20"
            >
              {error}
            </p>
          )}

          <Button type="submit" size="lg" disabled={pending} className="w-full">
            {pending
              ? isRegister
                ? "Creating account…"
                : "Signing in…"
              : isRegister
                ? "Create account"
                : "Sign in"}
          </Button>

          {IS_DEV && !isRegister && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={pending}
              onClick={() => {
                setEmail(DEV.email);
                setPassword(DEV.password);
                void run({ ...DEV });
              }}
              className="w-full text-muted-foreground"
            >
              Use developer account
            </Button>
          )}
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isRegister ? "Already have an account? " : "New to Recall? "}
          <Link
            href={isRegister ? "/login" : "/register"}
            className="text-primary hover:underline"
          >
            {isRegister ? "Sign in" : "Create an account"}
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
  required,
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
      />
    </div>
  );
}
