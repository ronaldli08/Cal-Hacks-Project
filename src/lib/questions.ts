import { ApplicantType } from "./types";

export interface Question {
  id: string;
  label: string;
  type: "text" | "textarea" | "number" | "select";
  placeholder?: string;
  options?: string[];
  required?: boolean;
}

export const QUESTIONS: Record<ApplicantType, Question[]> = {
  hacker: [
    {
      id: "school",
      label: "School or organization",
      type: "text",
      placeholder: "UC Berkeley",
      required: true,
    },
    {
      id: "graduation_year",
      label: "Graduation year",
      type: "number",
      placeholder: "2027",
      required: true,
    },
    {
      id: "github_url",
      label: "GitHub or portfolio link",
      type: "text",
      placeholder: "https://github.com/yourname",
    },
    {
      id: "previous_hackathons",
      label: "How many hackathons have you attended before?",
      type: "number",
      placeholder: "0",
      required: true,
    },
    {
      id: "why_hackathon",
      label: "Why do you want to join this hackathon?",
      type: "textarea",
      placeholder: "Tell us what you're hoping to build or learn.",
      required: true,
    },
    {
      id: "project_idea",
      label: "Got a project idea already? Share it (optional).",
      type: "textarea",
    },
  ],
  organizer: [
    {
      id: "company_role",
      label: "Current company & role",
      type: "text",
      placeholder: "Staff Engineer, Acme Corp",
      required: true,
    },
    {
      id: "years_experience",
      label: "Years of professional experience",
      type: "number",
      placeholder: "5",
      required: true,
    },
    {
      id: "expertise_areas",
      label: "Areas of expertise",
      type: "text",
      placeholder: "ML, mobile, product design",
      required: true,
    },
    {
      id: "availability",
      label: "Availability",
      type: "select",
      options: ["Both days", "Day 1 only", "Day 2 only"],
      required: true,
    },
    {
      id: "why_organize",
      label: "Why do you want to help organize and judge this hackathon?",
      type: "textarea",
      required: true,
    },
  ],
};

// Quick id -> label lookup, used when rendering a submitted application's
// stored jsonb answers back out as a readable summary.
export const QUESTIONS_LABEL_MAP: Record<ApplicantType, Record<string, string>> =
  Object.fromEntries(
    Object.entries(QUESTIONS).map(([type, questions]) => [
      type,
      Object.fromEntries(questions.map((q) => [q.id, q.label])),
    ])
  ) as Record<ApplicantType, Record<string, string>>;
