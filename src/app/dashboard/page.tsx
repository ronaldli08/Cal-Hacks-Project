import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import StatusBadge from "@/components/StatusBadge";
import { Application, Profile } from "@/lib/types";
import { QUESTIONS_LABEL_MAP } from "@/lib/questions";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();
  if (!profile || profile.type === "organizer") redirect("/organizer");

  const { data: application } = await supabase
    .from("applications")
    .select("*")
    .eq("applicant_id", user.id)
    .single<Application>();

  if (!application) redirect("/apply");

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <p className="text-sm text-ink-soft">Welcome back, {profile.full_name}</p>
      <h1 className="mt-1 font-display text-3xl font-bold">Your application</h1>

      <div className="mt-6 flex items-center gap-3">
        <StatusBadge status={application.status} />
        <span className="text-sm text-ink-soft">
          Submitted {new Date(application.created_at).toLocaleDateString()}
        </span>
      </div>

      {application.score !== null && (
        <p className="mt-4 text-sm text-ink-soft">
          Reviewer score: <span className="font-medium text-ink">{application.score}/10</span>
        </p>
      )}

      <div className="mt-10 rounded-xl border border-line bg-surface p-6">
        <h2 className="font-display text-lg font-bold">What you submitted</h2>
        <dl className="mt-4 space-y-3 text-sm">
          {Object.entries(application.answers).map(([key, value]) => (
            <div key={key}>
              <dt className="text-ink-soft">
                {QUESTIONS_LABEL_MAP[profile.type][key] ?? key}
              </dt>
              <dd className="mt-0.5">{String(value)}</dd>
            </div>
          ))}
        </dl>
      </div>

      {profile.type === "hacker" && (
        <div className="mt-10 rounded-xl border border-line bg-surface p-6">
          <h2 className="font-display text-lg font-bold">Find a team</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Browse other hackers looking for teammates, or start your own team.
          </p>
          <Link
            href="/teams"
            className="mt-4 inline-block rounded-full bg-coral px-5 py-2 text-sm font-medium text-white hover:bg-coral-dark"
          >
            Open team board
          </Link>
        </div>
      )}
    </div>
  );
}
