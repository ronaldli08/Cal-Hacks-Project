export type ApplicantType =
  | "hacker"
  | "judge"
  | "mentor"
  | "volunteer"
  | "organizer";

// The four applicant-side types from the assignment brief (hacker + at
// least one more). "organizer" is deliberately excluded — it's the
// reviewer role, not an applicant type; see docs/DECISIONS.md D1.
export const APPLICANT_TYPES: Exclude<ApplicantType, "organizer">[] = [
  "hacker",
  "judge",
  "mentor",
  "volunteer",
];

export type ApplicationStatus =
  | "submitted"
  | "under_review"
  | "accepted"
  | "waitlisted"
  | "rejected";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  type: ApplicantType;
  created_at: string;
}

export interface Application {
  id: string;
  applicant_id: string;
  type: ApplicantType;
  status: ApplicationStatus;
  answers: Record<string, string | number>;
  score: number | null;
  organizer_notes: string | null;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface HackerProfile {
  applicant_id: string;
  skills: string[];
  bio: string;
  looking_for_team: boolean;
}

export interface Team {
  id: string;
  name: string;
  join_code: string;
  created_by: string;
  created_at: string;
}

export interface TeamMember {
  team_id: string;
  applicant_id: string;
  joined_at: string;
}

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  submitted: "Submitted",
  under_review: "Under review",
  accepted: "Accepted",
  waitlisted: "Waitlisted",
  rejected: "Rejected",
};
