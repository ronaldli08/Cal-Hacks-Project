import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  let applicantCount: number | null = null;
  try {
    const supabase = await createClient();
    const { count } = await supabase
      .from("applications")
      .select("*", { count: "exact", head: true });
    applicantCount = count;
  } catch {
    applicantCount = null;
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <div className="grid gap-16 md:grid-cols-[3fr_2fr]">
        <div>
          <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl">
            Build something
            <br />
            worth staying up for.
          </h1>
          <p className="mt-6 max-w-md text-lg text-ink-soft">
            Apply as a hacker, judge, mentor, or volunteer — or sign up as an
            organizer to help review applications. One portal, real
            applications, real decisions.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/signup?type=hacker"
              className="rounded-full bg-coral px-6 py-3 font-medium text-white hover:bg-coral-dark"
            >
              Apply as a hacker
            </Link>
            <Link
              href="/signup"
              className="rounded-full border border-line px-6 py-3 font-medium hover:border-ink"
            >
              Judge, mentor, volunteer, or organize
            </Link>
          </div>
        </div>

        <div className="border-l border-line pl-8">
          <div className="font-display text-5xl font-bold">
            {applicantCount ?? "—"}
          </div>
          <p className="mt-1 text-sm text-ink-soft">applications submitted so far</p>

          <ol className="mt-10 space-y-6 text-sm">
            <li className="flex gap-3">
              <span className="font-display text-ink-soft">01</span>
              <span>Create an account and tell us about yourself.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-display text-ink-soft">02</span>
              <span>Organizers review and score every application.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-display text-ink-soft">03</span>
              <span>
                Hackers get matched with a team on the board and start
                building.
              </span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
