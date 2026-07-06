# Busibox Intro Pre-Module — Design

**Date:** 2026-07-06
**Status:** Approved, ready for implementation plan

## Goal

Add a "Start Here" introductory pre-module that introduces Busibox to users. It
contains a single descriptive video and **does not count toward course
completion** (certificate threshold, badges, or the dashboard/profile progress
percentages).

## Context

The course content lives in `lib/module-data.ts` (`MODULES` array — the single
source of truth). There is already a precedent for a non-counting module: the
**AI Lunch and Learn** bonus module (`isBonus: true`, `order: 99`), which:

- is excluded from completion via `MODULES.filter((m) => !m.isBonus)`
- renders one lesson with no `activityType` (a pure content/watch page)
- has its video attached per-lesson through **Admin → Videos**
  (`training-videos` data-api, keyed by `moduleId` + `lessonId`), rendered by the
  lesson page's `VideoPlayer`. The `Module.videoUrl` field is unused (empty
  everywhere).

Module list order is simply the array order in `MODULES` — nothing sorts by
`.order` (the `/api/modules` route and `modules/page.tsx` render the array
as-is).

## Decisions

- **Distinct "Intro" treatment**, not a reuse of `isBonus`: a new `isIntro` flag,
  positioned first, tagged "Start Here" (visually distinct from the green "Bonus"
  pill).
- **Video attached later via Admin → Videos**, matching the Lunch & Learn pattern.
  No URL is hardcoded.
- **Video-only content**: a short "Welcome — watch the intro below" heading and a
  one-line description above the player. No quiz, no activity.

## Changes

### 1. Data model — `lib/types.ts`

Add to the `Module` interface, documented like `isBonus`:

```ts
/**
 * Intro (pre-module) modules appear first with a "Start Here" tag and do NOT
 * count toward the certificate's completion threshold, badges, or the
 * dashboard/profile progress percentages. Like bonus modules, they stay
 * outside the main progression.
 */
isIntro?: boolean;
```

### 2. Shared exclusion helper — `lib/module-data.ts`

The "counts toward completion" rule is currently duplicated as `!m.isBonus` in
three places (and missing on the dashboard). Introduce one helper and route every
completion-denominator site through it:

```ts
export const countsTowardCompletion = (m: Pick<Module, 'isBonus' | 'isIntro'>) =>
  !m.isBonus && !m.isIntro;
```

### 3. The intro module — `lib/module-data.ts`

Add a new module as the **first** element of the `MODULES` array:

- `id: 'mod-intro'`
- `title: 'Welcome to Busibox'`
- `description:` short intro-to-Busibox line; note it doesn't count toward completion
- `instructor:` one of the existing allowed values (`'Peter' | 'Bobby' | 'Wes'`)
- `estimatedMinutes:` short (e.g. 5)
- `order: 0`
- `icon:` an existing lucide icon key already mapped in `modules/page.tsx`
- `isIntro: true`
- `lessons:` a single lesson `mod-intro-les-1`:
  - `title: 'Welcome to Busibox'`
  - `order: 1`, `estimatedMinutes` short
  - **no** `activityType`, `activityId`, or `quizId` (pure watch page)
  - `content:` minimal markdown — a welcome heading and one line telling the user
    to watch the intro video below.

The lesson page already fetches
`training-videos?moduleId=mod-intro&lessonId=mod-intro-les-1` and renders the
`VideoPlayer` when a video exists, so no video code is needed — an admin attaches
the actual video via Admin → Videos.

### 4. Route completion sites through the helper

Replace `!m.isBonus` (and add exclusion where missing) with
`countsTowardCompletion`:

- `lib/badge-eval.ts:106` — `requiredModules` (drives `completionist` and the
  `think-aimpossible` 95% lesson ratio).
- `app/api/progress/admin/route.ts:64` — `requiredModules`.
- `app/(authenticated)/profile/page.tsx:125` — `requiredModules` used for
  `overallPercent`, `completedModules`, etc.
- `app/(authenticated)/page.tsx:60-61` — **fix**: the dashboard currently sums
  `totalLessons` over *all* modules and counts *all* completed progress, so bonus
  (and now intro) lessons dilute the percentage. Change both numerator and
  denominator to only include lessons from `countsTowardCompletion` modules, so
  the displayed % is truthful. (This also corrects the pre-existing bonus-module
  inconsistency.)

### 5. UI tag — `app/(authenticated)/modules/page.tsx`

Alongside the existing `mod.isBonus` pill, add an `mod.isIntro` branch rendering a
blue "Start Here · doesn't count toward completion" pill.

## Out of scope (YAGNI)

- No quiz, badge, or activity for the intro module.
- No use of the unused `Module.videoUrl` field.
- No Admin UI changes — the Videos panel already keys videos by module/lesson, so
  the new module/lesson IDs are attachable as-is.

## Verification

- Course completion / certificate math is unchanged for the six required modules
  (intro is excluded everywhere completion is computed).
- Dashboard and profile percentages read 100% for a user who finishes all required
  modules but not the intro or bonus modules.
- The intro module appears first in the Modules list with the "Start Here" tag,
  and its lesson page shows the `VideoPlayer` once a video is attached via
  Admin → Videos.
