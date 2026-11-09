/**
 * Gestion des comptes administrateurs (aucune inscription publique).
 *
 *   npm run admin -- create <email> [--name "Prénom Nom"]
 *   npm run admin -- password <email>
 *   npm run admin -- disable <email>   |   enable <email>
 *   npm run admin -- list
 *
 * Le mot de passe est demandé au clavier (ou lu dans ADMIN_PASSWORD). Minimum 12 caractères.
 * Utilise DATABASE_URL s’il est défini, sinon la base locale PGlite (arrêter `npm run dev` avant).
 */
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { eq } from "drizzle-orm";
import { getDb } from "../src/db/client";
import { adminSessions, adminUsers } from "../src/db/schema";
import { hashPassword, MIN_PASSWORD_LENGTH } from "../src/lib/auth/password";

async function askPassword(): Promise<string> {
  if (process.env.ADMIN_PASSWORD) return process.env.ADMIN_PASSWORD;
  const rl = createInterface({ input: stdin, output: stdout, terminal: true });
  // Masque la saisie.
  const write = (rl as unknown as { _writeToOutput: (s: string) => void })._writeToOutput;
  let muted = false;
  (rl as unknown as { _writeToOutput: (s: string) => void })._writeToOutput = (s: string) => {
    if (!muted) write.call(rl, s);
  };
  const ask = async (q: string) => {
    stdout.write(q);
    muted = true;
    const a = await rl.question("");
    muted = false;
    stdout.write("\n");
    return a;
  };
  const first = await ask("Mot de passe : ");
  const second = await ask("Confirmer : ");
  rl.close();
  if (first !== second) throw new Error("Les deux saisies diffèrent.");
  return first;
}

async function main() {
  const [command, rawEmail, ...rest] = process.argv.slice(2);
  const email = rawEmail?.trim().toLowerCase();
  const db = await getDb();

  if (command === "list") {
    const rows = await db.select().from(adminUsers).orderBy(adminUsers.email);
    if (!rows.length) console.log("Aucun administrateur.");
    for (const u of rows) console.log(`${u.active ? "actif   " : "désactivé"}  ${u.email}  (${u.name})`);
    return;
  }
  if (!email || !email.includes("@")) throw new Error("Indiquez un e-mail valide.");

  if (command === "create" || command === "password") {
    const password = await askPassword();
    if (password.length < MIN_PASSWORD_LENGTH) throw new Error(`Mot de passe trop court (${MIN_PASSWORD_LENGTH} caractères minimum).`);
    const passwordHash = await hashPassword(password);
    if (command === "create") {
      const nameIdx = rest.indexOf("--name");
      const name = nameIdx >= 0 ? rest[nameIdx + 1] : email.split("@")[0];
      await db.insert(adminUsers).values({ email, name, passwordHash });
      console.log(`Administrateur créé : ${email}`);
    } else {
      const [u] = await db.update(adminUsers).set({ passwordHash }).where(eq(adminUsers.email, email)).returning();
      if (!u) throw new Error("Compte introuvable.");
      await db.delete(adminSessions).where(eq(adminSessions.userId, u.id));
      console.log(`Mot de passe changé pour ${email} (sessions ouvertes fermées).`);
    }
    return;
  }
  if (command === "disable" || command === "enable") {
    const [u] = await db.update(adminUsers).set({ active: command === "enable" }).where(eq(adminUsers.email, email)).returning();
    if (!u) throw new Error("Compte introuvable.");
    if (command === "disable") await db.delete(adminSessions).where(eq(adminSessions.userId, u.id));
    console.log(`${email} ${command === "enable" ? "réactivé" : "désactivé"}.`);
    return;
  }
  throw new Error("Commande inconnue. Voir l’en-tête de scripts/admin.ts.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
