import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Profile } from "@/lib/types";
import SignOutButton from "./SignOutButton";

export default async function Nav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: Profile | null = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-lg font-bold tracking-tight">
          Foundry
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          {!user && (
            <>
              <Link href="/login" className="text-ink-soft hover:text-ink">
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-coral px-4 py-2 font-medium text-white hover:bg-coral-dark"
              >
                Apply now
              </Link>
            </>
          )}
          {user && profile?.type === "hacker" && (
            <>
              <Link href="/dashboard" className="text-ink-soft hover:text-ink">
                Dashboard
              </Link>
              <Link href="/teams" className="text-ink-soft hover:text-ink">
                Team board
              </Link>
              <SignOutButton />
            </>
          )}
          {user && profile?.type === "organizer" && (
            <>
              <Link href="/organizer" className="text-ink-soft hover:text-ink">
                Applications
              </Link>
              <SignOutButton />
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
