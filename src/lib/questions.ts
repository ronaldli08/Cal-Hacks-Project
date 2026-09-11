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
  judge: [
    {
      id: "company_role",
      label: "Current company & role",
      type: "text",
      placeholder: "Staff Engineer, Acme Corp",
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
      id: "judging_experience",
      label: "Have you judged a hackathon or demo day before?",
      type: "select",
      options: ["Yes, multiple times", "Yes, once", "No, first time"],
      required: true,
    },
    {
      id: "availability",
      label: "Availability for final-round judging",
      type: "select",
      options: ["Full judging window", "Partial — first half", "Partial — second half"],
      required: true,
    },
    {
      id: "why_judge",
      label: "Why do you want to judge this hackathon?",
      type: "textarea",
      placeholder: "What draws you to evaluating other people's projects?",
      required: true,
    },
  ],
  mentor: [
    {
      id: "company_role",
      label: "Current company & role",
      type: "text",
      placeholder: "Senior Engineer, Acme Corp",
      required: true,
    },
    {
      id: "expertise_areas",
      label: "What can you mentor teams on?",
      type: "text",
      placeholder: "React, backend architecture, pitching",
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
      id: "why_mentor",
      label: "Why do you want to mentor at this hackathon?",
      type: "textarea",
      required: true,
    },
  ],
  volunteer: [
    {
      id: "availability",
      label: "Which shifts can you cover?",
      type: "select",
      options: ["Full event", "Day 1 only", "Day 2 only", "Check-in / registration only"],
      required: true,
    },
    {
      id: "relevant_experience",
      label: "Any relevant experience? (optional)",
      type: "textarea",
      placeholder: "Event staffing, past hackathon volunteering, etc.",
    },
    {
      id: "why_volunteer",
      label: "Why do you want to volunteer at this hackathon?",
      type: "textarea",
      required: true,
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
      label: "Why do you want to help organize and review applications for this hackathon?",
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
