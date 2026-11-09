"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  customerLogin,
  requestPasswordReset,
  resetPassword,
  signup,
  type FormState,
} from "@/lib/customer/actions";

export const fieldClass = "mt-2 block min-h-12 w-full border-2 border-brun bg-white px-3 text-base";
export const fieldLabel = "eyebrow block text-[0.72rem]";

function Messages({ state }: { state: FormState }) {
  if (state.error)
    return (
      <p role="alert" className="border-2 border-brun bg-orange/20 px-4 py-3 font-semibold">
        {state.error}
      </p>
    );
  if (state.ok)
    return (
      <p role="status" className="border-2 border-brun bg-safran/30 px-4 py-3 font-semibold">
        {state.ok}
      </p>
    );
  return null;
}

function Field(props: { id: string; label: string; type?: string; autoComplete?: string; defaultValue?: string; hint?: string; minLength?: number }) {
  return (
    <div>
      <label htmlFor={props.id} className={fieldLabel}>
        {props.label}
      </label>
      <input
        id={props.id}
        name={props.id}
        type={props.type ?? "text"}
        autoComplete={props.autoComplete}
        defaultValue={props.defaultValue}
        minLength={props.minLength}
        required
        className={fieldClass}
      />
      {props.hint && <p className="mt-1 text-sm text-brun-soft">{props.hint}</p>}
    </div>
  );
}

export function SignupForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(signup, {});
  return (
    <form action={action} className="space-y-5">
      <Messages state={state} />
      <Field id="nom" label="Prénom et nom" autoComplete="name" defaultValue={state.values?.nom} />
      <Field id="email" label="E-mail" type="email" autoComplete="email" defaultValue={state.values?.email} />
      <Field id="mot_de_passe" label="Mot de passe" type="password" autoComplete="new-password" minLength={10} hint="10 caractères minimum." />
      <label className="flex items-start gap-3">
        <input type="checkbox" name="newsletter" className="mt-1 h-5 w-5 shrink-0 accent-brun" />
        <span>
          Je souhaite recevoir la newsletter Maison Kayes (nouvelles créations, actualités). Désinscription possible à tout moment depuis mon
          compte.
        </span>
      </label>
      <button type="submit" disabled={pending} className="btn btn-primary w-full disabled:opacity-60">
        {pending ? "Création…" : "Créer mon compte"}
      </button>
      <p className="text-sm text-brun-soft">
        Vos données servent à gérer votre compte et vos commandes. Voir la{" "}
        <Link href="/confidentialite" className="underline">
          politique de confidentialité
        </Link>
        .
      </p>
    </form>
  );
}

export function CustomerLoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(customerLogin, {});
  return (
    <form action={action} className="space-y-5">
      <Messages state={state} />
      <input type="hidden" name="suite" value={next} />
      <Field id="email" label="E-mail" type="email" autoComplete="email" defaultValue={state.values?.email} />
      <Field id="mot_de_passe" label="Mot de passe" type="password" autoComplete="current-password" />
      <button type="submit" disabled={pending} className="btn btn-primary w-full disabled:opacity-60">
        {pending ? "Connexion…" : "Se connecter"}
      </button>
      <p className="text-sm">
        <Link href="/compte/mot-de-passe-oublie" className="underline">
          Mot de passe oublié ?
        </Link>
      </p>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(requestPasswordReset, {});
  return (
    <form action={action} className="space-y-5">
      <Messages state={state} />
      <Field id="email" label="E-mail du compte" type="email" autoComplete="email" defaultValue={state.values?.email} />
      <button type="submit" disabled={pending} className="btn btn-primary w-full disabled:opacity-60">
        {pending ? "Envoi…" : "Recevoir un lien"}
      </button>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(resetPassword, {});
  return (
    <form action={action} className="space-y-5">
      <Messages state={state} />
      <input type="hidden" name="jeton" value={token} />
      <Field id="mot_de_passe" label="Nouveau mot de passe" type="password" autoComplete="new-password" minLength={10} hint="10 caractères minimum." />
      <button type="submit" disabled={pending} className="btn btn-primary w-full disabled:opacity-60">
        {pending ? "Enregistrement…" : "Enregistrer le mot de passe"}
      </button>
    </form>
  );
}
