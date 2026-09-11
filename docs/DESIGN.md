# Design rationale

This app was built with an explicit goal of avoiding the visual patterns
that read as generic/AI-templated: a cream background with a terracotta
accent, a near-black background with a single neon accent, or the
"SaaS-card kit" (everything chopped into identical rounded cards with the
same soft shadow). Keep that goal in mind before adding new UI — it's
easy for incremental additions to drift back toward those defaults because
they're the path of least resistance in Tailwind.

## Subject grounding

Audience is student hackers and volunteer organizer/judges — a builder,
engineering-culture audience, not a generic B2B SaaS audience. That's the
reasoning behind most choices below.

## Palette

Defined as CSS variables in `src/app/globals.css`:

| Token | Hex | Used for |
|---|---|---|
| `--color-paper` | `#EEF1EF` | page background (cool sage, not warm cream) |
| `--color-ink` | `#16241D` | primary text, headings |
| `--color-ink-soft` | `#46554C` | secondary text |
| `--color-line` | `#D3DBD5` | borders, dividers |
| `--color-surface` | `#FFFFFF` | cards/panels on top of the paper background |
| `--color-coral` | `#FF5A36` | primary CTA (signup, submit) |
| `--color-forest` | `#2F6F4F` | secondary accent, "accepted" status, skill tags |
| `--color-amber` | `#D69A2D` | "under review" / "waitlisted" status |
| `--color-brick` | `#C1443C` | "rejected" status, destructive actions |

Chosen to sit in a cool sage/forest/coral family specifically to avoid the
warm cream (`#F4F1EA`-ish) + terracotta combination that's become a
default "AI-generated" tell, and to avoid the dark-mode-with-neon-accent
default too.

## Typography

- **Space Grotesk** (`--font-space-grotesk`) — headings and stat numbers
  (e.g. the live applicant count on the landing page). A geometric grotesk
  reads as technical/builder without being a generic system font.
- **IBM Plex Sans** (`--font-plex-sans`) — body text. Designed by IBM
  originally for technical/engineering documentation, which fits a
  developer-facing product without reaching for a default like Inter.

Two families, clearly distinct roles (display vs. body) — not mixed within
the same element.

## Layout principles actually applied

- **Landing page hero is asymmetric**, not a centered headline + subhead +
  button stack: a left-aligned headline and CTA pair with a live applicant
  count and a numbered 3-step sequence on the right, separated by a
  hairline rule. The numbering there is legitimate — it's an actual
  ordered sequence (apply → review → get matched), not decoration.
- **Organizer applications list is a divided list, not a card grid.** Rows
  separated by hairlines (`divide-y divide-line`) rather than the generic
  "SaaS-card kit" of identical rounded cards with soft shadows — a plain
  list of rows is a more honest representation of "this is a table of
  records," and reviewers scanning many rows benefit from higher density
  than card padding allows.
- **Status is color-coded consistently** across the hacker dashboard and
  the organizer queue (`StatusBadge.tsx`) so state is recognizable in both
  places without relearning a second color language.
- No page-load animation sequences, no per-card hover-lift effects — motion
  was deliberately left out rather than added as generic polish.

## If you reskin this

Preserve the principles (subject-grounded palette choice, two clearly-
differentiated type roles, structural devices that mean something) even if
the exact colors/fonts change. The thing to avoid regressing into is
letting Tailwind's defaults (gray-100 cards, rounded-2xl everything,
shadow-sm on every container) creep back in one component at a time.
