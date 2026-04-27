# Module 4 — Lesson Scripts

**Module:** Spreadsheets and Data
**Instructor:** Bobby
**Audience:** Cashman employees, brand new to AI

Each lesson script is sized for a ~2–3 minute Descript voiceover. Professional
terms appear in **bold** the first time they're used and are explained inline.

---

## Lesson 1 — AI-Powered Formulas

**Lesson runtime estimate:** ~2 min 45 sec
**Activity at end of lesson:** Exercise — paste in three AI-generated Excel formulas

### Title card

> **Lesson 1 — AI-Powered Formulas**
> Stop Googling. Start describing.

### Script

Quick show of hands -- how many people in this room have, in the last week, Googled "Excel IF formula" or "VLOOKUP example"? Yeah. Same.

That whole workflow goes away with AI.

The new workflow is: open Copilot in Excel, or open the Cashman AI Portal, and just *describe what you want in plain English*. "I have a budget in column B and actual spend in column C. Give me a formula in column F that says OVER BUDGET if Spent is greater than Budget, ON TRACK if it's within ten percent, and UNDER BUDGET otherwise."

Done. AI hands you the formula.

There are a couple of professional terms here worth knowing. The fancy name for what we're building is **conditional logic** -- formulas that produce different results depending on what's in the data. The Excel functions that do this are usually called `IF`, `IFS`, or `SWITCH`. AI will pick the right one.

There's also a concept called **absolute vs. relative cell references**. A reference like `B2` shifts when you copy the formula down -- that's relative. A reference like `$B$2` doesn't shift -- that's absolute. Get this wrong and your formulas silently break when you fill them down a column. AI usually gets it right, but not always. Which leads me to the rule for this whole module.

**Always test the formula.** Always. Even when it looks right.

The drill is simple. Plug in numbers where you already know the answer. If your budget is $100,000 and spent is $110,000, the status flag should say OVER BUDGET. If the formula says ON TRACK, you've found a bug. Better to find it now than in a board meeting next week.

There's a name for this discipline that comes from software engineering. It's called **unit testing** -- you test small pieces of logic in isolation with known inputs to make sure they work. Same idea. Test your formulas with known values before you trust them.

Below you'll see a project cost spreadsheet layout. Ask AI for formulas for the Remaining column, the % Complete column, and the Status Flag column. Paste them into the exercise. Let's go.

### B-roll / Visuals

- 0:00–0:15 — Bobby on camera.
- 0:15–0:30 — Comic-style montage: someone Googling Excel formulas, scrolling forum threads. Caption: "The old way."
- 0:30–1:00 — Screen capture: Copilot pane in Excel, plain-English description typed, formula auto-fills.
- 1:00–1:30 — Animated graphic: an `IF` formula expanding visually. Captions appear: "Conditional Logic."
- 1:30–1:55 — Side-by-side: relative vs absolute references. A formula being copied down a column. The relative shifts; the absolute holds.
- 1:55–2:25 — Quick sequence: typing a known-answer test value into the spreadsheet, formula returning the expected result, green checkmark. Caption: "Unit testing for formulas."
- 2:25–2:40 — Bobby hands off to the exercise.

### On-screen text cues

- "Describe it. Don't Google it."
- "New term: Conditional Logic — IF / IFS / SWITCH."
- "New term: Absolute vs Relative References."
- "Always test with known values."

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

- 0:00–0:15 — Bobby on camera.
- 0:15–0:35 — Screen capture: someone staring at a giant spreadsheet of project records, scrolling endlessly.
- 0:35–1:05 — Animated graphic: pivot table forming itself in Excel from raw data. Caption: "Pivot Table."
- 1:05–1:30 — Two animated lines moving in sync. Caption: "Correlation." Then: "Correlation ≠ Causation" with a red strikethrough on the equals sign.
- 1:30–1:55 — Bar chart with only a handful of bars per category. Tiny "p-value" tooltip appears, then a sad face. Caption: "Statistical significance."
- 1:55–2:25 — Split screen: AI suggesting an analysis (left) and a human reviewing it critically (right). Caption: "Domain expertise."
- 2:25–2:45 — Bobby hands off to the exercise.

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

- 0:00–0:15 — Bobby on camera.
- 0:15–0:30 — Visual: three sticky notes with three messy formats, getting fed into a "normalizer" funnel.
- 0:30–0:55 — Out of the funnel: a single clean table. Caption: "Data Normalization."
- 0:55–1:20 — Animated diagram of a schema: column names and types lining up. Caption: "Schema."
- 1:20–1:50 — Highlighter drawing attention to a row in the cleaned table where an edge case ("all day") was interpreted. Caption: "Spot-check the edges."
- 1:50–2:15 — Quick text overlay listing data quality dimensions: Accuracy · Completeness · Consistency · Timeliness.
- 2:15–2:30 — Bobby wraps Module 4.

### On-screen text cues

- "New term: Normalization — same shape, same units."
- "New term: Schema — the blueprint of your data."
- "Spot-check the edge cases."
- "New concept: Data Quality."
