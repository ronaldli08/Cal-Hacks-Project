import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ApplyForm from "@/components/ApplyForm";

export default async function ApplyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/signup");

  const { data: existing } = await supabase
    .from("applications")
    .select("id")
    .eq("applicant_id", user.id)
    .maybeSingle();

  if (existing) {
    redirect(profile.type === "organizer" ? "/organizer" : "/dashboard");
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <h1 className="font-display text-3xl font-bold capitalize">
        {profile.type} application
      </h1>
      <p className="mt-2 text-ink-soft">
        Take your time — you can only submit once.
      </p>
      <ApplyForm applicantId={user.id} type={profile.type} />
    </div>
  );
}
