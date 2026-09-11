"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ApplicantType, APPLICANT_TYPES } from "@/lib/types";

export default function SignupForm({
  defaultType,
}: {
  defaultType: ApplicantType;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [type, setType] = useState<ApplicantType>(defaultType);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (!data.user) {
      setError("Something went wrong creating your account.");
      setLoading(false);
      return;
    }

    // If email confirmation is on, there's no session yet - the profile
    // insert has to wait until the user confirms and logs in, since RLS
    // requires an authenticated session matching the new user's id.
    if (!data.session) {
      setError(
        "Check your email to confirm your account, then log in to continue."
      );
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      email,
      full_name: fullName,
      type,
    });

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    router.push("/apply");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <fieldset>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {APPLICANT_TYPES.map((option) => (
            <label
              key={option}
              className={`cursor-pointer rounded-xl border px-4 py-3 text-center capitalize ${
                type === option
                  ? "border-ink bg-surface"
                  : "border-line text-ink-soft"
              }`}
            >
              <input
                type="radio"
                name="type"
                value={option}
                checked={type === option}
                onChange={() => setType(option)}
                className="sr-only"
              />
              {option}
            </label>
          ))}
        </div>

        <label
          className={`mt-3 block cursor-pointer rounded-xl border px-4 py-3 ${
            type === "organizer"
              ? "border-ink bg-surface"
              : "border-line text-ink-soft"
          }`}
        >
          <input
            type="radio"
            name="type"
            value="organizer"
            checked={type === "organizer"}
            onChange={() => setType("organizer")}
            className="sr-only"
          />
          <span className="font-medium capitalize">organizer</span>
          <span className="block text-xs text-ink-soft">
            Reviews and grades applications — not an applicant type.
          </span>
        </label>
      </fieldset>

      <div>
        <label className="text-sm font-medium">Full name</label>
        <input
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Email</label>
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Password</label>
        <input
          required
          minLength={6}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2"
        />
      </div>

      {error && <p className="text-sm text-brick">{error}</p>}

      <button
        disabled={loading}
        className="w-full rounded-full bg-coral px-6 py-3 font-medium text-white hover:bg-coral-dark disabled:opacity-50"
      >
        {loading ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
