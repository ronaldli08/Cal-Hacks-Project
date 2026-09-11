import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createTeam, joinTeam, leaveTeam, updateHackerProfile } from "./actions";

interface HackerProfileRow {
  applicant_id: string;
  skills: string[];
  bio: string;
  looking_for_team: boolean;
  profiles: { full_name: string } | null;
}

export default async function TeamsPage() {
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
  if (!profile || profile.type !== "hacker") redirect("/apply");

  const { data: application } = await supabase
    .from("applications")
    .select("id")
    .eq("applicant_id", user.id)
    .maybeSingle();
  if (!application) redirect("/apply");

  const { data: myProfile } = await supabase
    .from("hacker_profiles")
    .select("*")
    .eq("applicant_id", user.id)
    .maybeSingle();

  const { data: myMembership } = await supabase
    .from("team_members")
    .select("team_id, teams(id, name, join_code)")
    .eq("applicant_id", user.id)
    .maybeSingle();

  let roster: { applicant_id: string; profiles: { full_name: string } | null }[] = [];
  if (myMembership?.team_id) {
    const { data } = await supabase
      .from("team_members")
      .select("applicant_id, profiles(full_name)")
      .eq("team_id", myMembership.team_id);
    roster = (data ?? []) as unknown as typeof roster;
  }

  const { data: browseRaw } = await supabase
    .from("hacker_profiles")
    .select("applicant_id, skills, bio, looking_for_team, profiles(full_name)")
    .eq("looking_for_team", true)
    .neq("applicant_id", user.id);

  const browse = ((browseRaw ?? []) as unknown as HackerProfileRow[]).filter(
    (row) => !roster.some((r) => r.applicant_id === row.applicant_id)
  );

  const team = myMembership?.teams as unknown as
    | { id: string; name: string; join_code: string }
    | undefined;

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-3xl font-bold">Team board</h1>
      <p className="mt-2 text-ink-soft">
        Set your status, then browse or match with other hackers.
      </p>

      <section className="mt-10 rounded-xl border border-line bg-surface p-6">
        <h2 className="font-display text-lg font-bold">Your profile</h2>
        <form action={updateHackerProfile} className="mt-4 space-y-4">
          <div>
            <label className="text-sm font-medium">Skills (comma separated)</label>
            <input
              name="skills"
              defaultValue={myProfile?.skills?.join(", ") ?? ""}
              placeholder="React, Figma, ML"
              className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Short bio</label>
            <textarea
              name="bio"
              defaultValue={myProfile?.bio ?? ""}
              rows={2}
              placeholder="What do you want to build, and what do you bring?"
              className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2"
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="looking_for_team"
              defaultChecked={myProfile?.looking_for_team ?? true}
            />
            I&apos;m looking for a team
          </label>
          <button className="rounded-full bg-coral px-5 py-2 text-sm font-medium text-white hover:bg-coral-dark">
            Save profile
          </button>
        </form>
      </section>

      <section className="mt-8 rounded-xl border border-line bg-surface p-6">
        <h2 className="font-display text-lg font-bold">Your team</h2>
        {team ? (
          <div className="mt-4">
            <p className="font-medium">{team.name}</p>
            <p className="text-sm text-ink-soft">
              Join code: <span className="font-mono">{team.join_code}</span>
            </p>
            <ul className="mt-3 space-y-1 text-sm">
              {roster.map((r) => (
                <li key={r.applicant_id}>{r.profiles?.full_name}</li>
              ))}
            </ul>
            <form action={leaveTeam} className="mt-4">
              <button className="text-sm text-brick">Leave team</button>
            </form>
          </div>
        ) : (
          <div className="mt-4 grid gap-6 sm:grid-cols-2">
            <form action={createTeam} className="space-y-2">
              <label className="text-sm font-medium">Start a team</label>
              <input
                name="name"
                placeholder="Team name"
                required
                className="w-full rounded-lg border border-line bg-paper px-3 py-2"
              />
              <button className="rounded-full border border-line px-4 py-2 text-sm font-medium hover:border-ink">
                Create team
              </button>
            </form>
            <form action={joinTeam} className="space-y-2">
              <label className="text-sm font-medium">Join with a code</label>
              <input
                name="join_code"
                placeholder="ABC123"
                required
                className="w-full rounded-lg border border-line bg-paper px-3 py-2 uppercase"
              />
              <button className="rounded-full border border-line px-4 py-2 text-sm font-medium hover:border-ink">
                Join team
              </button>
            </form>
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="font-display text-lg font-bold">
          Looking for a team ({browse.length})
        </h2>
        <div className="mt-4 space-y-3">
          {browse.length === 0 && (
            <p className="text-sm text-ink-soft">
              No one else is looking for a team right now — check back soon.
            </p>
          )}
          {browse.map((b) => (
            <div
              key={b.applicant_id}
              className="rounded-xl border border-line bg-surface p-4"
            >
              <p className="font-medium">{b.profiles?.full_name}</p>
              {b.bio && <p className="mt-1 text-sm text-ink-soft">{b.bio}</p>}
              {b.skills?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {b.skills.map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-forest/10 px-2 py-0.5 text-xs text-forest"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
