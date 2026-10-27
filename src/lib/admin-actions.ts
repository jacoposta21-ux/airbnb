"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { tagGuida } from "@/lib/public-guide";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Moderazione: mette offline (o riattiva, se pagata) una guida di qualsiasi
 * host. Non tocca il pagamento.
 */
export async function moderaGuida(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const stato = formData.get("stato") === "pubblicata" ? "pubblicata" : "bozza";

  const db = createAdminClient();
  const { data: guida } = await db.from("guides").select("slug, pagata").eq("id", id).maybeSingle();
  if (!guida || (stato === "pubblicata" && !guida.pagata)) return;

  await db.from("guides").update({ stato }).eq("id", id);
  revalidateTag(tagGuida(guida.slug), { expire: 0 });
  revalidatePath("/admin");
}
