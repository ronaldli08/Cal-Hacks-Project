"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ApplicantType } from "@/lib/types";
import { QUESTIONS } from "@/lib/questions";

export default function ApplyForm({
  applicantId,
  type,
}: {
  applicantId: string;
  type: ApplicantType;
}) {
  const router = useRouter();
  const supabase = createClient();
  const questions = QUESTIONS[type];

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function setField(id: string, value: string) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: insertError } = await supabase.from("applications").insert({
      applicant_id: applicantId,
      type,
      status: "submitted",
      answers,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push(type === "hacker" ? "/dashboard" : "/organizer");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      {questions.map((q) => (
        <div key={q.id}>
          <label className="text-sm font-medium">{q.label}</label>
          {q.type === "textarea" && (
            <textarea
              required={q.required}
              placeholder={q.placeholder}
              onChange={(e) => setField(q.id, e.target.value)}
              rows={4}
              className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2"
            />
          )}
          {q.type === "select" && (
            <select
              required={q.required}
              defaultValue=""
              onChange={(e) => setField(q.id, e.target.value)}
              className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2"
            >
              <option value="" disabled>
                Select one
              </option>
              {q.options?.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          )}
          {(q.type === "text" || q.type === "number") && (
            <input
              required={q.required}
              type={q.type}
              placeholder={q.placeholder}
              onChange={(e) => setField(q.id, e.target.value)}
              className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2"
            />
          )}
        </div>
      ))}

      {error && <p className="text-sm text-brick">{error}</p>}

      <button
        disabled={loading}
        className="w-full rounded-full bg-coral px-6 py-3 font-medium text-white hover:bg-coral-dark disabled:opacity-50"
      >
        {loading ? "Submitting…" : "Submit application"}
      </button>
    </form>
  );
}
