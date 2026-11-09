"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  return (
    <form action={action} className="space-y-5" noValidate={false}>
      {state.error && (
        <p role="alert" className="border-2 border-brun bg-orange/20 px-4 py-3 font-semibold">
          {state.error}
        </p>
      )}
      <div>
        <label htmlFor="email" className="eyebrow block">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          defaultValue={state.email}
          className="mt-2 block min-h-12 w-full border-2 border-brun bg-white px-3 text-base"
        />
      </div>
      <div>
        <label htmlFor="password" className="eyebrow block">
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="mt-2 block min-h-12 w-full border-2 border-brun bg-white px-3 text-base"
        />
      </div>
      <button type="submit" disabled={pending} className="btn btn-primary w-full disabled:opacity-60">
        {pending ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}
