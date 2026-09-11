"use server";

// Gates organizer signup behind a shared invite code. Organizer is the
// only account type with elevated DB access (is_organizer() bypasses RLS
// on profiles/applications - see supabase/schema.sql and docs/DECISIONS.md
// D1/D6), so unlike hacker/judge/mentor/volunteer it can't be left as a
// pure self-serve radio button with no gate at all.
//
// This runs server-side only, so ORGANIZER_INVITE_CODE (no NEXT_PUBLIC_
// prefix) is never sent to the browser - the client only ever learns
// true/false, not the real value. Fails closed if the env var isn't set,
// rather than silently allowing anyone through.
export async function verifyOrganizerCode(code: string): Promise<boolean> {
  const expected = process.env.ORGANIZER_INVITE_CODE;
  if (!expected) return false;
  return code === expected;
}
