# Math Numbers Flashcards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn Math into a playable `Numbers 0-10` flashcard lesson with speech and a simple writing prompt.

**Architecture:** Extend the existing lesson data model with a second activity type, `number-flashcards`. Reuse the current localized lesson route and React island, branching inside `LessonActivity` so existing choice lessons remain unchanged.

**Tech Stack:** Astro 7, TypeScript, React, Vitest, browser SpeechSynthesis API.

---

## File Structure

- Modify `src/lib/content.ts`: add number-flashcard activity types and localized Math content.
- Modify `src/components/LessonActivity.tsx`: render either existing choice activity or number flashcards.
- Modify `src/styles/global.css`: add mobile-first number card styles.
- Modify `src/tests/content.test.ts`: assert Math is playable and contains numbers 0-10.
- Modify `src/tests/LessonActivity.test.tsx`: assert number cards render and navigation works.

## Task 1: Math Content Model

**Files:**
- Modify: `src/lib/content.ts`
- Modify: `src/tests/content.test.ts`

- [x] **Step 1: Write failing content tests**

Add tests that Math is playable and each locale has 11 number cards from 0 through 10 with labels and speech text.

- [x] **Step 2: Run content tests**

Run: `npm test -- src/tests/content.test.ts`

Expected: fail because Math is still coming soon.

- [x] **Step 3: Add number-flashcard data**

Add `NumberFlashcardActivity`, update `PlayableLesson`, and convert Math in `en`, `ru`, and `kk` to playable `number-flashcards`.

- [x] **Step 4: Re-run content tests**

Run: `npm test -- src/tests/content.test.ts`

Expected: pass.

## Task 2: Number Flashcard UI

**Files:**
- Modify: `src/components/LessonActivity.tsx`
- Modify: `src/styles/global.css`
- Modify: `src/tests/LessonActivity.test.tsx`

- [x] **Step 1: Write failing UI tests**

Add tests that render the Math lesson, show `0`, show the localized word, and navigate to `1`.

- [x] **Step 2: Run UI tests**

Run: `npm test -- src/tests/LessonActivity.test.tsx`

Expected: fail because `LessonActivity` assumes choice prompts.

- [x] **Step 3: Implement number flashcard rendering**

Branch on `lesson.activity.type`. For number flashcards, render a large number, word, speech button, object count, paper-writing prompt, previous and next buttons. Use `speechSynthesis` if available.

- [x] **Step 4: Re-run UI tests**

Run: `npm test -- src/tests/LessonActivity.test.tsx`

Expected: pass.

## Task 3: Final Local Verification

**Files:**
- All modified files.

- [x] **Step 1: Run local checks**

Run:

```bash
npm run check
npm test
npm run build
git diff --check
```

Expected: all commands exit 0.

- [x] **Step 2: Commit and push**

Commit:

```bash
git add docs/superpowers/plans/2026-07-04-math-numbers-flashcards.md src/lib/content.ts src/components/LessonActivity.tsx src/styles/global.css src/tests/content.test.ts src/tests/LessonActivity.test.tsx
git commit -m "Add math numbers flashcards"
git push origin dev
```
