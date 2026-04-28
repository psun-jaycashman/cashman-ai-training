# Module 6 — Lesson Scripts

**Module:** Document Processing and Search
**Instructor:** Peter
**Audience:** Cashman employees, brand new to AI

Each lesson script is sized for a ~2–3 minute Descript voiceover. Professional
terms appear in **bold** the first time they're used and are explained inline.

---

## Lesson 1 — Searching Company Documents

**Lesson runtime estimate:** ~3 min
**Activity at end of lesson:** Exercise — paste a Q&A from the Cashman AI Portal (or an explanation of RAG)

### Title card

> **Lesson 1 — Searching Company Documents**
> Stop hunting. Start asking.

### Script

I want to start with a question. When was the last time you needed *one specific page* out of a 200-page spec, and spent twenty minutes scrolling through PDFs trying to find it? Or asked three different colleagues what our policy is on something, and got three different answers?

This lesson is about ending that.

Old-school search -- the kind you've used your whole career -- works on **keyword matching**. If the document literally says "PFD" and you typed "life jacket," you get nothing. Even though you and the document are talking about the same thing.

AI search works differently. It uses something called **semantic search**. Same root as the word *meaning*. It compares the *meaning* of your question to the *meaning* of every passage in your documents -- not just the exact words. So a question about "life jackets" finds the safety manual section that talks about "PFDs" because, semantically, they're the same thing.

How does it actually work under the hood? Without going too deep, the system converts every passage in your documents into a kind of mathematical fingerprint -- the technical term is an **embedding**. Your question gets turned into the same kind of fingerprint. Then the system finds the passages whose fingerprints are closest to your question's fingerprint. Those are the most semantically relevant passages, and they get fed to AI to generate the answer.

That whole technique has a name: **RAG**, which stands for **Retrieval-Augmented Generation**. The mental model I want you to have is *open-book exam*. AI is great at writing -- but on company-specific questions, it doesn't *know* anything about Cashman. RAG lets it look up the answer in our actual documents instead of guessing from memory. Then it writes the answer based on what it found, and ideally, **cites** the source document so you can verify.

That citation piece is huge. A good RAG system tells you exactly where the answer came from. *"Source: Project_Spec_v3.pdf, page 47."* You should always click through and verify the citation, because -- as we covered earlier -- AI can occasionally cite a source that doesn't quite say what AI claims.

And one more critical reminder, because it ties into everything: **company documents stay on company infrastructure**. The Cashman AI Portal does this RAG processing on our own servers. If you uploaded those same documents to a public AI tool, that data would leave the building. Don't do that.

For the exercise, go to the Portal. Ask it a question about company procedures. Paste the question and the answer. If documents aren't loaded yet for your role, ask AI to explain how RAG works and paste that.

### B-roll / Visuals

- 0:00–0:15 — Peter on camera.
- 0:15–0:35 — Frustrated person scrolling through endless PDFs and SharePoint folders.
- 0:35–1:00 — Animated comparison: "Keyword Search" misses the "PFD" doc when you searched "life jacket." "Semantic Search" finds it. Caption appears.
- 1:00–1:30 — Visual metaphor: each passage being converted into a colorful "fingerprint" floating in a 3D space. Caption: "Embeddings."
- 1:30–2:00 — Open-book exam metaphor: a student opening a textbook to find the answer. Big text overlay: "RAG = Open-Book Exam."
- 2:00–2:25 — Screen capture: a question answered in the Portal, with a citation link. Cursor clicks the citation, document opens to the right page.
- 2:25–2:45 — Locked-down server icon vs. cloud icon with a red X. Caption: "Company docs stay on company infrastructure."
- 2:45–3:00 — Peter hands off to the exercise.

### On-screen text cues

- "Old: keyword match. New: semantic search."
- "New term: Embedding — a meaning fingerprint."
- "New term: RAG — Retrieval-Augmented Generation."
- "Always verify the citation."

---

## Lesson 2 — Analyzing Uploaded Documents

**Lesson runtime estimate:** ~3 min
**Activity at end of lesson:** Exercise — paste in AI's answers to three questions about an uploaded document

### Title card

> **Lesson 2 — Analyzing a Document**
> Three questions. Three minutes. Done.

### Script

Last lesson, we used AI to search *across* our documents. This lesson, we go the other direction -- we hand AI *one* document and ask it to analyze it for us.

The use case is everywhere. A sixty-page spec. A new safety plan. A vendor proposal. A subcontract amendment. A change order package. You don't always have time to read the whole thing carefully. But you can't afford to miss what matters.

The technique is what I call the **three-question pattern**. Almost any document analysis comes down to three questions:

**One** -- *What are the key requirements?* What does this document obligate someone to do?

**Two** -- *What are the deadlines or time-sensitive items?* What's going to bite us if we miss it?

**Three** -- *What are the risks or potential issues?* Where could this go sideways?

Ask AI those three questions on any document and you'll have a working understanding in under five minutes.

A few professional habits to pair with this.

**Be specific.** "What environmental permits are required and when must they be obtained?" beats "tell me about this document." Specificity gets you signal. Vagueness gets you noise.

**Ask follow-ups.** AI's first answer is rarely the last word. *"You mentioned a 30-day notice requirement. Where exactly in the document does it say that?"* That's the move. You're keeping AI grounded in the actual source, and you're verifying as you go.

Now -- the technical reality you need to know about. AI has a limit on how much text it can read at one time. The term is the **context window**. Modern tools are huge -- some can hold an entire 200-page document -- but they have known weaknesses. There's a documented effect called **lost-in-the-middle**, where AI focuses heavily on the beginning and end of a long document and quietly skips details in the middle.

The defense is simple. For very long documents, **break them into sections** and analyze each section separately. As a final check, always ask: *"Is there anything else in this document I should know about?"* That sometimes surfaces things AI missed on the first pass.

Your task is below. Find a non-sensitive document -- a public spec, an article, even a sample safety plan. Upload it to the Portal or paste a section in. Ask the three questions. Paste the answers into the exercise.

### B-roll / Visuals

- 0:00–0:15 — Peter on camera.
- 0:15–0:35 — Stack of thick documents thudding onto a desk. Caption: "Don't read it all. Question it."
- 0:35–1:05 — Animated graphic: three big question marks, each with a label: "Requirements," "Deadlines," "Risks."
- 1:05–1:30 — Screen capture: document uploaded to Portal, three questions asked, answers appearing.
- 1:30–1:55 — Visual metaphor for the context window: a horizontal bar with a long document scrolling through it. The middle section gently fades. Caption: "Lost in the middle."
- 1:55–2:20 — Visual: a long document being chopped into sections, each analyzed separately, results combined. Caption: "Section by section."
- 2:20–2:45 — Peter hands off to the exercise.

### On-screen text cues

- "Pattern: Requirements · Deadlines · Risks."
- "Be specific. Ask follow-ups."
- "New term: Context Window."
- "Watch for the lost-in-the-middle effect."

---

## Lesson 3 — Extracting Structured Data

**Lesson runtime estimate:** ~2 min 30 sec
**Activity at end of lesson:** Exercise — paste in a requirements table extracted from a spec paragraph

### Title card

> **Lesson 3 — Extracting Structured Data**
> Wall of text in. Action-ready table out.

### Script

Specifications are dense. A single paragraph in a USACE spec can hide eight or nine separate requirements -- a 14-day submittal deadline, a certification requirement, daily monitoring, weekly reporting, a special qualification for welders. Miss one and you've got a noncompliance.

This lesson's about turning that wall of text into a structured table you can actually act on.

The technical capability is called **structured data extraction**. AI reads unstructured text -- a paragraph, a memo, an email -- and pulls out specific fields into a defined structure. A table. A list. Whatever schema you give it.

The prompt pattern is straightforward. Tell AI:

**The source** -- *"Here's a paragraph from a project spec."*

**The fields you want** -- *"Extract every distinct requirement."*

**The output structure** -- *"Put each requirement in a table with columns for Requirement, Category, Deadline, and Priority."*

That's it. AI hands you back a table. The kind you'd otherwise have spent forty-five minutes building by hand.

A note on **categories**. When you ask AI to categorize requirements -- safety, environmental, qualifications, submittals, schedule -- it does pretty well, but it'll sometimes fudge the edges. A welding qualification could be categorized as "Qualifications" *or* "Quality." A turbidity monitoring requirement could land under "Environmental" *or* "Reporting." There's no single right answer. Just make sure the categories you end up with are useful for *your* downstream work. If your team tracks compliance by department, categorize by department.

There's also a quality habit worth building. Once AI extracts the requirements, **count them in the source paragraph yourself**. If you can find nine distinct requirements in the text and AI only extracted seven, you've got a gap. Ask AI: *"Did you miss anything? Re-read the source and confirm."* Sometimes that gets the missed items. Sometimes you have to point them out specifically.

This whole skill -- structured extraction -- is one of the highest-leverage things you can do with AI. Submittal trackers, requirement matrices, action item lists, RFI logs -- all of it benefits from the same pattern.

For the exercise, we've put a dense spec paragraph below. Ask AI to extract everything into a table with the columns I mentioned. Verify the count. Paste your table. That's a wrap on Module 6.

### B-roll / Visuals

- 0:00–0:15 — Peter on camera.
- 0:15–0:30 — A dense paragraph of fine-print spec text fills the screen. Caption: "Find all the requirements."
- 0:30–1:00 — Animated graphic: the paragraph being "scanned," requirements floating up and dropping into rows of a table.
- 1:00–1:25 — Animated table forming with columns: Requirement · Category · Deadline · Priority.
- 1:25–1:50 — Color-coded category tags being applied: Safety (red), Environmental (green), Qualifications (blue), Submittals (orange), Schedule (purple).
- 1:50–2:15 — Counting overlay: "Source paragraph: 9 requirements found. AI extracted: 7. Gap: 2." Highlight on the missing two.
- 2:15–2:30 — Peter wraps Module 6.

### On-screen text cues

- "New skill: Structured Data Extraction."
- "Prompt: Source · Fields · Structure."
- "Categorize for *your* downstream work."
- "Count the source. Audit the output."
