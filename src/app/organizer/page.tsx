import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import StatusBadge from "@/components/StatusBadge";
import { Application, ApplicationStatus, ApplicantType } from "@/lib/types";

const STATUS_FILTERS: (ApplicationStatus | "all")[] = [
  "all",
  "submitted",
  "under_review",
  "accepted",
  "waitlisted",
  "rejected",
];
const TYPE_FILTERS: (ApplicantType | "all")[] = [
  "all",
  "hacker",
  "judge",
  "mentor",
  "volunteer",
  "organizer",
];

export default async function OrganizerPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string }>;
}) {
  const { status = "all", type = "all" } = await searchParams;

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

  let query = supabase
    .from("applications")
    .select("*, profiles!applicant_id(full_name, email)")
    .order("created_at", { ascending: false });

  if (status !== "all") query = query.eq("status", status);
  if (type !== "all") query = query.eq("type", type);

  const { data: applications } = await query;

  const { data: allApplications } = await supabase
    .from("applications")
    .select("status");
  const counts = (allApplications ?? []).reduce<Record<string, number>>(
    (acc, a) => {
      acc[a.status] = (acc[a.status] ?? 0) + 1;
      return acc;
    },
    {}
  );

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-display text-3xl font-bold">Applications</h1>

      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        {Object.entries(counts).map(([key, value]) => (
          <div key={key} className="rounded-lg border border-line px-3 py-2">
            <span className="font-display font-bold">{value}</span>{" "}
            <span className="text-ink-soft">{key.replace("_", " ")}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-b border-line pb-4 text-sm">
        <div className="flex gap-2">
          {TYPE_FILTERS.map((t) => (
            <Link
              key={t}
              href={`/organizer?type=${t}&status=${status}`}
              className={`capitalize ${type === t ? "font-medium text-ink" : "text-ink-soft"}`}
            >
              {t}
            </Link>
          ))}
        </div>
        <span className="text-line">|</span>
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((s) => (
            <Link
              key={s}
              href={`/organizer?type=${type}&status=${s}`}
              className={`capitalize ${status === s ? "font-medium text-ink" : "text-ink-soft"}`}
            >
              {s.replace("_", " ")}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-4 divide-y divide-line">
        {(applications ?? []).length === 0 && (
          <p className="py-6 text-sm text-ink-soft">No applications match this filter.</p>
        )}
        {(applications as (Application & { profiles: { full_name: string; email: string } })[] ?? []).map(
          (app) => (
            <Link
              key={app.id}
              href={`/organizer/${app.id}`}
              className="flex items-center justify-between gap-4 py-4 hover:bg-surface"
            >
              <div>
                <p className="font-medium">{app.profiles?.full_name}</p>
                <p className="text-sm text-ink-soft">
                  {app.profiles?.email} · <span className="capitalize">{app.type}</span>
                </p>
              </div>
              <div className="flex items-center gap-4">
                {app.score !== null && (
                  <span className="text-sm text-ink-soft">{app.score}/10</span>
                )}
                <StatusBadge status={app.status} />
              </div>
            </Link>
          )
        )}
      </div>
    </div>
  );
}
