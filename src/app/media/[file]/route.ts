import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";

/** Photos importées depuis le dashboard (WebP stocké en base). Identifiants aléatoires, contenu immuable. */
export async function GET(_request: Request, ctx: RouteContext<"/media/[file]">) {
  const { file } = await ctx.params;
  const id = file.replace(/\.webp$/, "");
  if (!/^[a-zA-Z0-9_-]{8,64}$/.test(id)) return new Response("Introuvable", { status: 404 });
  const db = await getDb();
  const [row] = await db.select().from(schema.media).where(eq(schema.media.id, id)).limit(1);
  if (!row) return new Response("Introuvable", { status: 404 });
  return new Response(new Uint8Array(row.data), {
    headers: {
      "Content-Type": row.contentType,
      "Content-Length": String(row.bytes),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
