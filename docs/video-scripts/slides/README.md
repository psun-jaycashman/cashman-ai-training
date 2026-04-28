# Slide Decks

Short PowerPoint decks (2–3 slides each) that play **as background** while
the AI avatar narrates in the bottom-right corner of the frame.

## Quick start

The actual `.pptx` files live in [`pptx/`](pptx/), organized by module. Open
any of them in PowerPoint or Keynote.

| | |
|---|---|
| Total decks | **32** (8 intros + 24 lessons) |
| Slides per deck | 2 (intros) or 3 (lessons) |
| Total slides | **88** |
| Aspect ratio | 16:9 |
| Avatar zone | bottom-right, ~4.5″ × 6″ — kept clear of content |

## Style

Matched to `CashmanAILandL.pptx`:

| | |
|---|---|
| Background | `#FDFAF7` (warm cream) |
| Cashman green | `#2B6E2B` (accent bars, eyebrows) |
| Light green tint | `#C8E9C8` (callout panels) |
| Headline color | `#030303` |
| Body color | `#272525` |
| Headline font | **Petrona Bold** |
| Body font | **Inter** |

Each slide leaves a clean ~4.5″ × 6″ rectangle in the bottom-right corner
free for the avatar overlay.

## Slide types

The generator produces three layouts:

1. **Title slide** — left green accent bar, eyebrow tag, big headline, subhead, Cashman wordmark in lower left.
2. **Concept slide** — eyebrow tag, headline, short green divider rule, 2–4 lines of body. Used for terms, frameworks, and definitions.
3. **Callout slide** — eyebrow tag, headline, then a light-green callout panel with a bold takeaway message. Used for rules, warnings, and "your turn" hand-offs.

## File index

| Module | Files |
|---|---|
| 1 — Your AI Toolkit | [pptx/module-1/](pptx/module-1/) — intro, what-is-ai, toolkit, ground-rules |
| 2 — AI and Email | [pptx/module-2/](pptx/module-2/) — intro, fix-bad-email, summarize-thread, difficult-response |
| 3 — Reports and Documents | [pptx/module-3/](pptx/module-3/) — intro, report-from-scratch, rewriting-editing, templates |
| 4 — Spreadsheets and Data | [pptx/module-4/](pptx/module-4/) — intro, formulas, data-analysis, data-cleanup |
| 5 — Images, Video, and Media | [pptx/module-5/](pptx/module-5/) — intro, images, presentations, video-audio |
| 6 — Document Processing and Search | [pptx/module-6/](pptx/module-6/) — intro, search, analyze-document, extract-data |
| 7 — AI Agents | [pptx/module-7/](pptx/module-7/) — intro, what-agents-do, portal-agents, agent-prompting |
| 8 — Power User Tools | [pptx/module-8/](pptx/module-8/) — intro, cowork, code, workflow |

## Regenerating the decks

The decks are generated from a single source-of-truth Python script.

```bash
python3 scripts/generate-slide-decks.py
```

To edit content, change the `DECKS` list in
[`scripts/generate-slide-decks.py`](../../../scripts/generate-slide-decks.py)
and re-run. To restyle (colors, fonts, layout), edit the theme constants and
slide-builder helpers at the top of the same file. All 32 files regenerate in
under a second.

## Detailed outlines (for reference)

The original long-form, slide-by-slide outlines (with B-roll cues, timing, and
script cross-references) are kept in the `module-N-slides.md` files in this
folder. They're useful as planning notes, but the **`.pptx` files in `pptx/`
are now the source of truth** for what gets shown alongside the videos.

| Module | Outline |
|---|---|
| 1 | [module-1-slides.md](module-1-slides.md) |
| 2 | [module-2-slides.md](module-2-slides.md) |
| 3 | [module-3-slides.md](module-3-slides.md) |
| 4 | [module-4-slides.md](module-4-slides.md) |
| 5 | [module-5-slides.md](module-5-slides.md) |
| 6 | [module-6-slides.md](module-6-slides.md) |
| 7 | [module-7-slides.md](module-7-slides.md) |
| 8 | [module-8-slides.md](module-8-slides.md) |
