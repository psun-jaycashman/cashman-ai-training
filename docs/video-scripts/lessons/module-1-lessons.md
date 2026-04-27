# Module 1 — Lesson Scripts

**Module:** Your AI Toolkit
**Instructor:** Wes
**Audience:** Cashman employees, brand new to AI

Each lesson script is sized for a ~2–3 minute Descript voiceover. Professional
terms appear in **bold** the first time they're used and are explained inline.

---

## Lesson 1 — What is AI?

**Lesson runtime estimate:** ~2 min 30 sec
**Activity at end of lesson:** Quiz (3 questions)

### Title card

> **Lesson 1 — What is AI?**
> A pattern-matching tool that learned to talk.

### Script

So what *is* AI?

The honest answer is: it's not magic, and it's not a robot. The kind of AI we're going to use every day in this course is something called a **large language model**, or **LLM**. That's just a fancy way of saying it's a computer program that has read an unbelievable amount of text -- billions of pages of books, articles, manuals, websites -- and learned the patterns of how words go together.

When you type a question, it doesn't *think* the way you do. It predicts -- one word at a time -- the most likely next word that fits your question. That's it. That's the whole trick.

The reason it feels so smart is because the patterns it's learned are extraordinarily detailed. It can recognize the pattern of a polite email, the pattern of a project status report, the pattern of a USACE specification. So when you ask for one, it can produce something that looks and reads like the real thing.

But here's the part to remember -- and this is important. AI is **non-deterministic**. That's a five-dollar word that means *if you ask the exact same question twice, you might get two different answers*. It's not a calculator. It's a confident, fast, very well-read intern. Which means -- like an intern -- you have to **review its work**.

There's a specific term for when AI confidently makes something up. It's called a **hallucination**. The model invents a date, a number, a citation, a name -- and serves it up like a fact. It happens because the model is optimizing for *plausible*, not *true*. Catching hallucinations is one of the core skills of using AI well, and we'll practice it throughout the course.

Quick quiz coming up to lock this in. Three questions. Take your time. Then we'll get into the tools.

### B-roll / Visuals

- 0:00–0:15 — Wes on camera.
- 0:15–0:35 — Animated visual: words appearing one at a time, with little probability bars next to each, illustrating "predict the next word."
- 0:35–0:55 — Library / archive imagery: stacks of books, newspapers, web pages flashing past.
- 0:55–1:15 — Side-by-side: same prompt typed twice, two slightly different AI responses appearing. Caption: "Non-deterministic."
- 1:15–1:40 — Animated graphic: a confident-looking AI bubble produces a realistic-looking but FAKE citation. Big red "Hallucination" label.
- 1:40–2:00 — Wes back on camera, hand-off to quiz.

### On-screen text cues

- "AI = pattern recognition at scale."
- "New term: LLM (Large Language Model)."
- "New term: Hallucination — when AI invents facts."
- "Skill #1: Always review AI output."

---

## Lesson 2 — Your Tools: Cashman AI Portal, Copilot, and ChatGPT

**Lesson runtime estimate:** ~3 min
**Activity at end of lesson:** Exercise — log into the Portal and ask "What can you help me with?"

### Title card

> **Lesson 2 — Your AI Toolkit**
> Three tools. Three jobs. One simple rule for each.

### Script

You don't need ten AI tools. At Cashman, you really only need three. Let me walk you through each one and -- more importantly -- when to reach for it.

**Tool one: the Cashman AI Portal.** This is the one we built. It runs on Cashman's own servers, which means anything you put into it stays on the company network. That's a property called **data residency** -- a fancy way of saying "your data doesn't leave the building." So when the work involves *anything* sensitive -- a client contract, a bid pricing sheet, a project spec, an internal memo -- the Portal is the right answer. No exceptions.

The Portal does four big things: it has an AI chat for general questions, it does **document search** across the files we've loaded into it, it runs **AI agents** -- those are the ones that can take actions, not just talk -- and it hosts custom apps like the one you're using right now.

**Tool two: Microsoft Copilot.** Copilot is the AI that lives directly inside Outlook, Word, Excel, and PowerPoint. It already has access to the email you're reading, the document you're writing, the spreadsheet you're building. So you don't have to copy and paste anything -- you just click the Copilot icon and say what you need. Use it for your day-to-day Office work.

**Tool three: ChatGPT.** This is the public AI chatbot from OpenAI. It's the one most people have heard of, and it's genuinely great for general-purpose stuff -- learning a concept, brainstorming, drafting a personal note, looking up something that has nothing to do with Cashman. The catch is that **ChatGPT is a public, cloud-based tool**. Anything you paste into it can leave the company network. So we apply what we call the **Bulletin Board Test**: if you wouldn't pin it on a public bulletin board in the lobby, don't paste it into ChatGPT.

That's the whole toolkit. Portal for company data. Copilot for Office work. ChatGPT for general, non-sensitive stuff.

For your first hands-on task, you're going to log into the Cashman AI Portal and just say hi. Ask it: *"What can you help me with?"* Then paste the response into the exercise box. Let's go.

### B-roll / Visuals

- 0:00–0:15 — Wes on camera.
- 0:15–0:45 — Three big logo cards animating in, one at a time: **Cashman AI Portal**, **Microsoft Copilot**, **ChatGPT**, with their tagline underneath.
- 0:45–1:05 — Screen capture of the Portal: brief tour of chat, document search, agents.
- 1:05–1:25 — Screen capture of Copilot icons inside Outlook, Word, Excel, PowerPoint.
- 1:25–1:50 — Screen capture of ChatGPT interface, with a subtle "Public Cloud" watermark.
- 1:50–2:15 — Animated cork bulletin board with a "Bulletin Board Test" sign.
- 2:15–2:30 — Wes hands off to the exercise; cursor lands on the Portal login screen.

### On-screen text cues

- "Portal = Company data."
- "Copilot = Office apps."
- "ChatGPT = Public, general use only."
- "Rule: The Bulletin Board Test."

---

## Lesson 3 — The Ground Rules

**Lesson runtime estimate:** ~2 min 45 sec
**Activity at end of lesson:** Game — "The Bulletin Board Test" decision tree

### Title card

> **Lesson 3 — The Ground Rules**
> Four rules. Memorize them. Use them every day.

### Script

Before we let you loose with AI, we need to cover four rules. They're short, they're common sense, and they protect you, your projects, and the company.

**Rule one: the Bulletin Board Test.** I just introduced this in the last lesson. If you wouldn't pin the information on a public bulletin board in the lobby, don't paste it into a public AI tool. That covers client contracts, bid pricing, financials, personnel info -- anything proprietary. For that stuff, use the Cashman AI Portal. For public information or general learning, any tool is fine.

**Rule two: always verify AI output.** This goes back to **hallucinations** -- AI confidently inventing facts. AI will state a wrong number with the exact same tone as a right number. So before any AI-generated content leaves your hands -- whether it's an email, a report, a formula, or a calculation -- you read it. You check the dates, the numbers, and the references. Treat AI like a draft, not a final.

**Rule three: you are responsible.** This one's blunt, but it has to be said. AI is a tool, like a calculator or a power tool. The operator is responsible for the result. If you send a client a report with fabricated numbers because AI made them up, that's on you, not the AI. Your name is on the document. Own it.

**Rule four: AI augments. It doesn't replace.** AI is great at first drafts, lookups, summaries, and repetitive formatting. *You* are the one who handles final decisions, client relationships, quality judgment, and safety oversight. The combination is what's powerful. The combination is also what keeps work safe.

Coming up next is a short interactive game called the **Bulletin Board Test**. We'll throw four real Cashman scenarios at you and ask: cloud AI, or Cashman AI Portal? Pick the right one. There's instant feedback after each choice. Have fun.

### B-roll / Visuals

- 0:00–0:15 — Wes on camera, slightly more serious tone.
- 0:15–0:35 — Big animated rule cards: "1. Bulletin Board Test." Visual of a cork board with sticky notes.
- 0:35–0:55 — Rule 2 card. Highlighted text in a document being struck through and replaced -- "verify."
- 0:55–1:15 — Rule 3 card. Image of a hand signing a document. Caption: "Your name. Your responsibility."
- 1:15–1:40 — Rule 4 card. Split screen: "AI handles" (drafts, lookups, summaries) vs "You handle" (decisions, relationships, judgment, safety).
- 1:40–2:00 — Quick montage previewing the game: scenario card, choice buttons, green check / red X feedback.
- 2:00–2:15 — Wes hands off to the game.

### On-screen text cues

- "Four rules. That's it."
- "Verify. Verify. Verify."
- "If your name is on it, you own it."
- "AI augments. You decide."
