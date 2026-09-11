import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Application } from "@/lib/types";
import { QUESTIONS_LABEL_MAP } from "@/lib/questions";
import StatusBadge from "@/components/StatusBadge";
import { reviewApplication } from "../actions";

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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
  if (!profile || profile.type !== "organizer") redirect("/apply");

  const { data: application } = await supabase
    .from("applications")
    .select("*, profiles!applicant_id(full_name, email)")
    .eq("id", id)
    .single<Application & { profiles: { full_name: string; email: string } }>();

  if (!application) notFound();

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">
            {application.profiles?.full_name}
          </h1>
          <p className="text-sm text-ink-soft">
            {application.profiles?.email} · <span className="capitalize">{application.type}</span>
          </p>
        </div>
        <StatusBadge status={application.status} />
      </div>

      <div className="mt-8 rounded-xl border border-line bg-surface p-6">
        <h2 className="font-display text-lg font-bold">Answers</h2>
        <dl className="mt-4 space-y-4 text-sm">
          {Object.entries(application.answers).map(([key, value]) => (
            <div key={key}>
              <dt className="text-ink-soft">
                {QUESTIONS_LABEL_MAP[application.type][key] ?? key}
              </dt>
              <dd className="mt-0.5">{String(value)}</dd>
            </div>
          ))}
        </dl>
      </div>

      <form action={reviewApplication} className="mt-8 space-y-4 rounded-xl border border-line bg-surface p-6">
        <input type="hidden" name="application_id" value={application.id} />

        <div>
          <label className="text-sm font-medium">Score (0–10)</label>
          <input
            type="number"
            name="score"
            min={0}
            max={10}
            defaultValue={application.score ?? ""}
            className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Notes</label>
          <textarea
            name="organizer_notes"
            defaultValue={application.organizer_notes ?? ""}
            rows={3}
            className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Decision</label>
          <select
            name="status"
            defaultValue={application.status}
            className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2"
          >
            <option value="submitted">Submitted</option>
            <option value="under_review">Under review</option>
            <option value="accepted">Accepted</option>
            <option value="waitlisted">Waitlisted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <button className="rounded-full bg-coral px-6 py-2 text-sm font-medium text-white hover:bg-coral-dark">
          Save review
        </button>
      </form>
    </div>
  );
}
