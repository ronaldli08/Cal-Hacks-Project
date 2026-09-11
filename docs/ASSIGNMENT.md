# Original assignment brief

Reproduced verbatim from the prompt this project was built against. This is
the ground truth for "what was actually required" vs. what was our own
design choice — see docs/DECISIONS.md for that distinction.

Deadline given: **5:00 PM on 9/11** (same day the project was built).

---

Every year, we receive tens of thousands of applications for our
hackathons. To get a taste of what the tech team works on, your task is to
build a miniature version of our main hackathon management platform. At its
core, this centers around a portal where applicants can sign in and submit
applications, and organizers can review and grade them.

## Requirements

This task is meant to be open-ended, so most decisions are yours to make.
However, your project should include the following:

- An applicant side
  - Sign-in and application forms backed by a real database
  - Support for multiple account types, each with their own application
    (pick at least two from: hacker, judge, mentor, volunteer)
- An organizer side
  - Functionality to review and grade applications
  - A page that lists all applications and their statuses
- One feature of your choosing (or more!)
  - Think about what applicants or organizers would find most useful, and
    build that feature into the portal
- A deployed project
  - Your portal should be live at a public URL

## Judging criteria

- **Functionality:** Does the application flow work end-to-end? Does the
  portal support user authentication and multiple account types?
- **Structure:** Is the code organized and readable? Is the data stored and
  structured in a way that fits the problem?
- **Design:** Is the user experience clean and intuitive? Do the
  branding/visuals feel intentional?
- **Creativity:** Does the added feature show thought about the users of
  the portal?

Note: AI tools are allowed and encouraged, but you should be able to
understand and justify every line you submit. If you advance to
interviews, expect to walk through your code with us and explain your
choices.

## Suggested tech stack

This is the stack used in production, but any stack is acceptable.

- Frontend: Next.js (React), TypeScript, Tailwind CSS
- Backend: Supabase
- Tools: Vercel

## Submission guidelines

Submit via the submission form by 5:00 PM on 9/11:

- [ ] A link to your GitHub repository and deployed project
- [ ] A short recording of your finished project (max 3 minutes): applicant
      flow, organizer flow, and anything worth highlighting. Video must be
      public or shared with the reviewers.
- [ ] A few short responses to project-related questions
