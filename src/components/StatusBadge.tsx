import { ApplicationStatus, STATUS_LABELS } from "@/lib/types";

const COLORS: Record<ApplicationStatus, string> = {
  submitted: "bg-ink-soft/10 text-ink-soft",
  under_review: "bg-amber/15 text-amber",
  accepted: "bg-forest/15 text-forest",
  waitlisted: "bg-amber/15 text-amber",
  rejected: "bg-brick/15 text-brick",
};

export default function StatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${COLORS[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
