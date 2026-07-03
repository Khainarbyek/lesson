# Children Learning Website MVP Design

Date: 2026-07-03

## Goal

Build a free, public learning website for children, parents, and teachers. The site should feel inviting for young children while being structured enough to grow into many subjects, ages, and languages over time.

The first release should prove the platform direction, not contain a full curriculum. It will show a broad catalog of subjects and include two playable lessons.

## Audience

- Children age 3+ who may not read yet.
- Parents helping younger children choose and practice lessons.
- Teachers who may use activities with children.
- Older students who can later use school subjects such as math, chemistry, languages, chess, typing, and computer basics.

## MVP Scope

The MVP will include:

- Public homepage.
- Language switch for English, Russian, and Kazakh.
- Age filters for young children and school-age learners.
- Lesson catalog showing Alphabet, Animals, Math, Chess, Typing, and Chemistry.
- Playable lessons for Alphabet and Animals.
- "Coming soon" cards for Math, Chess, Typing, and Chemistry.
- Local progress saved in the browser with `localStorage`.
- Static hosting configuration for Netlify.
- GitHub Actions CI for install, checks, and build.

The MVP will not include:

- User accounts.
- Payments.
- Admin panel.
- Teacher classrooms.
- Database-backed progress.
- Full curriculum authoring tools.

## Homepage Flow

The homepage should not force a setup wizard before showing lessons. It should immediately show the child-friendly learning choices, while keeping language and age controls easy to find.

Recommended layout:

1. Top navigation with product name and `EN / RU / KK` language switch.
2. Hero area with a short message for parents and children.
3. Age cards such as `3-5`, `6-8`, and `9+`.
4. Lesson catalog cards.
5. Playable cards for Alphabet and Animals.
6. "Coming soon" cards for Math, Chess, Typing, and Chemistry.

## Lessons

### Alphabet

Purpose: help young children recognize letters visually.

Initial activity:

- Show one target letter.
- Show a few large answer cards.
- The child taps the matching letter.
- Correct answers get immediate friendly feedback.
- Progress is stored locally.

### Animals

Purpose: help young children match animal pictures/names across languages.

Initial activity:

- Show an animal prompt.
- Show multiple answer cards.
- The child chooses the matching animal.
- Correct answers get immediate friendly feedback.
- Progress is stored locally.

## Languages

Use locale codes:

- `en` for English.
- `ru` for Russian.
- `kk` for Kazakh.

Routes should be localized as `/en`, `/ru`, and `/kk`. The homepage UI, lesson catalog, and the first Alphabet and Animals lesson content should ship with English, Russian, and Kazakh text in the MVP.

## Technical Architecture

Use Astro with TypeScript as the main framework. Astro is a good fit because most pages are fast static content, while individual lessons can be hydrated as interactive islands.

Use React for interactive lesson components.

Use Tailwind CSS plus scoped custom CSS for the playful visual system.

Use local JSON or TypeScript data files for lesson metadata and translations in the MVP. This keeps hosting simple and avoids a backend until accounts, classrooms, or admin tools are actually needed.

## Data Model

Core lesson metadata should include:

- `id`
- localized title and description
- subject
- age range
- status: `playable` or `coming-soon`
- route
- visual/icon metadata

Playable activities should define their prompts and answer choices in structured data so future lessons can reuse the same activity engine.

## CI/CD

Use GitHub Actions for CI:

- Install dependencies.
- Run formatting or lint checks.
- Run type checks.
- Run tests when present.
- Build the site.

Use Netlify for free hosting first. Netlify should connect to the GitHub repository and deploy from the production branch. GitHub Actions provides quality checks; Netlify handles production deploys through its Git integration.

Later, if more control is needed, deployment can move into GitHub Actions with Netlify secrets:

- `NETLIFY_AUTH_TOKEN`
- `NETLIFY_SITE_ID`

## Testing

MVP verification should include:

- Astro build succeeds.
- TypeScript checks pass.
- Homepage renders all supported languages.
- Lesson cards correctly show playable and coming-soon states.
- Alphabet and Animals interactions update state and local progress.
- Basic responsive check for mobile and desktop.

## Success Criteria

The MVP is successful when:

- A child or parent can open the homepage and understand where to start.
- Language can be switched between English, Russian, and Kazakh.
- Age filters make the catalog feel guided.
- Alphabet and Animals lessons are playable.
- Other subject areas are visible as future growth.
- The site builds in CI and can be hosted for free on Netlify.
