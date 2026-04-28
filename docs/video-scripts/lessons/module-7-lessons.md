# Module 7 — Lesson Scripts

**Module:** AI Agents
**Instructor:** Peter
**Audience:** Cashman employees, brand new to AI

Each lesson script is sized for a ~2–3 minute Descript voiceover. Professional
terms appear in **bold** the first time they're used and are explained inline.

---

## Lesson 1 — What Agents Can Do

**Lesson runtime estimate:** ~2 min 30 sec
**Activity at end of lesson:** Quiz (3 questions)

### Title card

> **Lesson 1 — What Agents Can Do**
> Same intern. New desk.

### Script

Up to this point in the course, every AI tool we've used has worked the same way. You type. It types back. That's a **chatbot**. Useful, but limited.

This module is about the next step: **agents**.

An agent isn't a different model. It's the same kind of AI we've been using -- but now it's been hooked up to **tools**. In the AI world, a "tool" is a specific capability the agent can invoke. Searching a database. Querying a project record. Running a calculation. Calling another system. Even drafting and sending a document. The technical term for this is **tool use** -- sometimes also called **function calling**, because the agent is calling specific functions to get things done.

So instead of just talking, an agent can take the goal you give it -- *"find all overdue RFIs and draft follow-up emails"* -- and break that down into steps. Search the RFI tracker. Filter by status. Group by recipient. Draft an email per recipient. That's called **multi-step reasoning** or **agentic reasoning**, and it's the thing that makes agents qualitatively different from chatbots.

The mental model I want you to leave this lesson with is this. A chatbot is like talking to a brilliant intern. An agent is the same intern, but you've given them a desk, a computer, and access to your file systems. They can actually go look things up and do things, not just talk about them.

A few professional terms that come with this territory.

**Orchestration.** That's the act of stringing tools together in the right order to accomplish a goal. Good agents are good at orchestration.

**Human in the loop.** That's the deliberate design choice to require a human approval before the agent does anything irreversible. Sending the email. Updating a record. Issuing a payment. Even very capable agents should *propose* consequential actions and *wait* for sign-off, not act autonomously. At Cashman, we treat this as a core design principle.

**Autonomy.** That's the spectrum of how much the agent can do without checking in. Low autonomy = ask for approval at every step. High autonomy = act, then report. As a rule, more autonomy means more trust required, and more risk if something goes wrong. We bias toward low autonomy at first.

A short quiz is coming up to lock these concepts in. Then we'll get hands-on with a real agent in the Portal.

### B-roll / Visuals

- 0:00–0:15 — Peter on camera.
- 0:15–0:35 — Side-by-side: "Chatbot" (text only) vs "Agent" (text + animated icons of database, file, calculator, email).
- 0:35–1:00 — Animated graphic: an agent breaking a single goal into sub-tasks, with arrows showing tool calls. Caption: "Multi-step reasoning."
- 1:00–1:25 — Visual metaphor: an intern at a desk, with file cabinets opening, a calculator running, a chart being assembled. Caption: "Same intern. New desk."
- 1:25–1:55 — Slider visual: "Low Autonomy" ↔ "High Autonomy." A "Human in the Loop" gate sits in the middle. Important actions hit the gate.
- 1:55–2:20 — Peter hands off to the quiz.

### On-screen text cues

- "Chatbots talk. Agents act."
- "New term: Tool Use / Function Calling."
- "New term: Orchestration."
- "Human in the loop = approval before consequential actions."

---

## Lesson 2 — Using Agents in the Cashman AI Portal

**Lesson runtime estimate:** ~3 min
**Activity at end of lesson:** Exercise — paste in an agent's response and your observations

### Title card

> **Lesson 2 — Using Portal Agents**
> Watch the agent show its work.

### Script

Now let's actually use one.

The Cashman AI Portal includes pre-built agents for common tasks -- searching documents, querying project data, aggregating numbers across records. Each agent is built around a specific purpose, with access to a specific set of tools and data sources.

Here's what to watch for when you interact with one. A good agent **shows its work**. You'll see signals like:

**Tool calls.** The agent will say something like *"Searching the project database for…"* or *"Querying equipment records…"* That's the agent telling you which tool it just invoked. The technical term in the industry is a **trace** -- a step-by-step record of what the agent did. Good agents expose their trace.

**Citations.** Just like in document search, when an agent gives you a fact, it should tell you where it came from. *"Source: PRJ-2026-0142, Section 3.2."* If you can click through and verify, even better.

**Multi-step output.** A complex request might come back as a sequence of findings, not a single answer. *"Step 1: Found 12 overdue RFIs. Step 2: Grouped by client. Step 3: Drafted three follow-up emails."* That's the agent walking you through its reasoning.

There's a useful concept here called **explainability**. That's how easy it is to understand *why* an agent did what it did. High-explainability agents show their tools, their reasoning, and their sources. Low-explainability agents just spit out an answer. When the stakes are real, you want high explainability.

Now -- the trap to avoid. There's a phenomenon called **automation bias**. It's a documented finding from human factors research: people tend to *over-trust* automated systems, especially when those systems look polished and confident. Agents look polished and confident. They cite sources. They show steps. They produce neat tables. All of that makes them feel more trustworthy than they actually are.

Your defense is the same defense that's run through this whole course: **verify**. Click the citations. Spot-check the calculations. Ask yourself: *"Does this answer make sense based on what I already know?"* And use the **human-in-the-loop** principle from the last lesson -- if the agent proposes an action, *you* approve it.

Down below, your task is to open the Portal, find an available agent, and give it a real task. Watch what it does differently from regular chat. Paste the response and your observations.

### B-roll / Visuals

- 0:00–0:15 — Peter on camera.
- 0:15–0:40 — Screen capture: opening an agent in the Portal, prompt typed, agent responding with explicit "Searching…", "Querying…" tool-call lines.
- 0:40–1:05 — Visual: a "Trace" panel showing each step the agent took, with timestamps and tool names.
- 1:05–1:30 — Cursor clicking a citation. Source document opens. Caption: "Always verify."
- 1:30–2:00 — Brain icon with green checkmark labeled "Explainable." Brain icon with red X labeled "Black Box." Side by side.
- 2:00–2:30 — Animation: a person nodding too quickly at a polished-looking automated answer. Caption: "Automation Bias."
- 2:30–2:50 — Peter hands off to the exercise.

### On-screen text cues

- "Watch for tool calls, citations, and steps."
- "New term: Trace — the agent's step-by-step record."
- "New concept: Explainability."
- "Trap: Automation Bias. Defense: verify."

---

## Lesson 3 — Effective Agent Prompting

**Lesson runtime estimate:** ~2 min 45 sec
**Activity at end of lesson:** Exercise — paste in three specific agent prompts

### Title card

> **Lesson 3 — Effective Agent Prompting**
> Vague goals get vague results.

### Script

Agents are more capable than chatbots. But that capability is wasted if you give them vague instructions. So this lesson is about writing prompts an agent can actually act on.

The pattern I teach is what I call the **WHO–WHAT–WHERE–HOW framework**.

**WHO** -- which agent or persona is doing the work? Sometimes you specify this directly. *"Acting as a project controls analyst…"*

**WHAT** -- the specific task. Not "look at the data," but *"find all RFIs that have been open more than 14 days."*

**WHERE** -- the data source. *"Search the project documents for the Galveston Wharf project."* Without this, the agent might guess wrong about which dataset to query.

**HOW** -- the output format you want. *"Return a table with columns: RFI Number, Subject, Days Open, Owner."*

Put those four together and you get a prompt the agent can execute precisely. Compare these:

**Bad:** *"Tell me about the project."*

**Good:** *"Acting as a project controls analyst, search our documents for the Galveston Wharf project. Give me the current schedule status, any open RFIs older than 14 days, and the date of the last safety inspection. Format as three short sections."*

Same task. Wildly different result.

A couple more concepts that'll make you better at this.

**Constraints.** Tell the agent what *not* to do. *"Only use data from 2026."* *"Don't include personnel records."* *"If you can't find the answer in the cited sources, say 'I don't know' instead of guessing."* That last one is gold. It dramatically reduces hallucinations.

**Output schema.** When you need the agent's output to feed into another system or report, specify the **schema** -- the exact columns or fields you want. AI is much more reliable when given a strict schema than when left to invent its own format.

And one more time, because it bears repeating: agents look more capable than they are. **Verify the citations. Spot-check the calculations.** A confident agent answer can still be wrong.

For the exercise, write three prompts using the WHO–WHAT–WHERE–HOW framework. One for information retrieval. One for cross-record analysis. One for a formatted deliverable. Paste all three in. That closes Module 7.

### B-roll / Visuals

- 0:00–0:15 — Peter on camera.
- 0:15–0:45 — Animated graphic: WHO · WHAT · WHERE · HOW appearing as four boxes that build a complete prompt.
- 0:45–1:15 — Side-by-side: "Bad Prompt" (3 words) vs "Good Prompt" (full sentence with all four elements). Both run; bad one returns generic mush, good one returns a tidy table.
- 1:15–1:45 — Visual: a "Constraints" sidebar with three sticky notes: "Only 2026 data," "No personnel records," "Say 'I don't know' if not found."
- 1:45–2:10 — Animated table forming column-by-column. Caption: "Output Schema."
- 2:10–2:30 — Final reminder card: "Verify. Always."
- 2:30–2:45 — Peter wraps Module 7.

### On-screen text cues

- "Pattern: WHO · WHAT · WHERE · HOW."
- "Tell the agent what NOT to do — Constraints."
- "Specify the Output Schema."
- "Capability ≠ Accuracy. Verify."
