import SignupForm from "@/components/SignupForm";
import { ApplicantType } from "@/lib/types";

const VALID_TYPES: ApplicantType[] = [
  "hacker",
  "judge",
  "mentor",
  "volunteer",
  "organizer",
];

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const defaultType = VALID_TYPES.includes(type as ApplicantType)
    ? (type as ApplicantType)
    : "hacker";

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="font-display text-3xl font-bold">Create your account</h1>
      <p className="mt-2 text-ink-soft">
        Choose the type of application you&apos;re submitting. You can&apos;t
        change this after signing up.
      </p>
      <SignupForm defaultType={defaultType} />
    </div>
  );
}
