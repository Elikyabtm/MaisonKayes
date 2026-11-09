import "server-only";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/** Chemin de retour limité au dashboard (pas de redirection ouverte). */
export function backTo(formData: FormData, fallback: string) {
  const raw = String(formData.get("retour") ?? "");
  return raw.startsWith("/admin") && !raw.startsWith("//") ? raw : fallback;
}

/** Redirige avec un code de message (?ok= / ?erreur=), en conservant les autres paramètres. */
export function done(path: string, key: "ok" | "erreur", code: string): never {
  const url = new URL(path, "http://x");
  url.searchParams.delete("ok");
  url.searchParams.delete("erreur");
  url.searchParams.set(key, code);
  revalidatePath("/admin", "layout");
  redirect(`${url.pathname}${url.search}${url.hash}`);
}

export const int = (v: FormDataEntryValue | null) => {
  const s = String(v ?? "").trim();
  return /^-?\d+$/.test(s) ? Number(s) : NaN;
};
