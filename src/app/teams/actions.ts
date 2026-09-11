"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function generateJoinCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export async function updateHackerProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const skills = String(formData.get("skills") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const bio = String(formData.get("bio") ?? "");
  const lookingForTeam = formData.get("looking_for_team") === "on";

  await supabase.from("hacker_profiles").upsert({
    applicant_id: user.id,
    skills,
    bio,
    looking_for_team: lookingForTeam,
  });

  revalidatePath("/teams");
}

export async function createTeam(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const { data: team, error } = await supabase
    .from("teams")
    .insert({ name, join_code: generateJoinCode(), created_by: user.id })
    .select()
    .single();

  if (!error && team) {
    await supabase
      .from("team_members")
      .insert({ team_id: team.id, applicant_id: user.id });
  }

  revalidatePath("/teams");
}

export async function joinTeam(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const code = String(formData.get("join_code") ?? "").trim().toUpperCase();
  if (!code) return;

  const { data: team } = await supabase
    .from("teams")
    .select("id")
    .eq("join_code", code)
    .maybeSingle();

  if (team) {
    await supabase
      .from("team_members")
      .insert({ team_id: team.id, applicant_id: user.id });
  }

  revalidatePath("/teams");
}

export async function leaveTeam() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("team_members").delete().eq("applicant_id", user.id);
  revalidatePath("/teams");
}
