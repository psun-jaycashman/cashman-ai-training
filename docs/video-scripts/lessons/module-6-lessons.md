# Module 6 — Lesson Scripts

**Module:** Document Processing and Research
**Instructor:** Wes
**Audience:** Cashman employees finishing the course

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

For the exercise, go to the Portal. Ask it a question about company HR procedures. Paste the question and the answer. If documents aren't loaded yet for your role, ask AI to explain how RAG works and paste that.

### B-roll / Visuals

- 0:00–0:15 — Wes on camera.
- 0:15–0:35 — Frustrated person scrolling through endless PDFs and SharePoint folders.
- 0:35–1:00 — Animated comparison: "Keyword Search" misses the "PFD" doc when you searched "life jacket." "Semantic Search" finds it. Caption appears.
- 1:00–1:30 — Visual metaphor: each passage being converted into a colorful "fingerprint" floating in a 3D space. Caption: "Embeddings."
- 1:30–2:00 — Open-book exam metaphor: a student opening a textbook to find the answer. Big text overlay: "RAG = Open-Book Exam."
- 2:00–2:25 — Screen capture: a question answered in the Portal, with a citation link. Cursor clicks the citation, document opens to the right page.
- 2:25–2:45 — Locked-down server icon vs. cloud icon with a red X. Caption: "Company docs stay on company infrastructure."
- 2:45–3:00 — Wes hands off to the exercise.

### On-screen text cues

- "Old: keyword match. New: semantic search."
- "New term: Embedding — a meaning fingerprint."
- "New term: RAG — Retrieval-Augmented Generation."
- "Always verify the citation."

---

## Lesson 2 — Deep Research End-to-End

**Lesson runtime estimate:** ~3 min 30 sec
**Activity at end of lesson:** Exercise — run the full Deep Research → Notebook LM → AI Slides pipeline and submit prompts, an insight, the slide outline, and one verification step

### Title card

> **Lesson 2 — Deep Research End-to-End**
> Three tools. One pipeline. Under an hour.

### Script

Last lesson was about searching what's *inside* Cashman. This lesson is about researching what's *outside* -- vendors, regulations, market intelligence, lessons learned across an industry segment -- and turning it into a deck for your next meeting.

I'm going to walk you through the modern research pipeline. Three tools, in sequence. Each does one job well.

**Step one. Run a deep research query.** Two options here, and they work the same way: **ChatGPT Deep Research** -- inside ChatGPT Plus, Team, or Enterprise -- and **Claude Deep Research** -- on claude.ai with research mode turned on. You give it a real question, it goes off and browses the web for five to fifteen minutes, and it comes back with a long, cited report.

The trick is the prompt. State the *decision* the report will support. *"I need to recommend three autonomous-survey-vessel vendors for a 2026 pilot."* That's a thousand times better than *"tell me about autonomous survey vessels."* Tell it the audience -- *"the reader is a marine project executive."* Constrain the sources -- *"prioritize OEM spec sheets, peer-reviewed studies, recent USACE reports. Avoid blog posts."* Specify the output format. The more specific the prompt, the more useful the report.

**Step two. Drop the report into Google Notebook LM.** This is the synthesis step. You upload the deep research output as a source, plus any of your own PDFs that fit -- meeting notes, vendor data sheets, your own past evaluations. Then you click **Studio panel** and pick what you want: a **Briefing doc**, an **FAQ**, a **Study guide**, or -- and this is the one that surprises everyone -- an **Audio Overview**. Notebook LM literally generates a ten-minute podcast of two hosts discussing your source material. Listen to it on your drive home. It surfaces things you missed.

**Step three. Have AI draft the slide deck.** Take the briefing or the original report, paste it into Claude or ChatGPT, and prompt: *"Turn this into a ten-slide deck for a Cashman project executive. Each slide -- a headline of eight words or less, three supporting bullets, a speaker-note paragraph."* You'll get markdown back. Copy it into PowerPoint. Or use Copilot inside PowerPoint directly -- attach the briefing and tell it *"build a ten-slide deck."*

That's the pipeline. Deep Research finds and cites. Notebook LM synthesizes and condenses. The slide AI packages it for your audience.

Two important habits.

**The bulletin-board rule still applies.** Anything you put into a public Deep Research prompt goes to the cloud. Don't include client names, internal pricing, or sensitive scope. For internal-only research, switch to **Claude Cowork** or the Cashman AI Portal -- those keep the data on company infrastructure.

**Verify before you ship.** Before that deck leaves your desk, spot-check at least the biggest two or three numbers. Click the citations. Deep Research occasionally fabricates a quote that *sounds* real -- and the way you catch it is by reading the original source.

For the exercise, pick a real research question relevant to your work, run the full pipeline, and submit your prompt, the Notebook LM artifact you generated, your slide outline, and one thing you'd verify. That's the modern research workflow in your hands.

### B-roll / Visuals

- 0:00–0:15 — Wes on camera.
- 0:15–0:45 — Three-step pipeline graphic: Deep Research → Notebook LM → Slide AI. Each tool's logo animates in. Captions name the step.
- 0:45–1:10 — Screen capture: ChatGPT Deep Research running. Progress bar. Final report scrolling past. Citation links highlighted.
- 1:10–1:50 — Notebook LM Studio panel: the "Briefing," "FAQ," "Study Guide," "Audio Overview" buttons highlight in turn. The Audio Overview button gets the longest hold; an audio waveform visualization plays.
- 1:50–2:25 — Claude / ChatGPT generating slide markdown; markdown appearing on the left, finished slides materializing on the right.
- 2:25–2:50 — Bulletin-board reminder: a public chat window with a thought-bubble of internal pricing being struck through. Caption: "Public Deep Research = public data only."
- 2:50–3:15 — Side-by-side: AI's cited quote and the original source. Cursor clicks the citation; the source opens. Caption: "Verify before you ship."
- 3:15–3:30 — Wes hands off to the exercise.

### On-screen text cues

- "Pipeline: Deep Research → Notebook LM → AI Slides."
- "Prompt = Decision + Audience + Sources + Format."
- "New feature: Notebook LM Audio Overview."
- "Public Deep Research = public data only."
- "Verify the citations before you ship."

---

## Lesson 3 — Building Your AI Workflow

**Lesson runtime estimate:** ~2 min 30 sec
**Activity at end of lesson:** Survey — reflect on what you've learned and how you'll use AI

### Title card

> **Lesson 3 — Building Your AI Workflow**
> Wrap up. Lock it in. Take the badge.

### Script

This is the last lesson of the course. Let's pull it together.

You now have a working AI **toolkit**, a set of habits, and a real understanding of the **risks**. The goal of this lesson is to make sure those risks stay top of mind, because that's the thing that separates someone who *uses* AI from someone who *uses AI safely* in a regulated, contract-driven business like ours.

Let me give you the consolidated security recap. Every module surfaced a piece of this. Here it is in one place.

**Prompt injection** -- hidden instructions buried in input data, like an email or a document, that AI follows as if you'd typed them. Defense: review AI output, especially when the input came from outside.

**Hallucinations** -- AI confidently inventing plausible-sounding facts: a citation that doesn't exist, a number that sounds right, a precedent that was never decided. Defense: source-grounding and verification.

**Wrong formulas** -- AI calculations that look correct but aren't. A SUMIFS that targets the wrong column. A percentage that's averaged when it should be weighted. Defense: test with known values before you stake real money on the answer.

**Deepfakes** -- fake images, video, or audio that can support a false claim. Defense: verify through a separate channel for any consequential content. If somebody sends you a "site photo" that supports a financial claim, pick up the phone.

**Data leakage** -- company data ending up in a public AI service through someone's prompt. Defense: company data goes to the Cashman AI Portal, period. The bulletin-board rule.

That's the cheat sheet. Print it. Tape it to your monitor. That's the muscle memory we want you walking out of this course with.

The final piece is a short survey. It asks how confident you are with each tool, which one you think will have the biggest impact on your daily work, and one specific task where you'll start using AI this week. Be honest -- this is how we shape the next round of training.

After you finish the survey, there's a final assessment. Pass it, and you've earned your **Think (AI)mpossible** badge and the Cashman AI Training certificate.

You did the work. You earned this. Welcome to the new toolkit.

### B-roll / Visuals

- 0:00–0:15 — Wes on camera, wrap-up energy.
- 0:15–0:55 — Five security risk cards animating in one at a time: Prompt Injection · Hallucinations · Wrong Formulas · Deepfakes · Data Leakage. Each pairs with a one-line defense.
- 0:55–1:20 — A printed "AI Security Cheat Sheet" being taped to a monitor. Caption: "Print it. Tape it. Live it."
- 1:20–1:50 — Highlight reel of clips from earlier modules — emails fixed, spreadsheets built, Notebook LM podcasts running, certificates earned. Reinforces "look how far you've come."
- 1:50–2:15 — Animated **Think (AI)mpossible** badge appearing with a chime, then the Cashman AI Training certificate.
- 2:15–2:30 — Wes signs off with a thank-you and a "you've got this" beat. Hand-off to the survey.

### On-screen text cues

- "Five risks. Five defenses."
- "Print it. Tape it. Live it."
- "Survey → Final Assessment → Certificate."
- "Earn the Think (AI)mpossible badge."
