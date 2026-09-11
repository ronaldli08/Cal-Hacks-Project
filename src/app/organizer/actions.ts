"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function reviewApplication(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const id = String(formData.get("application_id"));
  const status = String(formData.get("status"));
  const scoreRaw = formData.get("score");
  const notes = String(formData.get("organizer_notes") ?? "");

  await supabase
    .from("applications")
    .update({
      status,
      score: scoreRaw ? Number(scoreRaw) : null,
      organizer_notes: notes,
      reviewed_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  revalidatePath(`/organizer/${id}`);
  revalidatePath("/organizer");
}
