# Module 4 — Lesson Scripts

**Module:** Spreadsheets and Data
**Instructor:** Peter
**Audience:** Cashman employees, brand new to AI

Each lesson script is sized for a ~2–3 minute Descript voiceover. Professional
terms appear in **bold** the first time they're used and are explained inline.

---

## Lesson 1 — AI-Powered Formulas

**Lesson runtime estimate:** ~3 min 30 sec
**Activity at end of lesson:** Exercise — download the $32M Schedule of Values workbook and paste back the AI-generated formulas

### Title card

> **Lesson 1 — AI-Powered Formulas**
> A real $32M schedule of values. Real formulas. Real verification.

### Script

Quick show of hands -- how many people in this room have, in the last week, Googled "Excel IF formula" or "VLOOKUP example"? Yeah. Same.

That whole workflow goes away with AI.

The new workflow is: open Copilot in Excel, or the Cashman AI Portal, and just *describe what you want in plain English*. "Total Billed equals Previously Billed plus This Period." Done. AI hands you the formula.

But I don't want to demo this on a toy example. So for this lesson, we built a downloadable Excel workbook -- a hypothetical thirty-two-million-dollar marine project, with a real-shaped **schedule of values**. That term is worth knowing. A schedule of values is a line-by-line breakdown of the contract, organized by **CSI MasterFormat division** -- the standard construction taxonomy: zero-one for general requirements, zero-three for concrete, zero-five for metals, three-five for marine, and so on. The owner pays from this schedule, line by line, with a percent-complete on each.

The workbook has twenty-one line items. We've filled in three columns for you: Total Contract Amount, Previously Billed, and This Period. Your job, with AI's help, is to write the formulas for the rest:

**Total Billed.** Previously plus this period.

**Percent Complete.** Total Billed divided by Total Contract -- watch out for divide-by-zero on empty rows.

**Remaining.** Total Contract minus Total Billed.

**Retention.** Ten percent of Total Billed -- the owner holds that back until punch list completion.

**Net Earned.** Total Billed minus Retention.

**Status flag.** Multi-condition: COMPLETE, NEAR COMPLETE, IN PROGRESS, or NOT STARTED, depending on the percent-complete.

Plus -- and this is the harder part -- **division subtotals**. For each division, you need a `SUMIFS` formula that totals just the lines belonging to that division. And a project-total row at the bottom.

A few professional terms while we're here. **Conditional logic** -- formulas that produce different results depending on the data. That's the `IF`, `IFS`, or `SWITCH` family. **Absolute versus relative references** -- `B2` shifts when you drag the formula down, `$B$2` doesn't. Get that wrong and your SUMIFS criteria silently move and you get nonsense subtotals.

And the rule for the whole module, applied to a real-money project: **always test the formula.** A wrong formula on a thirty-two-million-dollar pay app is a real-money mistake. The drill: plug in known values. The Bonds and Insurance line is one hundred percent billed -- so its status should say COMPLETE and its remaining should be zero. The Backfill line hasn't started -- its status should say NOT STARTED and its remaining should equal the contract amount. If the formula gives the wrong answer there, you've found a bug. There's a name for this in software: **unit testing**. Test small pieces of logic with known inputs.

One last gotcha: the project-wide percent complete should be computed from the *totals* -- total billed divided by total contract -- not by averaging the row percentages. A weighted average is not the average of weighted values. AI will sometimes confidently get this wrong. Catch it.

Download the workbook below. Run your prompts. Verify with known values. Paste your formulas in.

### B-roll / Visuals

- 0:00–0:15 — Peter on camera.
- 0:15–0:30 — Comic-style montage: someone Googling Excel formulas, scrolling forum threads. Caption: "The old way."
- 0:30–1:00 — Screen capture of the downloadable workbook scrolling through the 21 line items. Captions appear: "Schedule of Values · CSI MasterFormat · 21 line items · 7 divisions."
- 1:00–1:25 — Two-column animation: "Filled in" (Total Contract, Previously, This Period) vs "You write" (Total Billed, % Complete, Remaining, Retention, Net Earned, Status, SUMIFS, Project Total).
- 1:25–1:50 — Animated graphic showing an `IFS` formula building the four-condition status flag. Caption: "Order matters: most-specific first."
- 1:50–2:15 — A SUMIFS formula being typed; division subtotals filling in. Caption: "SUMIFS by division."
- 2:15–2:40 — A test row: Bonds & Insurance, 100% billed, status flag flashes "COMPLETE." A test row: Backfill, 0% billed, status "NOT STARTED." Green checkmarks. Caption: "Verify with known values."
- 2:40–3:05 — Side-by-side: weighted project % complete (correct) vs simple average of row %s (wrong). Caption: "Weighted ≠ averaged."
- 3:05–3:25 — Peter hands off to the exercise; cursor clicks the workbook download.

### On-screen text cues

- "Real $32M schedule of values. Downloadable."
- "New term: CSI MasterFormat — the construction division taxonomy."
- "New term: Conditional Logic — IF / IFS / SWITCH."
- "New term: SUMIFS — subtotal by criteria."
- "Always test with known values."
- "Project % complete is weighted — never averaged from rows."

---

## Lesson 2 — Data Analysis with AI

**Lesson runtime estimate:** ~3 min
**Activity at end of lesson:** Exercise — paste in AI's recommended analysis approach

### Title card

> **Lesson 2 — Data Analysis with AI**
> Your on-call analyst.

### Script

Most of us aren't data analysts by training. But we *do* have data -- project cost histories, equipment utilization logs, safety incident records, schedule variance data. The question is, what do you actually *do* with all of it?

AI can be your on-call analyst. Not to do the work for you, but to suggest the right *approach*.

Here's a really powerful prompt pattern. Don't ask AI to "analyze the data." Ask it: *"I have a dataset of fifty completed projects. Each has these fields. What analyses should I run to understand which project types tend to go over budget?"* You're asking AI to be your **research consultant** -- to suggest *what* to look at, not just to give you a number.

A few professional terms you'll hear AI use, and they're worth knowing.

**Pivot table** -- a tool inside Excel that lets you summarize a dataset by categories. Average cost overrun by project type. Total change orders by client. That kind of thing. Pivot tables are the workhorse of basic data analysis.

**Variance** -- the difference between what you expected and what actually happened. Schedule variance. Cost variance. AI loves variance analysis because it's how you find the projects that are off-plan.

**Correlation** -- whether two things move together. As change order count goes up, does final cost go up? That's a correlation. Important rule: **correlation is not causation**. Just because two things move together doesn't mean one caused the other. AI sometimes forgets this. You should not.

And one more, because it'll come up. **Statistical significance.** That's the question of *do I have enough data to trust this finding?* If you've got fifty projects spread across four types, that's only twelve or thirteen per type -- not enough to draw strong statistical conclusions. AI may suggest a regression analysis. That doesn't mean it's the right tool for your data.

The lesson here: AI is a great brainstorming partner for analysis. But you bring the **domain expertise** -- the judgment about whether the suggested approach actually makes sense for your data and your business question.

Down below, your task is to ask AI what analyses to run on a dataset of fifty completed Cashman projects. Paste the recommended approach into the exercise.

### B-roll / Visuals

- 0:00–0:15 — Peter on camera.
- 0:15–0:35 — Screen capture: someone staring at a giant spreadsheet of project records, scrolling endlessly.
- 0:35–1:05 — Animated graphic: pivot table forming itself in Excel from raw data. Caption: "Pivot Table."
- 1:05–1:30 — Two animated lines moving in sync. Caption: "Correlation." Then: "Correlation ≠ Causation" with a red strikethrough on the equals sign.
- 1:30–1:55 — Bar chart with only a handful of bars per category. Tiny "p-value" tooltip appears, then a sad face. Caption: "Statistical significance."
- 1:55–2:25 — Split screen: AI suggesting an analysis (left) and a human reviewing it critically (right). Caption: "Domain expertise."
- 2:25–2:45 — Peter hands off to the exercise.

### On-screen text cues

- "AI suggests the approach. You bring the judgment."
- "New term: Pivot Table — summarize by category."
- "New term: Variance — actual minus expected."
- "Correlation ≠ Causation."

---

## Lesson 3 — Data Cleanup and Transformation

**Lesson runtime estimate:** ~2 min 30 sec
**Activity at end of lesson:** Exercise — paste in a normalized table built from messy inputs

### Title card

> **Lesson 3 — Data Cleanup**
> Three formats in. One clean table out.

### Script

Real-world construction data is messy. Three different superintendents track equipment three different ways. One says "200T crane." Another says "Manitowoc 2250." A third uses a CSV-style format with pipes between fields. Trying to roll that up into a single report is painful. Manually painful.

AI cleans this up in seconds.

The professional term for what we're doing is **data normalization**. That's a fancy way of saying *taking inconsistent data and forcing it into a consistent structure*. Same column names, same units, same value formats. A normalized dataset is one you can actually analyze, chart, or feed into another system.

The related concept is a **schema**. A schema is the blueprint for how a dataset is organized -- what columns exist, what type each column holds, what values are allowed. When you ask AI to normalize messy data, you're really asking it to take a bunch of inconsistent records and conform them to a single schema.

The prompt pattern is simple. *"Take these three formats and normalize them into a table with these columns: Equipment Type, Description, Hours, Status."* You're handing AI the schema you want, and asking it to do the conformance work.

A small but important habit: when AI gives you back a table, **check the edge cases**. Did "all day" become 8 hours, or 10, or 12? Did "standby" stay distinct from "operating," or did they get merged? Did anything get dropped silently? AI is fast, but it occasionally summarizes when it should have preserved. Spot-check a few rows.

There's also a related concept worth naming: **data quality**. It's the catch-all term for accuracy, completeness, consistency, and timeliness of your data. Cleaning up messy formats is a data quality activity. Doing it well is what separates a report you can trust from a report you have to caveat.

Your exercise is below. Three messy equipment formats from three different superintendents. Paste them into AI. Ask for a normalized table. Spot-check it. Then paste the result into the exercise box. That's Module 4 done.

### B-roll / Visuals

- 0:00–0:15 — Peter on camera.
- 0:15–0:30 — Visual: three sticky notes with three messy formats, getting fed into a "normalizer" funnel.
- 0:30–0:55 — Out of the funnel: a single clean table. Caption: "Data Normalization."
- 0:55–1:20 — Animated diagram of a schema: column names and types lining up. Caption: "Schema."
- 1:20–1:50 — Highlighter drawing attention to a row in the cleaned table where an edge case ("all day") was interpreted. Caption: "Spot-check the edges."
- 1:50–2:15 — Quick text overlay listing data quality dimensions: Accuracy · Completeness · Consistency · Timeliness.
- 2:15–2:30 — Peter wraps Module 4.

### On-screen text cues

- "New term: Normalization — same shape, same units."
- "New term: Schema — the blueprint of your data."
- "Spot-check the edge cases."
- "New concept: Data Quality."
