# Module 7 — Slide Decks

Four decks for Module 7: **AI Agents** (instructor: Peter).

---

## Deck A — Module 7 Intro Video (~80 sec)

### Slide A1 — Title
- **Layout:** Full-bleed title
- **Headline:** Module 7 — AI Agents
- **Subhead:** Up to now, AI just talked. Now it can do.
- **Visual:** Robot icon + tools icons radiating out.
- **Timing:** 0:00–0:08

### Slide A2 — Chatbot vs Agent
- **Layout:** Two-column comparison
- **Headline:** Two very different things:
- **Body:**
  - **Chatbot:** types responses
  - **Agent:** can take actions
- **Visual:** Chat bubble vs robot with hands holding tools.
- **Timing:** 0:10–0:35

### Slide A3 — The Intern Analogy
- **Layout:** Image quote
- **Headline:** Same intern. New desk.
- **Body:** Now they have access to your file systems and can actually do things.
- **Visual:** Cartoon intern at a desk with file cabinets and a calculator.
- **Timing:** 0:35–1:00

### Slide A4 — Three Lessons
- **Layout:** Three numbered cards
- **Headline:** Three things you'll learn today:
- **Body:**
  - 1 — What agents can do
  - 2 — Use one in the Portal
  - 3 — Prompt them well
- **Visual:** Three small icons.
- **Timing:** 1:00–1:20

### Slide A5 — Big Warning
- **Layout:** Big text card
- **Headline:** Capability ≠ Accuracy.
- **Body:** Agents look impressive. Verify anyway.
- **Visual:** Red warning ribbon.
- **Timing:** 1:20–1:35

---

## Deck B — Lesson 1: What Agents Can Do (~2 min 30 sec)

### Slide B1 — Title
- **Layout:** Full-bleed title
- **Headline:** Lesson 1 — What Agents Can Do
- **Subhead:** Same intern. New desk.
- **Visual:** Robot + tool icons.
- **Timing:** 0:00–0:10

### Slide B2 — Define Tool Use
- **Layout:** Term + definition
- **Headline:** New term: Tool Use (or Function Calling)
- **Body:** An agent invoking a specific capability — search, query, calculate, send.
- **Visual:** Agent icon with arrows to: database, calculator, file, email.
- **Timing:** 0:15–0:45

### Slide B3 — Define Multi-Step Reasoning
- **Layout:** Term + definition
- **Headline:** New term: Multi-Step (Agentic) Reasoning
- **Body:** Breaking a goal into a sequence of steps and executing them.
- **Visual:** Goal → steps 1, 2, 3, 4 → result.
- **Timing:** 0:45–1:10

### Slide B4 — Concrete Example
- **Layout:** Quote / scenario
- **Headline:** Goal:
- **Body:** *"Find all overdue RFIs and draft follow-up emails."*
- **Sub-body:** Agent breaks this into: search → filter → group → draft.
- **Visual:** Flow diagram with each tool icon.
- **Timing:** 1:10–1:35

### Slide B5 — Define Orchestration
- **Layout:** Term + definition
- **Headline:** New term: Orchestration
- **Body:** Stringing tools together in the right order to accomplish a goal. Good agents are good at orchestration.
- **Visual:** Conductor icon + connected tool icons.
- **Timing:** 1:35–1:55

### Slide B6 — Human in the Loop
- **Layout:** Big text card
- **Headline:** Design principle: Human in the Loop.
- **Body:** Even capable agents should propose consequential actions and wait for approval.
- **Visual:** Approval gate icon between agent and action.
- **Timing:** 1:55–2:20

### Slide B7 — Quiz Hand-off
- **Layout:** Action card
- **Headline:** Quiz time — 3 questions.
- **Body:** Then we'll meet a real agent.
- **Visual:** "Start Quiz" button.
- **Timing:** 2:20–2:30

---

## Deck C — Lesson 2: Using Portal Agents (~3 min)

### Slide C1 — Title
- **Layout:** Full-bleed title
- **Headline:** Lesson 2 — Using Portal Agents
- **Subhead:** Watch the agent show its work.
- **Visual:** Portal icon + agent icon.
- **Timing:** 0:00–0:10

### Slide C2 — What to Watch For
- **Layout:** Three-column list
- **Headline:** A good agent shows its work.
- **Body:**
  - **Tool calls** — *"Searching project DB…"*
  - **Citations** — sources you can click
  - **Multi-step output** — visible reasoning
- **Visual:** UI mockup with each annotated.
- **Timing:** 0:15–0:45

### Slide C3 — Define Trace
- **Layout:** Term + definition
- **Headline:** New term: Trace
- **Body:** A step-by-step record of what the agent did. Good agents expose their trace so you can verify.
- **Visual:** Timeline of agent steps with timestamps.
- **Timing:** 0:45–1:15

### Slide C4 — Define Explainability
- **Layout:** Two-column comparison
- **Headline:** New concept: Explainability
- **Body:**
  - **High** — shows tools, reasoning, sources
  - **Low** — black box; just an answer
- **Visual:** Glass-box icon vs black-box icon.
- **Timing:** 1:15–1:40

### Slide C5 — Define Automation Bias
- **Layout:** Big warning card
- **Headline:** New trap: Automation Bias
- **Body:** People over-trust polished automated systems. Agents look polished. Don't fall for it.
- **Visual:** Person nodding along with a confident-looking AI screen.
- **Timing:** 1:40–2:10

### Slide C6 — Defense
- **Layout:** Three-card row
- **Headline:** Your defense:
- **Body:**
  - Click the citations
  - Spot-check the math
  - Keep a human in the loop
- **Visual:** Three checkmark cards.
- **Timing:** 2:10–2:35

### Slide C7 — Action
- **Layout:** Action card
- **Headline:** Your turn.
- **Body:** Open the Portal. Find an agent. Give it a real task. Paste the response and your observations.
- **Visual:** Down-arrow.
- **Timing:** 2:35–3:00

---

## Deck D — Lesson 3: Effective Agent Prompting (~2 min 45 sec)

### Slide D1 — Title
- **Layout:** Full-bleed title
- **Headline:** Lesson 3 — Effective Agent Prompting
- **Subhead:** Vague goals get vague results.
- **Visual:** Pencil icon + agent icon.
- **Timing:** 0:00–0:10

### Slide D2 — The Framework
- **Layout:** Four-box framework
- **Headline:** Pattern: WHO · WHAT · WHERE · HOW
- **Body:**
  - **WHO** — the persona or agent
  - **WHAT** — the specific task
  - **WHERE** — the data source
  - **HOW** — the output format
- **Visual:** Four labeled boxes building into a complete prompt.
- **Timing:** 0:15–0:50

### Slide D3 — Bad vs Good Prompt
- **Layout:** Side-by-side
- **Headline:** Same task. Wildly different result.
- **Body:**
  - **Bad:** *"Tell me about the project."*
  - **Good:** *"Acting as a project controls analyst, search our documents for the Galveston Wharf project. Give me schedule status, open RFIs older than 14 days, and the date of the last safety inspection. Format as three short sections."*
- **Visual:** Two prompts → two very different responses.
- **Timing:** 0:50–1:25

### Slide D4 — Define Constraints
- **Layout:** Tip card
- **Headline:** New concept: Constraints
- **Body:** Tell the agent what *not* to do.
- **Sub-body:** *"Only use 2026 data." · "No personnel records." · "If you can't find it in the cited sources, say 'I don't know.'"*
- **Visual:** Three sticky-note constraints.
- **Timing:** 1:25–1:55

### Slide D5 — Define Output Schema
- **Layout:** Term + definition
- **Headline:** New concept: Output Schema
- **Body:** The exact columns or fields you want. AI is more reliable when given strict schema than when left to invent format.
- **Visual:** Table mockup with column headers locked in.
- **Timing:** 1:55–2:20

### Slide D6 — Verify, Always
- **Layout:** Big text card
- **Headline:** Final reminder: verify.
- **Body:** Confident agent answers can still be wrong.
- **Visual:** Red checkmark + magnifying glass.
- **Timing:** 2:20–2:35

### Slide D7 — Action + Module Wrap
- **Layout:** Action card
- **Headline:** Your turn.
- **Body:** Write 3 prompts using WHO·WHAT·WHERE·HOW. Paste them all back.
- **Visual:** Down-arrow + "Agent Handler" badge animating in.
- **Timing:** 2:35–2:45
