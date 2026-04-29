# Module 4 — Slide Decks

Four decks for Module 4: **Spreadsheets and Data** (instructor: Peter).

---

## Deck A — Module 4 Intro Video (~75 sec)

### Slide A1 — Title
- **Layout:** Full-bleed title
- **Headline:** Module 4 — Spreadsheets and Data
- **Subhead:** Stop Googling formulas. Just describe what you want.
- **Visual:** Spreadsheet icon + chat bubble.
- **Timing:** 0:00–0:08

### Slide A2 — The Old Way
- **Layout:** Image quote
- **Headline:** Google → forum → ads → adapt → hope.
- **Body:** Done.
- **Visual:** Browser tabs piling up.
- **Timing:** 0:10–0:25

### Slide A3 — The New Way
- **Layout:** Big text card
- **Headline:** Describe it. Don't Google it.
- **Body:** "Make column F say OVER BUDGET if Spent is greater than Budget."
- **Visual:** Excel sidebar with prompt typed in.
- **Timing:** 0:25–0:50

### Slide A4 — Three Lessons
- **Layout:** Three numbered cards
- **Headline:** Three things you'll do today:
- **Body:**
  - 1 — AI-powered formulas
  - 2 — Smarter analysis
  - 3 — Cleaner data
- **Visual:** Three small icons.
- **Timing:** 0:50–1:10

### Slide A5 — The Rule
- **Layout:** Big warning
- **Headline:** Always test the formula.
- **Body:** Trust, but verify. Plug in known values.
- **Visual:** Test value → expected output → green check.
- **Timing:** 1:10–1:25

---

## Deck B — Lesson 1: AI-Powered Formulas (~3 min 30 sec)

### Slide B1 — Title
- **Layout:** Full-bleed title
- **Headline:** Lesson 1 — $32M Schedule of Values
- **Subhead:** Real-shaped formulas. Real verification. Downloadable.
- **Visual:** Excel icon over a stylized version of the SoV header (cream/green).
- **Timing:** 0:00–0:15

### Slide B2 — The Project
- **Layout:** Image + caption
- **Headline:** Hypothetical $32M marine project
- **Body:**
  - 21 line items, 7 CSI MasterFormat divisions
  - ~32% billed through this period
  - 10% retention until punch-list closeout
- **Visual:** Cropped screenshot of the workbook header showing the green-styled headers and a few rows.
- **Timing:** 0:15–0:45

### Slide B3 — Define Schedule of Values + CSI MasterFormat
- **Layout:** Two-term card
- **Headline:** Two terms worth knowing
- **Body:**
  - **Schedule of Values** — line-by-line breakdown of the contract, used for owner pay applications.
  - **CSI MasterFormat** — the standard division taxonomy: 01 General, 03 Concrete, 05 Metals, 31 Earthwork, 35 Marine, etc.
- **Visual:** Construction taxonomy tree with a few divisions highlighted.
- **Timing:** 0:45–1:15

### Slide B4 — Inputs vs Formulas
- **Layout:** Two-column split
- **Headline:** What's filled in. What you write.
- **Body:**
  - **Filled in:** Total Contract · Previously Billed · This Period
  - **You write:** Total Billed · % Complete · Remaining · Retention · Net Earned · Status · SUMIFS subtotals · Project total
- **Visual:** Two columns of a workbook screenshot, with the "you write" side highlighted green.
- **Timing:** 1:15–1:45

### Slide B5 — IFS Status Flag
- **Layout:** Code/quote block
- **Headline:** Order matters in `IFS`.
- **Body:** *Most-specific first:*
  `=IFS(D6=0,"",H6=1,"COMPLETE",H6>=0.9,"NEAR COMPLETE",H6>0,"IN PROGRESS",TRUE,"NOT STARTED")`
- **Visual:** Animation showing the formula evaluating top-down on three test rows.
- **Timing:** 1:45–2:15

### Slide B6 — SUMIFS by Division
- **Layout:** Code/quote block
- **Headline:** Subtotal by division
- **Body:** `=SUMIFS(D$6:D$26, $B$6:$B$26, $B28)`
  - First arg = column to SUM
  - Then alternating range/criteria pairs
  - Use `$` to lock the data range when dragging
- **Visual:** Workbook screenshot with the division subtotal block highlighted.
- **Timing:** 2:15–2:45

### Slide B7 — Always Test
- **Layout:** Big text card
- **Headline:** Test with known rows.
- **Body:**
  - Bonds & Insurance: 100% billed → status = COMPLETE, remaining = $0
  - Backfill: 0% billed → status = NOT STARTED, remaining = $1.4M
  - Sum of division subtotals (D) should = $32,000,000
- **Visual:** Three test rows with green checkmarks.
- **Timing:** 2:45–3:05

### Slide B8 — Weighted ≠ Averaged
- **Layout:** Warning card
- **Headline:** Project % complete is weighted.
- **Body:** Use `=SUM(G6:G26)/SUM(D6:D26)`. NOT `=AVERAGE(H6:H26)`. AI gets this wrong sometimes — catch it.
- **Visual:** Side-by-side: weighted (33%, correct) vs averaged (51%, wrong) — red strikethrough on the wrong one.
- **Timing:** 3:05–3:25

### Slide B9 — Action
- **Layout:** Action card
- **Headline:** Your turn.
- **Body:** Download the workbook. Run your prompts. Verify with known values. Paste your formulas back.
- **Visual:** Down-arrow + Excel icon.
- **Timing:** 3:25–3:30

---

## Deck C — Lesson 2: Data Analysis with AI (~3 min)

### Slide C1 — Title
- **Layout:** Full-bleed title
- **Headline:** Lesson 2 — Data Analysis with AI
- **Subhead:** Your on-call analyst.
- **Visual:** Bar chart icon + chat bubble.
- **Timing:** 0:00–0:10

### Slide C2 — The Power Move
- **Layout:** Code/quote block
- **Headline:** Don't ask AI to analyze. Ask it to suggest.
- **Body:** *"I have a dataset of 50 projects. What analyses should I run to understand which types go over budget?"*
- **Visual:** Quote block.
- **Timing:** 0:15–0:45

### Slide C3 — Define Pivot Table
- **Layout:** Term + definition
- **Headline:** New term: Pivot Table
- **Body:** An Excel tool that summarizes a dataset by categories — average overrun by project type, total COs by client, etc.
- **Visual:** Pivot table forming itself from raw rows.
- **Timing:** 0:45–1:05

### Slide C4 — Define Variance
- **Layout:** Term + definition
- **Headline:** New term: Variance
- **Body:** The difference between expected and actual.
- **Visual:** Two bars side by side: planned vs actual, with the gap highlighted.
- **Timing:** 1:05–1:25

### Slide C5 — Correlation ≠ Causation
- **Layout:** Big warning card
- **Headline:** Correlation ≠ Causation.
- **Body:** Two things moving together does NOT mean one caused the other. AI sometimes forgets this. You should not.
- **Visual:** Two parallel lines moving up — then a red strikethrough on an "=" sign.
- **Timing:** 1:25–1:55

### Slide C6 — Statistical Significance
- **Layout:** Tip card
- **Headline:** New term: Statistical Significance
- **Body:** Do you have enough data to trust this finding? 50 projects across 4 types = ~12 each. That's not much.
- **Visual:** Bar chart with thin error bars; sad-face icon.
- **Timing:** 1:55–2:20

### Slide C7 — Domain Expertise
- **Layout:** Two-column split
- **Headline:** AI suggests the approach. You bring the judgment.
- **Body:**
  - **AI:** suggests methods
  - **You:** know whether they fit your data
- **Visual:** Robot icon + hardhat icon meeting in the middle.
- **Timing:** 2:20–2:45

### Slide C8 — Action
- **Layout:** Action card
- **Headline:** Your turn.
- **Body:** Ask AI what analyses to run on the 50-project dataset. Paste the recommendation back.
- **Visual:** Down-arrow.
- **Timing:** 2:45–3:00

---

## Deck D — Lesson 3: Data Cleanup (~2 min 30 sec)

### Slide D1 — Title
- **Layout:** Full-bleed title
- **Headline:** Lesson 3 — Data Cleanup
- **Subhead:** Three formats in. One clean table out.
- **Visual:** Three messy notes → tidy spreadsheet.
- **Timing:** 0:00–0:10

### Slide D2 — The Mess
- **Layout:** Three quote blocks
- **Headline:** Real-world equipment data:
- **Body:**
  - *"200T Crane - 8hrs"*
  - *"Manitowoc 2250 operated 0600-1400"*
  - *"crane,8,operating | excavator,6.5,operating"*
- **Visual:** Three styled sticky notes.
- **Timing:** 0:15–0:35

### Slide D3 — Define Normalization
- **Layout:** Term + definition
- **Headline:** New term: Data Normalization
- **Body:** Taking inconsistent data and forcing it into a consistent structure.
- **Visual:** Funnel diagram: messy in → clean out.
- **Timing:** 0:35–1:00

### Slide D4 — Define Schema
- **Layout:** Term + definition
- **Headline:** New term: Schema
- **Body:** The blueprint for how a dataset is organized — what columns exist, what values are allowed.
- **Visual:** Column headers with type icons (text, number, status).
- **Timing:** 1:00–1:25

### Slide D5 — Sample Prompt
- **Layout:** Code/quote block
- **Headline:** Sample prompt:
- **Body:** *"Take these three formats and normalize them into a table with columns: Equipment Type, Description, Hours, Status."*
- **Visual:** Prompt → arrow → clean table.
- **Timing:** 1:25–1:50

### Slide D6 — Spot-Check
- **Layout:** Tip card
- **Headline:** Always check the edge cases.
- **Body:** Did "all day" become 8, 10, or 12 hours? Did "standby" stay distinct? Spot-check a few rows.
- **Visual:** Highlighted row in a clean table with a magnifying glass.
- **Timing:** 1:50–2:10

### Slide D7 — Define Data Quality
- **Layout:** Four-card strip
- **Headline:** New concept: Data Quality
- **Body:** Accuracy · Completeness · Consistency · Timeliness
- **Visual:** Four small icons in a row.
- **Timing:** 2:10–2:25

### Slide D8 — Action + Module Wrap
- **Layout:** Action card
- **Headline:** Your turn.
- **Body:** Normalize the messy equipment data. Paste your table.
- **Visual:** Down-arrow + "Data Wrangler" badge appearing.
- **Timing:** 2:25–2:30
