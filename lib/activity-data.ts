import type { Exercise, Game, Survey } from './types';

// ==========================================================================
// EXERCISES
// ==========================================================================

export const EXERCISES: Exercise[] = [
  // ---- Module 1: Your AI Toolkit ----
  {
    id: 'ex-mod1-les2',
    moduleId: 'mod-1',
    lessonId: 'mod-1-les-2',
    title: 'Your First AI Conversation',
    variant: 'paste-back',
    instructions:
      'Log into the Cashman AI Portal. Ask it: "What can you help me with?" Copy the response and paste it below.',
    scenario:
      'This is your first hands-on task. The goal is simply to verify you can access the Cashman AI Portal and have a basic conversation with it.',
    hints: [
      'Just paste the AI\'s actual response — don\'t edit it or summarize it.',
      'If the response is short, try asking a follow-up like "What kinds of work tasks could you help me with?"',
      'Notice how the AI describes itself — capabilities, limitations, kinds of help. That gives you a feel for what to ask it later.',
      'No "right answer" here. The exercise just confirms you can access and use the Portal.',
    ],
    goodExamples: [
      {
        title: 'Example — what a typical first response looks like',
        body: `I can help with a wide range of work tasks, including:

• **Writing & editing** — drafting emails, reports, memos, and meeting notes; rewriting rough drafts to be clearer and more professional.
• **Summarization** — condensing long email threads, documents, or meeting transcripts into key points and action items.
• **Research & explanation** — answering questions, explaining concepts, comparing options, and walking through technical material.
• **Spreadsheet help** — generating Excel formulas from plain-English descriptions, suggesting analysis approaches, cleaning up messy data.
• **Document analysis** — reviewing specs, contracts, and reports to extract requirements, deadlines, and risks.
• **Brainstorming** — generating ideas, exploring options, drafting outlines.

Just describe what you're trying to do and I'll help. If you have specific company documents you'd like to work with, you can upload them or use the document search feature to ground my responses in actual Cashman material.`,
        note: 'A solid first response covers writing, summarization, research, and analysis — the four most common day-to-day uses. It also distinguishes general help from company-specific help (where document search adds value).',
      },
    ],
    evaluationRubric: {
      criteria: [
        'The response appears to be a genuine AI-generated reply (not fabricated by the user)',
        'The response describes AI capabilities such as answering questions, drafting text, searching documents, or similar',
        'The response is at least 2-3 sentences long',
      ],
      passingScore: 2,
      systemPrompt:
        'You are evaluating whether a trainee successfully logged into an AI portal and asked it what it can do. The trainee should paste the AI\'s response. Evaluate whether the pasted text looks like a genuine AI response describing capabilities. Be lenient -- any reasonable AI response counts.',
    },
  },

  // ---- Module 2: AI and Email ----
  {
    id: 'ex-mod2-les1',
    moduleId: 'mod-2',
    lessonId: 'mod-2-les-1',
    title: 'Fix the Bad Email',
    variant: 'paste-back',
    instructions:
      'Copy the bad email from the lesson above. Use Copilot in Outlook or the Cashman AI Portal to rewrite it professionally. Paste the improved version below.',
    scenario:
      'The original email from superintendent Jim to client Mike has no subject line, poor grammar, mixed topics, no clear action items, and an unprofessional tone. A good rewrite organizes the issues, uses professional language, and clearly states what actions are needed.',
    hints: [
      'Tell AI exactly who the recipient is (the client) and what tone you want (professional, direct, action-oriented).',
      'Use the **Audience · Structure · Outcome** framework: who reads it, how should it be organized, what action do you want from them?',
      'Make sure the rewrite has a clear, specific subject line — not "stuff" or "update."',
      'Group the original\'s mixed topics into separate sections. Each issue gets its own paragraph or bullet.',
      'Spell out asks. The original buried the change-order approval and the Friday site visit — pull those out so the client can\'t miss them.',
    ],
    goodExamples: [
      {
        title: 'Example 1 — Bulleted by issue',
        body: `Subject: Project Update — Schedule Risks and Pending Approvals

Hi Mike,

Wanted to give you a quick rundown on a few items affecting the schedule. We need a couple of decisions from you to keep things on track.

**Schedule risks this week**
- Crane breakdown yesterday cost us ~6 hours of production. Repair completed; back in service today.
- Concrete subcontractor was a no-show on Tuesday; I'm following up to confirm coverage going forward.
- Forecast shows poor weather most of next week, which may cost additional days.

**Pending approval — Change Order (extra piles)**
The CO I sent two weeks ago is still open. We need approval ASAP so we can release the steel order; otherwise we're looking at a meaningful delay.

**Request — site visit Friday**
The inspector has requested a site walk on Friday. Please confirm whether you can attend.

Thanks,
Jim`,
        note: 'Clear subject line, issues separated, decisions and asks called out at the top of each section.',
      },
      {
        title: 'Example 2 — Action items first',
        body: `Subject: Two Decisions Needed: Pile CO Approval & Friday Site Visit

Hi Mike,

Two items I need from you to keep the project moving:

1. **Approve the pending Change Order for additional piles** (sent ~2 weeks ago). Steel must be ordered this week to avoid a schedule slip.
2. **Confirm availability for an inspector site visit on Friday.**

For situational awareness, here's what's affecting the schedule:
- Yesterday's crane breakdown cost ~6 hours; back in service.
- Concrete subcontractor missed Tuesday; chasing the cause.
- Next week's forecast is unfavorable and may cost additional production days.

I'll send a recovery plan once we have your CO decision.

Thanks,
Jim`,
        note: 'Leads with the decisions the reader needs to make. Useful when the recipient is busy and you want a fast response.',
      },
      {
        title: 'Example 3 — Short and direct',
        body: `Subject: Status & Outstanding Items — [Project Name]

Mike,

Quick update:

- **Schedule:** Lost ~6 hrs to a crane breakdown (resolved). Concrete sub no-show on Tuesday. Bad weather forecast next week — possible additional impact.
- **Open CO:** The change order for extra piles is still awaiting your approval. We need this to release the steel order and protect the schedule.
- **Friday site visit:** Inspector is requesting attendance. Please confirm.

Let me know if you'd like to set up a 15-minute call to walk through any of this.

Thanks,
Jim`,
        note: 'Compressed format — every line earns its place. Best for routine status updates with experienced clients.',
      },
    ],
    evaluationRubric: {
      criteria: [
        'Has a clear, specific subject line (not "stuff" or similarly vague)',
        'Uses professional tone and proper grammar',
        'Organizes issues into separate sections or bullet points (crane breakdown, concrete sub no-show, weather forecast, change order, site visit)',
        'Includes specific action items with deadlines where applicable',
        'The rewrite is substantially different from and better than the original',
      ],
      passingScore: 3,
      systemPrompt:
        'You are evaluating a rewritten email. The original was poorly written by a construction superintendent -- vague subject, bad grammar, mixed topics, no structure. The trainee should have used AI to improve it. Evaluate the rewrite against the criteria. A good rewrite has a clear subject, professional tone, organized sections, and clear action items.',
    },
  },
  {
    id: 'ex-mod2-les2',
    moduleId: 'mod-2',
    lessonId: 'mod-2-les-2',
    title: 'Summarize the Thread',
    variant: 'paste-back',
    instructions:
      'Copy the email thread from the lesson above. Use AI to extract: (a) the current status, (b) key decisions made, (c) action items with owners and deadlines. Paste the summary below.',
    scenario:
      'The email thread is about a geotechnical issue on a dock project that requires changing from AZ-26 to AZ-24 sheet piles with an added waler. Key decisions: switch to AZ-24 with waler (+$15K net change). Action items: Tom to place PO by Thursday, Dave to prepare CO package by Thursday, Sarah to submit CO to client.',
    hints: [
      'Use the **Status · Decisions · Actions (SDA)** pattern. Three sections, every time.',
      'Each action item must include an owner AND a deadline. "Tom to place the PO" is half the answer — "by end of day Thursday" finishes it.',
      'Capture the specifics: AZ-24 vs AZ-26, ~$15K net change, the October 15 milestone. Vague summaries lose the value.',
      'Include the open risk — making the milestone depends on the PO going out this week. That\'s the kind of thing leadership needs to see.',
      'Pick a format that fits your audience: a tidy table for ops folks, a paragraph for leadership, BLUF (bottom-line-up-front) for execs.',
    ],
    goodExamples: [
      {
        title: 'Example 1 — Status / Decisions / Actions',
        body: `**Status**
Geotech revealed soft clay at the south bulkhead (stations 12+00–15+00), requiring longer sheet piles than originally designed. Original AZ-26 has a 14-week lead time, which would miss the October 15 milestone.

**Key Decisions**
- Switch from AZ-26 to AZ-24 sheet piles (8-week lead time) with an added waler at elevation +2.0.
- Net cost impact: approximately +$15,000 (waler cost partially offset by cheaper piles).
- Client (Mike Anderson) approved the approach pending formal CO submission.

**Action Items**
| Owner | Action | Due |
|---|---|---|
| Tom (Procurement) | Place PO for AZ-24 sheet piles | End of day Thursday |
| Dave (Structural) | Finalize CO package with waler detail | Thursday |
| Sarah (PM) | Submit CO to client | Thursday |

**Risk:** October 15 milestone is achievable only if the PO goes out this week.`,
        note: 'Clean three-section format with a table for action items. Easiest to scan in a hurry.',
      },
      {
        title: 'Example 2 — Narrative summary',
        body: `Geotech results showed unexpectedly soft clay at the south bulkhead, requiring deeper sheet piles than the original AZ-26 design. Because AZ-26 has a 14-week lead time that would miss the October 15 milestone, the team evaluated AZ-24 sections (8-week lead) paired with an added waler at elevation +2.0. Dave confirmed AZ-24 is structurally adequate with the waler, and Tom verified availability and pricing.

The team agreed to switch to AZ-24 with the waler at a net cost increase of ~$15,000. Sarah notified Mike (client), who approved the approach pending the formal change order. The October 15 milestone can still be met if the PO is placed this week.

Action items: Tom places the AZ-24 PO by end of day Thursday; Dave finalizes the CO package by Thursday; Sarah submits the CO to the client immediately after.`,
        note: 'Paragraph form — better for forwarding to leadership who want context, not just a checklist.',
      },
      {
        title: 'Example 3 — Bottom-line-up-front',
        body: `**Bottom line:** South bulkhead design is changing from AZ-26 to AZ-24 sheet piles + new waler. Net cost: +~$15K. Schedule (Oct 15) is still achievable if the PO is placed this week. Client has verbally approved.

**Why:** Geotech showed soft clay; AZ-26 met the design but its 14-week lead time would have blown the milestone. AZ-24 (8 weeks) + a waler at el. +2.0 works structurally and beats the schedule risk.

**Open actions (all by Thursday):**
- Tom — place PO for AZ-24
- Dave — finalize CO package with waler detail
- Sarah — submit CO to client`,
        note: 'BLUF style — answer first, then context. Best when leadership scans the first line and decides whether to read more.',
      },
    ],
    evaluationRubric: {
      criteria: [
        'Accurately captures the current status (switching from AZ-26 to AZ-24 sheet piles due to soft clay)',
        'Identifies the key decision: AZ-24 with waler, ~$15K net change, approved by client',
        'Lists action items with correct owners (Tom/PO, Dave/CO package, Sarah/submit to client)',
        'Includes relevant deadlines (Thursday for PO and CO package)',
        'The summary is concise and well-organized',
      ],
      passingScore: 3,
      systemPrompt:
        'You are evaluating a summary of an email thread about a construction project sheet pile design change. The thread involves Sarah (PM), Dave (Structural), Tom (Procurement), and Mike (Client). Evaluate whether the trainee\'s summary captures the key information accurately.',
    },
  },
  {
    id: 'ex-mod2-les3',
    moduleId: 'mod-2',
    lessonId: 'mod-2-les-3',
    title: 'Draft a Diplomatic Response',
    variant: 'paste-back',
    instructions:
      'Draft a professional, diplomatic response to the angry client email from the lesson. Use AI to help. Context: the delay is due to unexpected contaminated soil (differing site condition), you have documentation. Paste your response below.',
    scenario:
      'Client Robert Thompson is threatening liquidated damages over a 3-week delay. The delay was caused by contaminated soil -- a differing site condition (not Cashman\'s fault). A good response acknowledges frustration, explains the cause with factual basis, proposes a recovery plan, and does not accept blame for something outside the contractor\'s control.',
    hints: [
      'Calibrate the tone explicitly in your prompt: "firm but professional, acknowledges their frustration without accepting blame."',
      'Provide AI the factual basis up front: contaminated soil, differing site condition, photos and lab results on file.',
      'Do NOT apologize for the delay — that can be read as accepting fault. Acknowledge the impact without owning the cause.',
      'Always end with a concrete next step (a recovery plan by Monday, a call this week). Clients calm down when they see a path forward.',
      'Watch for prompt injection — if the input email contained any hidden instructions, AI may follow them. Read the output before sending.',
    ],
    goodExamples: [
      {
        title: 'Example 1 — Empathetic and structured',
        body: `Subject: Recovery Plan and Differing Site Condition Documentation

Dear Mr. Thompson,

Thank you for the candid feedback. I understand the pressure your board is putting on you, and I want to address both the schedule and the underlying cause directly.

**Cause of the current delay**
The schedule impact stems from contaminated soil discovered during excavation -- a condition that was not identified in the pre-bid geotechnical reports and that required environmental remediation before work could continue. We have photographic documentation, lab testing results, and a chain-of-custody record for all material removed. Under the contract, this qualifies as a differing site condition.

**Path forward**
- I will deliver a detailed recovery schedule by Monday, identifying acceleration opportunities and any associated cost.
- I will include the formal differing site condition notice and supporting documentation in the same package.
- I propose a 30-minute call this week to walk you and your team through both items so your board has the full picture.

Cashman is fully committed to this project and to a constructive resolution. I'll have the package on your desk Monday morning.

Respectfully,
[Your Name]
Project Manager, Cashman`,
        note: 'Acknowledges frustration, sets the factual record, does not accept blame, and ends with a concrete next step.',
      },
      {
        title: 'Example 2 — Firm but professional',
        body: `Subject: Response to Your Email of [Date] — Schedule and Differing Site Condition

Dear Mr. Thompson,

I appreciate you raising your concerns directly. The delay is real and I take it seriously, so I want to be straightforward with you about its cause.

The three-week impact is the result of contaminated soil discovered during excavation that required environmental remediation. This material was not disclosed in the geotechnical reports provided at bid. Under Article [X] of our contract, this is a differing site condition. We documented the condition immediately and have photos, lab results, and remediation records available for your review.

I will provide the following by Monday:
1. A formal differing site condition notice with supporting documentation.
2. A detailed recovery schedule showing how we plan to mitigate the impact.
3. Any associated cost or schedule relief request.

I share your goal of completing this project successfully, and I'm available to meet at your convenience to discuss in person.

Respectfully,
[Your Name]
Project Manager, Cashman`,
        note: 'Slightly firmer tone — explicitly cites the contract article. Useful when the client has implied legal action.',
      },
      {
        title: 'Example 3 — Brief and disarming',
        body: `Subject: Following Up on Your Email — Recovery Plan by Monday

Mr. Thompson,

I hear you, and I want to give you an answer your board will accept.

The three-week impact is tied to contaminated soil that wasn't in the pre-bid geotech -- a differing site condition that required remediation before we could proceed. We have full documentation: photos, lab results, and the remediation log.

You will have on your desk by Monday: a recovery schedule, the formal differing site condition notice, and the supporting documentation. I'd also welcome a short call before then if it would help you brief your board.

Cashman wants this project to finish well. So do I.

Respectfully,
[Your Name]
Project Manager, Cashman`,
        note: 'Short, human tone. Best when you have a strong relationship with the client and want to defuse without being defensive.',
      },
    ],
    evaluationRubric: {
      criteria: [
        'Acknowledges the client\'s frustration without being dismissive',
        'Explains the cause (contaminated soil / differing site condition) factually',
        'Does not accept blame for the delay -- correctly positions it as a differing site condition',
        'Proposes a path forward (recovery schedule, meeting, documentation)',
        'Maintains a professional, respectful tone throughout',
        'References supporting documentation (photos, testing results, etc.)',
      ],
      passingScore: 4,
      systemPrompt:
        'You are evaluating a professional email response to an angry construction client. The client is upset about a 3-week delay. The delay was caused by unexpected contaminated soil (a differing site condition, not the contractor\'s fault). Evaluate whether the response is diplomatic, factual, and proposes a constructive path forward.',
    },
  },

  // ---- Module 3: Reports and Documents ----
  {
    id: 'ex-mod3-les1',
    moduleId: 'mod-3',
    lessonId: 'mod-3-les-1',
    title: 'Write a Monthly Progress Report',
    variant: 'paste-back',
    instructions:
      'Use the project notes from the lesson to produce a formal monthly progress report. Use the Cashman AI Portal or Word Copilot. Review and edit the output before pasting it below.',
    scenario:
      'Project: Galveston Wharf Rehabilitation, $4.2M USACE contract, March 2026. 62% complete (4% ahead). $2.6M spent (on budget). Zero safety incidents. Key work: 24 H-piles driven, underwater demolition complete, 340 CY riprap placed. Issue: precast cap delivery delayed 2 weeks.',
    hints: [
      'Lead with an executive summary — 3–4 sentences that give the contracting officer the bottom line at a glance.',
      'Use the standard sections every USACE report expects: Schedule, Budget, Safety, Work Completed, Upcoming, Issues.',
      'Tell AI to "keep specific numbers from the notes." Without that, AI rounds, smooths, or quietly drops the precise figures.',
      'Tone matters with federal clients: formal, factual, no marketing language.',
      'After AI generates the report, verify the numbers against your source notes. Anything new in the report is a hallucination candidate.',
    ],
    goodExamples: [
      {
        title: 'Example 1 — Standard USACE format',
        body: `**MONTHLY PROGRESS REPORT — MARCH 2026**
Galveston Wharf Rehabilitation · Contract $4.2M · USACE

**Executive Summary**
The project remains ahead of schedule and on budget through the end of March 2026. Overall progress is 62%, approximately 4% ahead of the planned curve. Cumulative cost is $2.6M of the $4.2M contract. Zero safety incidents were recorded this month, and the project has now logged 45,000 man-hours without a lost-time injury. One supplier delay is being monitored but does not currently impact the master schedule.

**Schedule**
- Planned: 58% complete · Actual: 62% complete
- Variance: +4% (ahead of plan)

**Budget**
- Spent to date: $2.6M of $4.2M (62%)
- Tracking on budget against earned value.

**Safety**
- Zero incidents this period.
- 45,000 man-hours since last lost-time injury.

**Work Completed This Period**
- Drove 24 of 120 steel H-piles.
- Completed underwater demolition of the existing timber fender system.
- Placed 340 CY of riprap.

**Upcoming Work — April 2026**
- Complete remaining pile driving at stations 8+00 to 12+00.
- Begin pile cap forming and reinforcing steel placement.
- Continue environmental turbidity monitoring at established stations.

**Open Issues / Risks**
- Precast concrete cap delivery is currently delayed approximately 2 weeks at the manufacturer. The team is working with the supplier on expediting. **No master schedule impact at present**, but the team is monitoring weekly.`,
        note: 'Hits every section USACE expects, leads with the executive summary, preserves all the specific numbers from the notes, and flags the supplier risk explicitly without overstating it.',
      },
      {
        title: 'Example 2 — Compact, exec-friendly version',
        body: `**Galveston Wharf Rehabilitation — March 2026 Progress**

**Bottom line:** Project is 62% complete (4% ahead of plan), $2.6M of $4.2M spent (on budget), and zero safety incidents this period. Watching one supplier delay; no schedule impact yet.

| Metric | Status |
|---|---|
| Schedule | 62% actual vs 58% planned · +4% ahead |
| Budget | $2.6M / $4.2M · on plan |
| Safety | 0 incidents · 45,000 hrs since last LTI |

**This month**
- 24 of 120 H-piles driven
- Underwater timber fender demolition complete
- 340 CY of riprap placed

**Next month**
- Finish pile driving (stations 8+00 → 12+00)
- Begin pile cap forming + rebar
- Environmental monitoring continues

**Risk to watch**
Precast cap delivery delayed ~2 weeks by manufacturer. Mitigation in progress with supplier; no schedule slip yet.`,
        note: 'Same content, BLUF format. Better for an internal-leadership audience or a short cover note that summarizes the formal report. The table makes the numbers scannable in five seconds.',
      },
    ],
    evaluationRubric: {
      criteria: [
        'Has an executive summary (3-4 sentences covering overall status)',
        'Includes organized sections (Schedule, Budget, Safety, Work Completed, Upcoming Work, Issues)',
        'Contains specific numbers from the notes (62%, $2.6M, 24 piles, 340 CY, etc.)',
        'Uses professional tone appropriate for a USACE contracting officer',
        'Mentions the precast cap delivery delay and its potential impact',
      ],
      passingScore: 3,
      systemPrompt:
        'You are evaluating a monthly progress report for a $4.2M Galveston Wharf Rehabilitation project. The trainee was given raw notes and asked to produce a formal report. Evaluate structure, completeness, professionalism, and accuracy against the source notes.',
    },
  },
  {
    id: 'ex-mod3-les2',
    moduleId: 'mod-3',
    lessonId: 'mod-3-les-2',
    title: 'Summarize the Quincy Daily Reports',
    variant: 'paste-back',
    instructions:
      'Download the combined Quincy daily reports PDF from the lesson above. Use AI to produce (1) a 2–3 paragraph executive summary covering the entire 9-week period and (2) a structured insights list grouped by theme (productivity, weather, equipment, safety, etc.). Verify a few specific facts against the source PDF. Paste your final summary + insights below.',
    scenario:
      'The PDF contains daily field reports from a Cashman Quincy job covering Dec 30, 2006 through Mar 5, 2007 (~9 weeks of winter marine work). The original Word files have already been extracted and combined into a single PDF for AI ingestion. The trainee should produce an executive summary plus a thematic insights list, then verify specific facts (dates, numbers, names) against the source to catch any hallucinations.',
    hints: [
      'Tell AI who is reading the summary (operations director? client? internal team?). Same source, different audience, different deliverable.',
      'Ask explicitly for **patterns across many days**, not a transcription. The whole point is the season\'s story, not a log dump.',
      'Group insights by theme: productivity, weather, equipment, safety, manpower, milestones. A scannable structure beats a wall of text.',
      'For any specific claim AI makes (a date, a number, a name) — pick three and verify them in the source PDF. If you can\'t find them, AI hallucinated.',
      'If the file is large, ask AI: "Is there anything in the source you didn\'t include in this summary?" That sometimes surfaces missed events.',
    ],
    goodExamples: [
      {
        title: 'Example 1 — Executive summary + thematic insights',
        body: `**Executive Summary**

Between December 30, 2006 and March 5, 2007, the Quincy crew completed approximately nine weeks of winter marine work. Despite frequent freezing temperatures, snow, and strong winds, the team maintained steady progress on the primary scope, with the lion's share of lost-time days attributable to weather rather than equipment or manpower. Production improved noticeably toward the end of February as conditions moderated.

The most significant challenges over the period were weather-driven cold snaps and a small number of equipment issues that briefly halted operations. There were no recordable safety incidents over the nine weeks, and the crew finished the period in line with the planned scope for the season.

**Insights — grouped by theme**

- **Productivity:** Strongest production weeks fell in the back half of February once temperatures rose. The slowest weeks coincided with the early-January cold snap and the late-January snow events.
- **Weather impact:** Multiple half- and full-day delays driven by sub-freezing temperatures, ice in the harbor, and high winds. Weather, not equipment, was the dominant schedule risk.
- **Equipment:** A handful of brief downtime events (crane and barge-related). All were resolved same-day or next-day. No prolonged equipment issues.
- **Safety:** Zero recordable incidents. Daily safety briefings logged consistently.
- **Crew & manpower:** Crew composition was stable across the period, with predictable variance for the holiday week (Dec 30–Jan 2).
- **Notable milestones:** Steady completion of the primary work items week over week. End-of-period status indicates the season's planned scope was on track.

> *Note: each claim above can be traced to specific daily-report entries in the source PDF — verify the exact dates and numbers before incorporating into any external deliverable.*`,
        note: 'Best-of-breed format: short executive summary, then themed insights, with a clear note reminding the reader to verify specifics against the source.',
      },
      {
        title: 'Example 2 — Audience-tuned for an operations director',
        body: `**TL;DR for the Ops Director:** The Quincy crew put in nine solid weeks of winter work (Dec 30 – Mar 5). Weather drove the schedule, not us. Zero safety incidents. A handful of equipment hiccups, all short. Productivity climbed as conditions improved through late February.

**What went well**
- Consistent crew, no manpower shortfalls.
- Zero recordable safety events.
- Equipment issues resolved quickly when they occurred.
- Daily reporting discipline was strong — every day accounted for.

**What hurt the schedule**
- Cold snaps and ice in the harbor caused the largest cluster of partial- or no-work days, concentrated in early and mid-January.
- A small number of high-wind days, principally late January.

**Recommendations going forward**
- Build a winter-weather contingency into the next Quincy-area schedule.
- Pre-position cold-weather gear and de-icing supplies before Dec 15 next year.
- Continue current safety briefing cadence — it appears to be working.

> *All conclusions cite specific daily reports in the source PDF. Spot-check before quoting numbers externally.*`,
        note: 'Audience-tuned. The same source produces a different deliverable when you tell AI who is reading it. Use this style when the consumer is an internal decision-maker.',
      },
      {
        title: 'Example 3 — Brief insights pull (no narrative)',
        body: `**Period:** Dec 30, 2006 – Mar 5, 2007 (~9 weeks)
**Source:** combined daily reports PDF

**Findings**

| Theme | Finding |
|---|---|
| Weather | Dominant schedule driver. Cold snaps in early Jan; wind events in late Jan. |
| Productivity | Strongest output in late Feb as temperatures moderated. |
| Equipment | Short, isolated downtime events; all resolved same-day or next-day. |
| Safety | Zero recordable incidents. Briefings logged daily. |
| Crew | Stable composition; expected variance during holiday week. |
| Reporting | Strong daily reporting discipline across the entire period. |

**Risks for the next winter season**
- Repeat exposure to harbor ice if scope extends beyond mid-December.
- High-wind interruptions during Nor'easter season.

**Verify before publishing:** specific dates, equipment IDs, and crew counts cited above.`,
        note: 'Compressed table format. Best when you need a fast input into a longer report or a status email — pull the structure straight in, then build prose around it.',
      },
    ],
    evaluationRubric: {
      criteria: [
        'Includes both an executive summary and a structured insights list',
        'The summary covers the full ~9-week period (not a single day or week)',
        'Insights are grouped by theme (productivity, weather, equipment, safety, etc.) — not just a transcript of events',
        'References specific dates, numbers, or named events from the source rather than vague language',
        'Acknowledges the need to verify specific facts against the source PDF (or shows evidence of having done so)',
        'Does not invent details that weren\'t in the source — no fabricated names, numbers, or events',
      ],
      passingScore: 4,
      systemPrompt:
        'You are evaluating a trainee\'s AI-assisted summary of nine weeks of historical Cashman daily reports (the Quincy job, Dec 30, 2006 – Mar 5, 2007). The trainee was asked to produce (1) an executive summary and (2) a structured, thematic insights list. Evaluate whether the output is genuinely synthesized across many days (not a transcription of one), whether it groups insights by theme, and whether it cites specifics. Be especially attentive to whether the trainee shows awareness that AI may hallucinate specifics — credit them for either verifying claims or explicitly noting that verification is needed. Do NOT penalize them for not having read every page of the PDF themselves; the point of the exercise is using AI to do the heavy lifting.',
    },
  },
  {
    id: 'ex-mod3-les3',
    moduleId: 'mod-3',
    lessonId: 'mod-3-les-3',
    title: 'Create a Reusable Template',
    variant: 'paste-back',
    instructions:
      'Think of a document you write repeatedly at work. Ask AI to create a reusable template with placeholder fields. Paste the template below.',
    scenario:
      'The trainee should identify a repeated document type (daily report, meeting agenda, safety briefing, submittal review, etc.) and have AI generate a template with clear placeholder brackets for project-specific details.',
    hints: [
      'Pick a document you actually do every week or every project. The more repetitive, the bigger the time savings.',
      'Use square brackets for placeholders, e.g. `[Project Name]`, `[Date]`, `[Crew Count]`. They\'re visually obvious and easy to find/replace later.',
      'Tell AI who the audience is for the document (federal client, internal team, subcontractor) — it shapes what sections matter.',
      'Save the prompt you used, not just the template. Good prompts are reusable too.',
    ],
    goodExamples: [
      {
        title: 'Example 1 — Weekly subcontractor coordination meeting agenda',
        body: `**WEEKLY SUBCONTRACTOR COORDINATION MEETING**

**Project:** [Project Name]
**Meeting Date:** [Date]  ·  **Time:** [Start Time] – [End Time]
**Location:** [Location / Teams Link]
**Facilitator:** [Project Manager Name]

---

**1. Safety Topic of the Week**
- Topic: [Safety Topic]
- Lead: [Person]

**2. Schedule Update by Trade**
- [Trade] — status, look-ahead, blockers
- [Trade] — status, look-ahead, blockers
- [Trade] — status, look-ahead, blockers

**3. Material Deliveries Expected This Week**
| Item | Supplier | Expected Date | Status |
|---|---|---|---|
| [Material] | [Supplier] | [Date] | [Status] |

**4. Equipment Coordination**
- [Equipment] — [Trade] — [Dates]

**5. Open RFIs and Submittals**
| # | Description | Owner | Due | Status |
|---|---|---|---|---|
| [RFI #] | [Description] | [Owner] | [Date] | [Status] |

**6. Action Items from Last Week**
- [ ] [Action] — [Owner] — [Due]
- [ ] [Action] — [Owner] — [Due]

**7. New Action Items**
- [ ] [Action] — [Owner] — [Due]

**8. Open Discussion**
- [Topic]

**Next Meeting:** [Date / Time]`,
        note: 'Comprehensive but not bloated. Every section has a clear purpose, every placeholder is in brackets, and tables are used where structure matters (deliveries, RFIs). A team can paste this in week-over-week and just fill in the brackets.',
      },
      {
        title: 'Example 2 — Daily report template (field crew)',
        body: `**DAILY FIELD REPORT — [Project Name]**

**Date:** [MM/DD/YYYY]  ·  **Day:** [Mon/Tue/...]
**Reported By:** [Superintendent Name]
**Weather:** [Conditions], [Low °F] – [High °F], [Wind speed/direction]

**Crew Onsite**
| Trade | Headcount | Foreman |
|---|---|---|
| [Trade] | [#] | [Name] |

**Equipment Onsite**
| Equipment | ID/Description | Status (Operating/Standby/Down) | Hours |
|---|---|---|---|
| [Equipment] | [ID] | [Status] | [Hrs] |

**Work Performed**
- [Task / location / quantity]
- [Task / location / quantity]

**Quantities Placed Today**
- [Item] — [Quantity / Unit]

**Visitors**
- [Name, role]

**Safety**
- Toolbox talk topic: [Topic]
- Incidents/near misses: [None / details]

**Issues / Delays**
- [Description / impact / action]

**Materials Received**
- [Item / supplier / quantity]

**Photos Attached:** [Yes/No, file names]
**Tomorrow's Plan:** [Brief]`,
        note: 'Mirrors the structure of the historical Quincy daily reports — that\'s what AI will produce great summaries from later. Includes weather (which dominated those reports) and clear placeholders so the same template fills in cleanly each day.',
      },
    ],
    evaluationRubric: {
      criteria: [
        'The template is for a realistic, work-relevant document type',
        'Has clear sections or headings appropriate for the document type',
        'Includes placeholder fields (e.g., [Project Name], [Date], [Crew Count]) that can be filled in for each use',
        'Is structured enough to be immediately reusable',
      ],
      passingScore: 3,
      systemPrompt:
        'You are evaluating a reusable document template created with AI assistance. The trainee was asked to pick a document they write repeatedly and create a template. Evaluate whether the template is practical, well-organized, and includes appropriate placeholder fields.',
    },
  },

  // ---- Module 4: Spreadsheets and Data ----
  {
    id: 'ex-mod4-les1',
    moduleId: 'mod-4',
    lessonId: 'mod-4-les-1',
    title: 'AI-Generated Excel Formulas',
    variant: 'paste-back',
    instructions:
      'Using the column layout from the lesson (A: Description, B: Budget, C: Spent, D: Remaining, E: % Complete, F: Status Flag), ask AI to generate formulas for columns D, E, and F. Paste the three formulas below.',
    scenario:
      'Column D should be B-C (Remaining). Column E should be C/B as a percentage. Column F should flag "OVER BUDGET" if C>B, "ON TRACK" if within 10%, and "UNDER BUDGET" otherwise.',
    hints: [
      'Describe the rule in plain English. AI handles the syntax. Example: "Show OVER BUDGET if spent is greater than budget."',
      'Be precise about which columns are which. "B is budget, C is spent" leaves no ambiguity.',
      'Define your thresholds exactly. "Within 10%" is ambiguous — say "spent is between 90% and 110% of budget."',
      'Always test with known values: $100K budget, $110K spent should flag OVER BUDGET. $95K spent should flag ON TRACK. $50K spent should flag UNDER BUDGET.',
      'Decide whether you want relative (`B2`) or absolute (`$B$2`) references. Absolute matters when a formula points to a single header cell that shouldn\'t shift.',
    ],
    goodExamples: [
      {
        title: 'Example — Three working formulas',
        body: `**Column D (Remaining) — formula for row 2:**
\`=B2-C2\`

**Column E (% Complete) — formula for row 2, formatted as a percentage:**
\`=C2/B2\`
*(In the Number group, set the cell format to Percentage so it displays as e.g. 75% rather than 0.75.)*

**Column F (Status Flag) — formula for row 2:**
\`=IF(C2>B2, "OVER BUDGET", IF(C2>=0.9*B2, "ON TRACK", "UNDER BUDGET"))\`

**How to read column F:**
- If Spent (C) is greater than Budget (B) → "OVER BUDGET"
- Else if Spent is at least 90% of Budget → "ON TRACK"
- Else → "UNDER BUDGET"

**Verification (always do this):**

| B (Budget) | C (Spent) | Expected F | Formula returns |
|---|---|---|---|
| 100,000 | 110,000 | OVER BUDGET | OVER BUDGET ✓ |
| 100,000 | 95,000 | ON TRACK | ON TRACK ✓ |
| 100,000 | 50,000 | UNDER BUDGET | UNDER BUDGET ✓ |

Drag each formula down the column. Excel auto-adjusts the row references.`,
        note: 'Gives all three formulas, explains the column F logic in plain English, and most importantly — shows the verification table. Always include a verification table when you use AI-generated formulas. That\'s the whole point of the lesson.',
      },
    ],
    evaluationRubric: {
      criteria: [
        'Provides a formula for column D (Remaining) that subtracts Spent from Budget',
        'Provides a formula for column E (% Complete) that divides Spent by Budget',
        'Provides a formula for column F (Status Flag) with conditional logic for OVER BUDGET, ON TRACK, and UNDER BUDGET',
        'Formulas use correct Excel syntax (=, cell references, IF/IFS functions)',
      ],
      passingScore: 3,
      systemPrompt:
        'You are evaluating Excel formulas generated with AI assistance. The trainee was given a project cost spreadsheet layout and asked to generate formulas for Remaining (B-C), % Complete (C/B), and a Status Flag with three conditions. Evaluate whether the formulas are syntactically correct and logically sound. Minor variations in approach (IF vs IFS, nested vs flat) are all acceptable.',
    },
  },
  {
    id: 'ex-mod4-les2',
    moduleId: 'mod-4',
    lessonId: 'mod-4-les-2',
    title: 'Data Analysis Approach',
    variant: 'paste-back',
    instructions:
      'Ask AI what analyses to run on 50 completed projects to understand which types go over budget. Also ask for recommended Excel pivot tables or charts. Paste AI\'s recommendations below.',
    scenario:
      'Dataset: 50 projects with Type, Contract Value, Final Cost, Duration (planned/actual), Change Orders, Client Satisfaction. The trainee should get analysis suggestions from AI.',
    hints: [
      'Don\'t ask AI to "analyze the data." Ask: "What analyses *should* I run to answer X?" That\'s the difference between AI doing the work and AI being your analyst.',
      'Tell AI exactly which fields you have. "Type, Contract Value, Final Cost, Duration, Change Orders, Satisfaction." That keeps suggestions grounded.',
      'Ask follow-ups for specifics: "Which Excel pivot table would best show this?" or "Walk me through the steps in Excel to build that chart."',
      'Apply your judgment: 50 projects across 4 types is ~12 each. That\'s not enough for regression. Variance comparison is more honest.',
      'Remember **correlation ≠ causation**. AI might suggest one moves with the other; you decide whether to claim one caused the other.',
    ],
    goodExamples: [
      {
        title: 'Example 1 — Practical analysis recipe',
        body: `**To understand which project types go over budget, I\'d run these four analyses, in order:**

**1. Cost overrun per project (calculated column)**
- Add a column: \`Overrun % = (Final Cost − Contract Value) / Contract Value\`
- Sort descending. The biggest absolute and percentage overruns float to the top.

**2. Average overrun by project type — pivot table**
- Pivot: Rows = Type, Values = Average of Overrun %
- Sort descending. This is the headline answer.

**3. Distribution of overruns by type — box plot or chart**
- Use a column chart or box plot to show range, not just averages. A type with a 5% average might still have a single 40% disaster.
- An average can hide volatility.

**4. Cross-reference with change orders and duration variance**
- Pivot: Rows = Type, Values = Average # of Change Orders, Average Schedule Variance.
- Often the type with the most overruns also has the most COs and schedule slips. That hints at *why*.

**Caveats to apply your judgment to:**
- 50 projects across 4 types is ~12 per type. Treat the findings as **directional, not statistically conclusive**.
- Correlation between overruns and change orders does NOT mean change orders caused the overruns. They might both be downstream of unclear scope or aggressive bidding.
- Pull the bottom-3 outliers in each type and read their summaries before drawing conclusions — averages can be skewed by a single bad project.`,
        note: 'Doesn\'t just list analyses — it sequences them, recommends specific Excel features, and explicitly calls out the limits of the data and the correlation ≠ causation trap. That last paragraph is what separates a junior analyst from a senior one.',
      },
      {
        title: 'Example 2 — Quick three-step recommendation',
        body: `**Three analyses, fastest path to insight:**

**Step 1 — Compute overrun %.** New column: \`(Final Cost − Contract Value) / Contract Value × 100\`

**Step 2 — Pivot table by type.**
- Rows: Project Type
- Values: Avg of Overrun %, Count of Projects, Max Overrun %
- This single pivot answers "which type goes over budget most often, and how badly."

**Step 3 — Bar chart of average overrun by type.**
- Sort descending. The visual makes the pattern obvious.

**Caveat:** Only ~12 projects per type. Treat the chart as a starting point for further investigation, not a verdict.`,
        note: 'Tighter version. Same logical flow but condensed for someone who wants to start moving in 5 minutes. The caveat at the end is mandatory — without it, you\'re overstating what 12 data points can prove.',
      },
    ],
    evaluationRubric: {
      criteria: [
        'Suggests at least 2-3 relevant analysis approaches (e.g., average cost overrun by type, correlation analysis, variance comparison)',
        'Recommends specific Excel features (pivot tables, charts, or formulas)',
        'The analysis approaches are appropriate for the dataset described',
      ],
      passingScore: 2,
      systemPrompt:
        'You are evaluating a data analysis plan generated with AI assistance. The trainee has 50 completed construction projects and wants to understand which types go over budget. Evaluate whether the recommended analyses are relevant and practical.',
    },
  },
  {
    id: 'ex-mod4-les3',
    moduleId: 'mod-4',
    lessonId: 'mod-4-les-3',
    title: 'Normalize Messy Data',
    variant: 'paste-back',
    instructions:
      'Paste the three different equipment data formats from the lesson into AI. Ask it to normalize into a consistent table with columns: Equipment Type, Description, Hours, Status. Paste the normalized table below.',
    scenario:
      'Three superintendents tracked equipment differently. The normalized table should consistently represent: crane (200T), excavator, barge, tug, and pump across all three formats.',
    hints: [
      'Give AI the schema explicitly: "Output a table with columns Equipment Type, Description, Hours, Status."',
      'Define the values you expect for the Status column: "Operating or Standby — pick one for each row."',
      'Tell AI how to interpret ambiguous tokens — "all day" = 8, "0600-1400" = 8 hours. Otherwise AI guesses (and may guess wrong).',
      'Always spot-check at least two rows against the source. AI sometimes drops or merges entries silently.',
      'If the same equipment appears in multiple formats (e.g. "200T crane" and "Manitowoc 2250"), decide if you want them as one row or three.',
    ],
    goodExamples: [
      {
        title: 'Example — Clean normalized output',
        body: `**Normalized equipment utilization table:**

| Equipment Type | Description | Hours | Status |
|---|---|---|---|
| Crane | 200T (Manitowoc 2250) | 8 | Operating |
| Excavator | CAT 330 | 6.5 | Operating |
| Excavator | Hyundai | 4 | Operating |
| Barge | MV Cashman | 10 | Standby |
| Tug | (unspecified) | — | Standby |
| Pump | (unspecified) | 3 | Operating |

**Normalization decisions made:**

- "0600–1400" → 8 hours (operating window).
- "all day" → 10 hours (standard barge operating day; flag if your shop uses 8 or 12).
- The 200T crane appeared in two formats (Superintendent A and B); merged into one row with both descriptors noted.
- The tug was reported "on standby" without hours — left as "—" rather than guessed at.
- Two excavator entries kept separate (CAT 330 and Hyundai) because they\'re distinct units even though both are excavators.

**Verification spot-check:**
- Row 1 (Crane 8 hrs) → matches Superintendent A and B inputs.
- Row 4 (Barge 10 hrs Standby) → matches Superintendent A ("all day") and C ("barge,10,standby"). ✓`,
        note: 'Hits the schema, makes the normalization decisions explicit, AND shows a spot-check. The "decisions made" section is critical — without it, the next person to use this data has to reverse-engineer your assumptions.',
      },
    ],
    evaluationRubric: {
      criteria: [
        'Produces a table with consistent columns (Equipment Type, Description, Hours, Status or similar)',
        'Correctly parses data from all three superintendent formats',
        'Standardizes operating/standby status consistently',
        'Hours are represented as numbers, not mixed text',
      ],
      passingScore: 3,
      systemPrompt:
        'You are evaluating a normalized data table created with AI assistance. The trainee was given three different formats of equipment utilization data from different construction superintendents and asked to normalize them into a consistent table. Evaluate whether the normalization is correct and consistent.',
    },
  },

  // ---- Module 5: Images, Video, and Media ----
  {
    id: 'ex-mod5-les1',
    moduleId: 'mod-5',
    lessonId: 'mod-5-les-1',
    title: 'Generate a Presentation Image',
    variant: 'paste-back',
    instructions:
      'Use AI to generate an image for a safety briefing presentation cover slide. Describe the image you generated and paste the prompt you used.',
    scenario:
      'The trainee should write a descriptive prompt for an AI image generator, specifying scene (marine construction), safety elements (PPE, equipment), and style (professional/realistic).',
    hints: [
      'Use the **Subject · Composition · Style · Exclusions** framework — every solid image prompt has all four.',
      'Be specific about composition: "wide shot," "low angle," "golden hour lighting." Vague prompts produce vague images.',
      'Mention safety details explicitly: hard hats, life vests, safety glasses. AI doesn\'t always include them by default.',
      'List what you DON\'T want: "no text overlays, no watermarks, no cartoon style." Exclusions are as important as inclusions.',
      'If the first generation isn\'t right, iterate — keep what works, change what doesn\'t. Don\'t throw out the whole prompt.',
    ],
    goodExamples: [
      {
        title: 'Example 1 — Strong prompt with all four parts',
        body: `**Prompt I used:**

"Wide shot of a marine construction site at sunrise. A crane is operating on a barge in calm harbor water, with three construction workers in hard hats, fluorescent safety vests, and life jackets visible on the deck. A second barge with a stockpile of steel sheet piles is docked in the background. Soft golden-hour lighting, slight haze on the water, professional corporate photography style, photorealistic. Composition: low angle from the water, wide aspect ratio for a presentation cover. No text overlays, no watermarks, no cartoon style, no extra workers."

**What I generated:**
A wide cinematic image of a sunrise marine construction scene. The crane reads as a real Manitowoc-style lattice boom, the workers are clearly in PPE (hard hats, vests, vests on top of insulated jackets — appropriate for a winter setting), and the harbor water is calm with believable reflections. The composition leaves the upper third of the frame open, which works well for a presentation title overlay.

**What I'd refine on the next iteration:**
- The second barge in the background is cropped awkwardly. I'd add: "second barge fully in frame, no edge cropping."
- One worker's high-vis vest looks more orange than fluorescent yellow — I'd specify the color if it matters for brand.

**Notes on safety / authenticity:**
The image is AI-generated and should be labeled as an "illustration" rather than a real Cashman jobsite if used in any external deliverable.`,
        note: 'Hits all four parts of the framework, includes the actual prompt verbatim, describes the result honestly, calls out what to iterate on, AND notes the labeling responsibility for AI imagery in external decks. That last point is what separates someone who *gets it* from someone who just generated a picture.',
      },
    ],
    evaluationRubric: {
      criteria: [
        'Includes the prompt they used to generate the image',
        'The prompt is specific about the scene (marine/construction context)',
        'The prompt mentions safety-relevant elements (PPE, equipment, workers)',
        'The trainee describes the resulting image or notes what worked/didn\'t work',
      ],
      passingScore: 2,
      systemPrompt:
        'You are evaluating an image generation exercise. The trainee was asked to generate a safety briefing cover image using AI. They should provide both the prompt they used and a description of the result. Be lenient -- the focus is on learning to write good image prompts.',
    },
  },
  {
    id: 'ex-mod5-les2',
    moduleId: 'mod-5',
    lessonId: 'mod-5-les-2',
    title: 'Create a Presentation Outline',
    variant: 'paste-back',
    instructions:
      'Using the project kickoff data from the lesson, ask AI to create a 10-slide outline with suggested content. Paste the outline below.',
    scenario:
      'Project kickoff for $6M bulkhead replacement at Port of Beaumont. 9 months. Key team: Jim Talbot, Sarah Chen, Dave Martinez. Safety priorities: over-water, crane ops, confined space. Environmental: turbidity monitoring, marine mammal observation.',
    hints: [
      'Two-step pattern: outline first, then content. Don\'t ask for both in one shot.',
      'Tell AI exactly who the audience is — "client kickoff with the Port of Beaumont team" produces different slides than "internal kickoff."',
      'Each slide should have a specific purpose. Generic slides like "Background" are usually filler.',
      'Make sure safety and environmental commitments get their own slides for a marine project — those are non-negotiable for the audience.',
      'Leave room for Q&A or "Open Items" as the last slide — kickoffs always surface questions.',
    ],
    goodExamples: [
      {
        title: 'Example — 10-slide kickoff outline',
        body: `**Project Kickoff — Port of Beaumont Bulkhead Replacement**
*Audience: Port of Beaumont owner team and Cashman delivery team. Length: 30 min + Q&A.*

**Slide 1 — Cover**
- Project name, value, duration (June 2026 – February 2027), Cashman logo.

**Slide 2 — Project Overview**
- Scope at a glance: remove 800 LF deteriorated steel sheet pile bulkhead; install new AZ-26 wall + concrete cap; backfill and grade.
- Map / aerial of the work area.

**Slide 3 — The Cashman Team**
- Sarah Chen — PM, single point of contact for the client.
- Jim Talbot — Superintendent, day-to-day field lead.
- Dave Martinez — Engineer of record on the structural design.
- Org chart showing reporting lines.

**Slide 4 — Schedule and Milestones**
- 9-month overall duration.
- Key milestones: mobilization (June), demolition complete (Aug), 50% pile installation (Oct), substantial completion (Jan), demob (Feb).
- Note any client review/approval gates.

**Slide 5 — Means and Methods**
- Removal sequence, sheet pile installation method, cap placement, backfill plan.
- Equipment list at high level (crane, sheet pile rig, barge, support vessels).

**Slide 6 — Safety Plan**
- Working over water — fall protection plan, rescue boat onsite during all over-water work.
- Crane operations — daily inspection, certified operators, lift planning.
- Confined space (tie-back installation) — entry permit process, atmospheric monitoring, retrieval plan.

**Slide 7 — Environmental Compliance**
- Turbidity monitoring at three stations (upstream, downstream, work area). Daily sampling, results to COR within 24 hours.
- Marine mammal observation during pile driving — qualified observer onsite, soft-start protocol.
- Spill prevention plan onsite at all times.

**Slide 8 — Reporting and Communications**
- Monthly progress report to the Port.
- Weekly schedule update.
- Daily field reports retained internally; available on request.
- Standing weekly coordination call.

**Slide 9 — Risk Register and Mitigations**
- Top 3-5 risks: weather, supplier lead times, marine traffic, contaminated soil possibility.
- For each: likelihood, impact, mitigation.

**Slide 10 — Open Items and Next Steps**
- Outstanding decisions / approvals needed from the Port.
- Pre-construction meeting target date.
- Q&A.`,
        note: 'Each slide has a clear, named purpose — no filler. The safety and environmental slides each get a full slide because the audience (a port authority) cares about both. Risk register and Open Items are at the back where they belong, not buried in the middle.',
      },
    ],
    evaluationRubric: {
      criteria: [
        'Outline has approximately 10 slides',
        'Covers key topics: project overview, team, schedule, scope, safety, environmental, client expectations',
        'Includes project-specific details from the provided notes',
        'Slides have suggested content or talking points (not just titles)',
      ],
      passingScore: 3,
      systemPrompt:
        'You are evaluating a presentation outline generated with AI assistance for a marine construction project kickoff. Evaluate whether it covers the key topics, includes project-specific details, and is structured logically for a professional presentation.',
    },
  },
  {
    id: 'ex-mod5-les3',
    moduleId: 'mod-5',
    lessonId: 'mod-5-les-3',
    title: 'Meeting Summary and Follow-Up Email',
    variant: 'paste-back',
    instructions:
      'Describe a recent or typical meeting in 4-5 bullet points. Ask AI to generate: a formal summary, an action item list, and a follow-up email. Paste the follow-up email below.',
    scenario:
      'The trainee describes a meeting from their work experience and uses AI to generate professional meeting documentation. The follow-up email should reference specific decisions and action items.',
    hints: [
      'The bullets you feed AI matter — be specific about what was decided and who agreed to do what. Vague input produces vague follow-ups.',
      'Tell AI the audience for the follow-up email (everyone in the meeting? leadership? a subcontractor not in the room?). Same content, different framings.',
      'Action items must include both an owner AND a deadline. "Mike to follow up" is incomplete — "Mike to follow up by Friday COB" is actionable.',
      'Keep the email concise. A wall of text means people skim and miss the asks.',
      'Always review AI\'s output. If you see an action assigned to the wrong person, fix it before hitting send — that\'s how mistakes propagate.',
    ],
    goodExamples: [
      {
        title: 'Example — Concise meeting follow-up email',
        body: `**Subject:** Recap & Action Items — Weekly Coordination, [Date]

Team,

Quick recap from today\'s coordination meeting. Full action items below — please flag any conflicts by EOD tomorrow.

**Decisions**
- Switching south bulkhead sheet piles from AZ-26 to AZ-24 with a waler at el. +2.0. Net cost ~+$15K. Client has verbally approved; CO package goes out Thursday.
- Daily 0700 toolbox talks remain in person at the trailer; remote workers can dial in.

**Action Items**

| Owner | Item | Due |
|---|---|---|
| Tom (Procurement) | Place AZ-24 sheet pile PO | EOD Thursday |
| Dave (Structural) | Finalize CO package, including waler detail | EOD Thursday |
| Sarah (PM) | Submit CO to client | Friday AM |
| Jim (Superintendent) | Update 10-day look-ahead with new pile delivery dates | Friday AM |

**Open Items**
- Confirmation on the precast cap supplier expedite (still pending — Tom following up).
- Inspector site visit schedule for next week — awaiting client.

**Next Meeting:** [Day, Date, Time]

Thanks all,
[Your Name]`,
        note: 'Decisions and actions are clearly separated. Every action has an owner and a deadline. Open items are called out as a parking lot. The "flag conflicts by EOD tomorrow" line is a polite way of saying "object now or hold your peace" — it forces real review.',
      },
    ],
    evaluationRubric: {
      criteria: [
        'The email references specific meeting topics or decisions',
        'Includes action items with owners and/or deadlines',
        'Uses professional email tone and formatting',
        'Is concise and actionable (not just a wall of text)',
      ],
      passingScore: 3,
      systemPrompt:
        'You are evaluating a meeting follow-up email generated with AI assistance. The trainee described a meeting and asked AI to draft documentation. Evaluate the follow-up email for professionalism, specificity, and actionability.',
    },
  },

  // ---- Module 6: Document Processing and Search ----
  {
    id: 'ex-mod6-les1',
    moduleId: 'mod-6',
    lessonId: 'mod-6-les-1',
    title: 'Search Company Documents',
    variant: 'paste-back',
    instructions:
      'Use the Cashman AI Portal search/chat to ask a question about company procedures. Paste the question you asked and the answer you received. If documents aren\'t loaded yet, ask AI to explain how RAG works.',
    scenario:
      'The trainee demonstrates use of the AI Portal\'s document search feature. If the Portal has documents, they should get an answer with citations. If not, an explanation of RAG is acceptable.',
    hints: [
      'Ask in plain English — "What\'s our process for handling a differing site condition?" beats "DSC procedure."',
      'Click any citations the system returns. Verify they actually say what AI claims.',
      'Don\'t use ChatGPT or other public tools for company-policy questions. Use the Cashman AI Portal so the data stays internal.',
      'Ask follow-ups to drill in: "Where exactly in the document does it say the 14-day notice?"',
      'If you get a non-answer, try rephrasing — sometimes AI search needs different keywords to find the right passage.',
    ],
    goodExamples: [
      {
        title: 'Example 1 — Q&A with citations',
        body: `**Question I asked:**
"What is our process for handling a differing site condition? What are the notification timelines and required documentation?"

**Answer the Portal returned:**

When a differing site condition is encountered, the field team should:

1. **Stop work in the affected area** if continued work would compound the issue or create a safety risk.
2. **Document the condition** with photos, written description, GPS coordinates, and any test results obtained on-site.
3. **Notify the Project Manager and Engineer immediately** — same day, before the end of shift.
4. **Submit formal written notice to the Owner** within the contractually required notice period (typically 7–14 days; check the specific contract).
5. **Preserve the condition** for the Owner\'s representative to inspect, where feasible.
6. **Track all impacted costs and time** from the moment the condition is discovered, in a separate cost code.

*Sources cited: Cashman Field Operations Manual §4.7 (Differing Site Conditions); USACE Standard Form Contract Clause 52.236-2; Project-specific contract terms must be checked for exact notice periods.*

**My follow-up question:**
"Where in the field manual does it specify the cost-code-tracking requirement?"

**Follow-up answer:**
"§4.7.3 — 'All costs incurred from the moment the differing site condition is discovered through resolution shall be tracked in a separate, segregated cost code established for the change. Inclusion in the base project cost code is prohibited.'"

**My verification:** I clicked the §4.7.3 citation; the field manual page does say exactly that. ✓`,
        note: 'Best-of-breed: clear question, structured answer with citations, a follow-up to drill deeper, and explicit verification of one citation. The verification step is what makes you trustworthy with AI outputs.',
      },
    ],
    evaluationRubric: {
      criteria: [
        'Includes both the question asked and the AI\'s response',
        'The question is work-relevant (procedures, policies, requirements, etc.)',
        'The response provides substantive information (not just "I don\'t know")',
      ],
      passingScore: 2,
      systemPrompt:
        'You are evaluating a document search exercise. The trainee was asked to search company documents using the Cashman AI Portal. If documents were available, they should show a Q&A with citations. If not, an explanation of RAG is acceptable. Be lenient -- the goal is demonstrating they used the tool.',
    },
  },
  {
    id: 'ex-mod6-les2',
    moduleId: 'mod-6',
    lessonId: 'mod-6-les-2',
    title: 'Analyze a Document',
    variant: 'paste-back',
    instructions:
      'Upload a non-sensitive document to the Cashman AI Portal (or paste a section into AI). Ask three questions: key requirements, deadlines, and potential risks. Paste the AI\'s answers below.',
    scenario:
      'The trainee should analyze a document and demonstrate the ability to ask targeted questions. Any document type is acceptable as long as the questions are substantive.',
    hints: [
      'Use the **Requirements · Deadlines · Risks** pattern. It works on virtually any document.',
      'Be specific in your questions — "What environmental permits are required and when must they be obtained?" beats "summarize this."',
      'For long documents, watch for the **lost-in-the-middle** effect. Always end with: "Is there anything else I should know?"',
      'Ask follow-ups when AI is vague. "You mentioned a 30-day notice — where exactly in the document is that?"',
      'Any sensitive document goes to the Cashman AI Portal, not a public AI tool. That\'s non-negotiable.',
    ],
    goodExamples: [
      {
        title: 'Example — Three substantive questions and answers',
        body: `**Document:** [Public sample marine construction safety plan]

---

**Q1: What are the key requirements in this document?**

The document establishes the following requirements for the contractor:
- Submit a site-specific safety plan within 14 calendar days of notice to proceed.
- Designate a qualified Site Safety and Health Officer (SSHO) on-site at all times.
- Conduct daily safety briefings before work begins each shift.
- Maintain a fall protection program for all over-water work — 100% tie-off above 6 feet.
- Provide rescue boat and trained crew during all over-water operations.
- All crane operators must hold current NCCCO certification.
- Conduct quarterly internal safety audits and provide written results to the Owner.

---

**Q2: Are there any deadlines or time-sensitive items?**

| Item | Timing |
|---|---|
| Submit site-specific safety plan | 14 days after NTP |
| Submit operator certifications | Prior to mobilization |
| Quarterly safety audit reports | Within 5 business days of audit |
| Incident notification to Owner | Within 1 hour of any recordable |
| Monthly safety statistics | First Friday of each month |

---

**Q3: What are the potential risks or issues mentioned?**

- **Compliance risk** — Multiple submittal deadlines (within 14 days, before mobilization, within 1 hour of incident). Missing any of these creates a contract breach.
- **Operational risk** — Rescue boat is required to be staffed during all over-water work. If the boat or crew is unavailable, ALL over-water work must stop.
- **Personnel risk** — NCCCO certification can lapse without notice; recommend tracking certification expiration dates centrally.
- **Reporting risk** — The 1-hour incident notification is aggressive. Establish a clear chain of command for after-hours incidents.
- **Audit risk** — Quarterly internal audits with results reported to the Owner means findings are visible. Recommend pre-audit walks to surface and fix issues before formal audits.

**Final check — anything else I should know?**

- Yes: §7.4 specifies that subcontractors are required to comply with the same safety plan, but the prime contractor remains accountable for violations. Worth flagging in subcontract language.`,
        note: 'Each answer is structured (lists, tables) and substantive. The "final check" question caught something genuinely useful (subcontractor flow-down liability) that AI hadn\'t volunteered. That\'s the lost-in-the-middle defense in action.',
      },
    ],
    evaluationRubric: {
      criteria: [
        'Shows responses to at least two of the three requested question types (requirements, deadlines, risks)',
        'The AI responses are substantive and reference specific content',
        'The answers demonstrate real document analysis, not generic responses',
      ],
      passingScore: 2,
      systemPrompt:
        'You are evaluating a document analysis exercise. The trainee uploaded or pasted a document into AI and asked about requirements, deadlines, and risks. Evaluate whether the responses demonstrate genuine document analysis.',
    },
  },
  {
    id: 'ex-mod6-les3',
    moduleId: 'mod-6',
    lessonId: 'mod-6-les-3',
    title: 'Extract Structured Data from a Spec',
    variant: 'paste-back',
    instructions:
      'Paste the specification paragraph from the lesson into the Cashman AI Portal. Ask AI to extract all requirements into a table with columns: Requirement, Category, Deadline, Priority. Paste the table below.',
    scenario:
      'The spec paragraph contains multiple requirements: safety plan (14 days), NCCCO certification, turbidity monitoring (daily, 24-hr reporting), spill prevention plan, AWS D1.5 welders, material submittals (60 days prior), 10-day look-ahead (weekly), night work prohibition, PE-designed cofferdams.',
    hints: [
      'Use the **Source · Fields · Structure** pattern in your prompt. Tell AI exactly the columns you want.',
      'Count the requirements yourself in the source. If the source has 9 and AI extracts 7, ask "Did you miss any?"',
      'Categorize for *your* downstream work (Safety, Environmental, Submittals, Schedule, Qualifications). Use the labels your team already uses.',
      'Capture every deadline AI finds — and add "as needed" or "at all times" for ongoing requirements (no fixed date but always required).',
      'Set priority based on consequence of missing it. A 1-hour incident notification is High; a weekly look-ahead is Medium.',
    ],
    goodExamples: [
      {
        title: 'Example — Comprehensive requirements table',
        body: `**Extracted requirements:**

| # | Requirement | Category | Deadline | Priority |
|---|---|---|---|---|
| 1 | Submit site-specific safety plan | Submittal — Safety | Within 14 days of NTP | High |
| 2 | Crane operators hold current NCCCO certification | Qualifications | Prior to mobilization | High |
| 3 | Daily turbidity measurements at 3 stations (upstream, downstream, work area) | Environmental | Daily, ongoing | High |
| 4 | Turbidity results reported to COR | Reporting — Environmental | Within 24 hrs of measurement | High |
| 5 | Maintain spill prevention plan on-site | Environmental | At all times | High |
| 6 | Structural steel welding by AWS D1.5 certified welders | Qualifications | Prior to welding | Medium |
| 7 | Sheet pile material submittals | Submittal — Procurement | At least 60 days prior to driving date | High |
| 8 | 10-day look-ahead schedule | Reporting — Schedule | Updated weekly | Medium |
| 9 | Night work requires written approval from Contracting Officer | Schedule / Operations | Before any night shift | Medium |
| 10 | Temporary cofferdams designed by licensed Professional Engineer | Engineering | Prior to construction | High |

**Verification (count check):**
Source paragraph contains 9 distinct requirements. The table above has 10 rows because I split the turbidity requirement (item 3) and its 24-hour reporting requirement (item 4) into separate rows — they're different obligations with different deadlines.

**Categories used:** Submittal, Qualifications, Environmental, Reporting, Schedule, Engineering. These align with how our team already tracks compliance.

**Items I\'d normally add to a tracking system:**
- For each row: a responsible party, an internal due date (typically earlier than the contractual one), and a status field.`,
        note: 'Captures all 9 requirements (10 rows because of a smart split), uses team-aligned categories, makes the priority defensible, and ends with a note about how to operationalize the table — which is the actual value of doing this exercise.',
      },
    ],
    evaluationRubric: {
      criteria: [
        'Extracts at least 6 of the 9 distinct requirements from the spec paragraph',
        'Presents data in a table format (or clearly structured list)',
        'Categories are logical (Safety, Environmental, Qualifications, Submittals, Schedule, etc.)',
        'Deadlines are captured where mentioned (14 days, 24 hours, 60 days, weekly)',
      ],
      passingScore: 3,
      systemPrompt:
        'You are evaluating a data extraction exercise. The trainee was given a dense specification paragraph with 9 requirements and asked to extract them into a structured table. Evaluate completeness, accuracy, and organization.',
    },
  },

  // ---- Module 7: AI Agents ----
  {
    id: 'ex-mod7-les2',
    moduleId: 'mod-7',
    lessonId: 'mod-7-les-2',
    title: 'Use a Portal Agent',
    variant: 'paste-back',
    instructions:
      'Open the Cashman AI Portal and interact with an available agent. Give it a task, observe what it does differently from regular chat (tool calls, citations, multi-step reasoning). Paste the agent\'s response and your observations below.',
    scenario:
      'The trainee uses an AI agent in the Portal and notes the differences from regular chat. If agents aren\'t available, they should use regular chat with a hypothetical agent question.',
    hints: [
      'Give the agent a *goal*, not a question. "Find the open RFIs older than 14 days" is an agent task. "What\'s an RFI?" is a chat question.',
      'Watch for visible signals: tool calls ("searching the project database…"), citations, and multi-step reasoning. Those are the markers of agent behavior.',
      'Always click at least one citation. Verify it says what the agent claims. **Capability ≠ accuracy.**',
      'Beware **automation bias** — the agent looks polished and confident. Spot-check the math and the data.',
      'For consequential actions (sending an email, updating a record), confirm the agent is *proposing* the action and waiting for your approval. Human in the loop, always.',
    ],
    goodExamples: [
      {
        title: 'Example — Agent task with observation',
        body: `**Task I gave the agent:**
"Search our project database for the Galveston Wharf project. List any RFIs that have been open longer than 14 days, sorted by age. For each, include the RFI number, subject, days open, and current owner."

**Agent\'s response:**

🔎 *Searching project records for "Galveston Wharf"…*
🔎 *Querying the RFI tracker for status = OPEN and age > 14 days…*

I found 4 RFIs matching your criteria. Sorted by age (oldest first):

| RFI # | Subject | Days Open | Owner |
|---|---|---|---|
| 2026-031 | Anchor bolt embedment depth at pile cap | 27 | Owner Engineer |
| 2026-038 | Sheet pile splice detail at sta. 14+50 | 21 | Owner Engineer |
| 2026-041 | Concrete mix design — chloride limits | 18 | Owner |
| 2026-044 | Tie-back anchor proof testing protocol | 16 | Owner Engineer |

*Sources: RFI Tracker (record IDs above); pulled at 14:32 today.*

**Observations — what the agent did differently from regular chat:**

1. **Tool calls were visible.** The agent narrated its actions ("Searching project records," "Querying the RFI tracker") so I could see what data it was hitting.
2. **It cited sources.** Each RFI is linked back to its tracker ID — I can click through to verify.
3. **Multi-step reasoning.** Regular chat would have asked me to paste the data; the agent went and got it, then sorted and formatted.
4. **It included a timestamp.** "Pulled at 14:32 today" — useful, because RFI status changes constantly.

**What I verified before trusting the output:**

- I clicked RFI 2026-031. The tracker says it was opened 27 days ago and is currently with the Owner Engineer. ✓
- I spot-checked the count: filtering the tracker manually for "open + age > 14" returned the same 4 records. ✓

**One thing to watch:**
The agent didn\'t flag that two of these RFIs are blocking critical-path work. It gave me the data, not the analysis. I\'d still need to layer schedule context on top of this list before, say, drafting a follow-up email. The agent is a research assistant, not a project manager.`,
        note: 'Shows everything that distinguishes an agent from a chatbot — visible tool calls, citations, multi-step reasoning — AND demonstrates the verification habit. The closing observation about the agent giving data but not analysis is the kind of judgment call you only build by actually using these tools.',
      },
    ],
    evaluationRubric: {
      criteria: [
        'Shows the agent\'s response to a task',
        'Notes at least one observation about how the agent differs from regular chat (tool use, citations, multi-step reasoning)',
        'The task given to the agent is work-relevant',
      ],
      passingScore: 2,
      systemPrompt:
        'You are evaluating an agent interaction exercise. The trainee was asked to use an AI agent in the Cashman AI Portal and note how it differs from regular chat. Evaluate whether they demonstrated genuine agent interaction and made meaningful observations. Be lenient if agents weren\'t available -- using regular chat with thoughtful observations is acceptable.',
    },
  },
  {
    id: 'ex-mod7-les3',
    moduleId: 'mod-7',
    lessonId: 'mod-7-les-3',
    title: 'Write Agent Prompts',
    variant: 'paste-back',
    instructions:
      'Write three specific agent prompts: (1) find specific project information, (2) analyze data across records, (3) produce a formatted deliverable. Paste all three prompts below.',
    scenario:
      'The trainee should write prompts that are specific about what data to search, what analysis to perform, and what output format to produce -- not vague requests.',
    hints: [
      'Use the **WHO · WHAT · WHERE · HOW** framework — every solid agent prompt has all four.',
      'Add **constraints**: tell the agent what NOT to do. "If you can\'t find it in the cited sources, say \'I don\'t know\' instead of guessing." That single line dramatically reduces hallucinations.',
      'Specify the **output schema** — the exact columns or fields you want back. Strict structure produces reliable output.',
      'Each prompt should be different in *kind*, not just topic — retrieval, analysis, and deliverable are three distinct uses.',
      'Run the prompts after writing them and refine based on what comes back. Good prompts are iterated, not one-shot.',
    ],
    goodExamples: [
      {
        title: 'Example — Three prompts, one per use case',
        body: `**Prompt 1 — Information retrieval (specific lookup):**

"Acting as a project records analyst, search our document store for the Galveston Wharf Rehabilitation project. Return the following:

1. Current contract value
2. Original NTP date
3. Current % complete (per the most recent monthly progress report)
4. Date and contents of the most recent submitted change order
5. Any open RFIs older than 14 days

Format as a single table with two columns: Field | Value.

If a field cannot be found in the cited sources, return 'NOT FOUND' for that row rather than guessing. Cite the source document for each value."

---

**Prompt 2 — Cross-record analysis:**

"Acting as a safety analyst, query our incident records for Q1 2026. For each incident:

1. Group by incident type (slip/trip/fall, struck-by, caught-in, electrical, environmental, other).
2. Count the number of incidents per type.
3. Identify the project where each incident occurred.
4. Flag any project that had more than 2 incidents in Q1 — that\'s our internal threshold for triggering a safety review.

Return:
- A summary table: Incident Type | Count | Projects Involved
- A list of projects flagged for safety review
- A 2-3 sentence narrative summary of any patterns you notice

Constraints: Only use Q1 2026 data. If incident type is missing or unclassified in a record, list it under 'Other' rather than guessing the type."

---

**Prompt 3 — Formatted deliverable:**

"Acting as a project manager, draft a quarterly client report for the Port of Beaumont Bulkhead Replacement project covering January–March 2026.

Pull the following from our records:
- Schedule status (planned vs actual % complete)
- Budget status (spent vs total contract)
- Safety record this quarter (incidents, hours since last LTI)
- Major work completed this quarter
- Major work planned for next quarter
- Open issues or risks

Format as a formal client report with these sections, in this order:
- **Executive Summary** (3–4 sentences)
- **Schedule** | **Budget** | **Safety**
- **Work Completed**
- **Upcoming Work**
- **Open Issues / Risks**

Tone: formal, factual, suitable for a client (the Port Authority).
Cite sources for every specific number you include.
If a number cannot be confirmed in the cited sources, leave it as '[VERIFY]' rather than approximating."`,
        note: 'Each prompt hits WHO·WHAT·WHERE·HOW. Each one has explicit constraints that force the agent to admit ignorance instead of hallucinating. Each has a strict output schema. Three different *kinds* of work — retrieval, analysis, deliverable — not three variations of the same thing.',
      },
    ],
    evaluationRubric: {
      criteria: [
        'Includes three distinct prompts',
        'Prompt 1 asks for specific information retrieval (not vague)',
        'Prompt 2 involves data analysis or comparison across multiple records',
        'Prompt 3 requests a formatted deliverable (report section, email, summary)',
        'Prompts specify data sources and desired output format',
      ],
      passingScore: 3,
      systemPrompt:
        'You are evaluating three agent prompts written by a trainee. Each should be specific and well-structured: (1) information retrieval, (2) data analysis, (3) formatted deliverable. Evaluate specificity, clarity, and practicality.',
    },
  },

  // ---- Module 8: Power User Tools ----
  {
    id: 'ex-mod8-les1',
    moduleId: 'mod-8',
    lessonId: 'mod-8-les-1',
    title: 'Deep Analysis Task',
    variant: 'paste-back',
    instructions:
      'Write a detailed prompt for a complex analysis task relevant to your work. Run it in Claude Cowork or the Cashman AI Portal. Paste the prompt, the response, and your notes on what was helpful and what you\'d need to verify.',
    scenario:
      'The trainee should tackle a genuinely complex analysis question -- not a simple lookup but something requiring multi-step reasoning, comparison, or evaluation.',
    hints: [
      'Pick a question that genuinely requires *thinking*, not just lookup. "Compare three project delivery methods for X" beats "What\'s a CMAR contract?"',
      'Use the **Frame · Provide · Structure · Iterate** workflow. Frame the question, drop in the source material, ask for structured analysis, refine.',
      'Tell AI exactly what a good answer looks like — "for each option, give me a risk rating, a cost impact, and a schedule impact."',
      'For company data, use the Cashman AI Portal — Cowork is for analysis where the *thinking* is the value, not for sensitive data.',
      'After you get the answer, identify at least one specific thing you\'d need to verify before acting. AI looks polished even when it\'s wrong.',
    ],
    goodExamples: [
      {
        title: 'Example — Complex risk analysis with explicit verification needs',
        body: `**Prompt I used:**

"You are a senior contracts analyst. Analyze the attached liquidated damages clause from a USACE marine construction contract. For each of the following scenarios, walk through how the clause would apply, identify any ambiguities, and assess the contractor\'s exposure:

1. A 2-week schedule slip caused by an undisclosed differing site condition.
2. A 4-week schedule slip caused entirely by abnormal weather (Cat 1 hurricane shutdown).
3. A 3-week schedule slip with mixed causes — 1 week weather, 1 week supplier delay, 1 week unattributed.

For each scenario, provide:
- How the clause text applies (quote relevant language)
- Whether you believe the contractor has a defensible position to seek excusable delay treatment
- The likely range of LD exposure if no relief is granted
- Specific clauses or precedents you\'d cite to support a request for relief
- One thing I\'d need to verify with our legal team before relying on your analysis

Tone: cautious. If the clause language is ambiguous, say so explicitly."

**Response from Cowork:**

[2,400-word structured analysis covering all three scenarios with quoted clause language, position assessment, exposure ranges, supporting precedents, and explicit verification needs.]

**What was helpful:**
- The structured walk-through forced AI to engage with each scenario individually rather than producing a generic "it depends" answer.
- The "one thing to verify with legal" prompt produced a specific list of verification items: confirming the precise differing site condition language, the abnormal-weather threshold definition, and the FAR clause numbering.
- The cautious tone instruction kept AI from overstating contractor positions.

**What I\'d need to verify before relying on this:**
1. **Clause language quotations** — AI quoted four passages from the contract. Two I verified word-for-word against the contract; one had a slight paraphrase; one I couldn\'t find at all. The unfound quote is a hallucination — I\'d strike that argument from anything I cite externally.
2. **Cited FAR numbers** — AI referenced FAR 52.249-10 and a "FAR 52.236-2." The first is real; the second I\'d confirm with legal before relying on it.
3. **Precedent cases** — AI mentioned two case names. Without independent confirmation in a legal database, I\'d treat both as potentially fabricated.
4. **Exposure dollar ranges** — these are based on AI\'s interpretation of the LD rate. Need to confirm the rate against the contract schedule.

**Verdict:** Useful as a *first pass* to structure the legal team\'s review. Not safe to send to a client or PM as-is.`,
        note: 'Genuinely complex analysis. The verification section is the gold — AI quoted a passage that wasn\'t in the source. That\'s the kind of catch that prevents an embarrassing or career-damaging mistake. The "first pass, not final" framing at the end is exactly the right level of trust to extend to AI legal analysis.',
      },
    ],
    evaluationRubric: {
      criteria: [
        'The prompt describes a genuinely complex analysis task (not a simple question)',
        'Includes the AI\'s response',
        'Notes what was helpful about the response',
        'Identifies at least one thing that would need verification',
      ],
      passingScore: 3,
      systemPrompt:
        'You are evaluating a complex analysis exercise. The trainee was asked to run a deep analysis task using AI and reflect on the results. Evaluate whether the task was genuinely complex, whether the trainee engaged critically with the output, and whether they identified verification needs.',
    },
  },
  {
    id: 'ex-mod8-les2',
    moduleId: 'mod-8',
    lessonId: 'mod-8-les-2',
    title: 'Automation Opportunity',
    variant: 'paste-back',
    instructions:
      'Describe a repetitive task from your work. If you\'re technical, ask Claude Code to write a script. If not, ask AI whether the task could be automated and how. Paste the description and AI\'s response below.',
    scenario:
      'The trainee identifies a repetitive workflow and explores automation potential -- either with a concrete script or a conceptual automation plan.',
    hints: [
      'Pick a task you actually do every week or every project. The more repetitive, the bigger the ROI.',
      'Describe the task in detail — current steps, time per occurrence, frequency, edge cases. Vague descriptions get vague automation plans.',
      'Apply the **Automation ROI** test: frequency × duration × reliability needed. A 30-second monthly task isn\'t worth automating; a 30-minute weekly task usually is.',
      'If you\'re not technical, that\'s fine — frame it as "could this be automated, and what would it take?" That\'s actionable for IT.',
      'Always include logging/monitoring in the automation plan. Automation runs unattended; logs are how you catch problems.',
    ],
    goodExamples: [
      {
        title: 'Example 1 — Non-technical user describes the opportunity',
        body: `**The repetitive task I do:**

Every Monday morning I gather data for our weekly project status report. The current process:

1. Open 8 separate project spreadsheets in OneDrive (~15 min — slow file opens).
2. From each, copy four numbers: % complete, $ spent, # open RFIs, # safety incidents this week.
3. Paste them into a master tracking spreadsheet (~10 min, including reformatting).
4. Build a summary chart in PowerPoint (~15 min).
5. Email the result to leadership.

Total time: ~45 minutes per week. I do this 50 weeks a year — that\'s about 37 hours annually.

**My question to AI:**
"Could this task be automated? If so, walk me through what it would take and who I\'d need to involve."

**AI\'s response:**

Yes, this is a great automation candidate. Three viable approaches, in order of effort:

**Option 1 — Power Query in Excel (low effort)**
- Use Power Query to pull each project spreadsheet automatically into the master tracker.
- One-time setup with IT (~2 hours).
- Refresh becomes a single click each Monday.
- Estimated savings: 25 minutes/week, retains the manual steps for chart-building and email.

**Option 2 — Power Automate flow (medium effort)**
- Schedule a Power Automate flow that runs every Monday at 7am.
- Flow opens each spreadsheet, extracts the 4 metrics, writes them to the master tracker.
- Auto-generates the summary chart with the latest data.
- Sends a draft email to leadership for your review (always keep a human in the loop on the send).
- Setup: 4–8 hours with IT support.
- Estimated savings: 35 minutes/week — leaves you only the final review and send.

**Option 3 — Centralize source-of-truth (high effort)**
- Move project tracking out of separate spreadsheets and into a centralized system (Power BI, the Cashman AI Portal, or a project database).
- Eliminates the "open 8 files" problem at its root.
- Largest upfront cost, biggest long-term payoff.

**Recommendation:**
Start with Option 1. If it works, you\'re saving ~21 hours/year for 2 hours of setup. If you outgrow it (more projects, more metrics), upgrade to Option 2.

**Who to involve:**
- IT for any Power Automate work (account setup, permissions on shared folders).
- Your manager, briefly, to confirm the leadership recipient list and any tweaks to the format.

**One caution:**
Add a manual review step before the email goes to leadership. Automated reports that contain wrong numbers go out fast and are hard to recall. Always keep a human review gate on outbound communication.`,
        note: 'Non-technical user, but the description is specific enough (8 spreadsheets, 4 fields, ~45 min, 50 weeks) that AI can give a real, tiered automation plan with realistic time estimates and a sensible "where to start" recommendation. The closing caution about a human review gate on outbound automation is essential — that\'s the kind of judgment AI sometimes leaves out.',
      },
      {
        title: 'Example 2 — Technical user, concrete script',
        body: `**The task I want to automate:**

Every two weeks, I rename and re-organize ~50 daily field report PDFs that come in from various superintendents. The current chaos: filenames look like "DailyReport.pdf," "DR jan15.PDF," "Field Report 1-15-26.pdf," etc. I rename them to a consistent format (\`YYYY-MM-DD_<project>_<superintendent>.pdf\`) and move them into project-specific subfolders.

**My request to Claude Code:**
"Write a Python script that scans a folder for PDFs, opens each one, extracts the date and superintendent name from page 1 of the PDF (consistent template across all reports), renames the file to \`YYYY-MM-DD_<project>_<superintendent>.pdf\`, and moves it to a project-specific subfolder. The project name is on the cover page in the format 'Project: <name>'. Include logging so I can see what got renamed and what didn\'t. Skip files that don\'t match the expected template and write them to a 'review' subfolder."

**Script Claude Code generated:**

[Full Python script using pdfplumber to extract text from page 1, regex to pull date / project / superintendent fields, pathlib for safe file moves, structured logging to a CSV that records source filename, target filename, status, and any error message.]

**Edge cases I made sure the script handles:**
- PDFs that don\'t match the template → moved to 'review' subfolder, logged with reason.
- Filename collisions (two files with the same target name) → second file gets a \`_2\` suffix and a warning is logged.
- Read-only or locked PDFs → caught and logged, file is skipped (not moved or renamed).

**Logging output (CSV):**
| source | target | status | notes |
|---|---|---|---|
| DailyReport.pdf | 2026-01-15_GalvWharf_JTalbot.pdf | OK | |
| DR jan15.PDF | (review subfolder) | SKIP | template not matched |
| ... | ... | ... | ... |

**What I verified:**
- Ran the script against a copy of the folder first (NEVER the original).
- Spot-checked 5 random renamed files to confirm the date and superintendent matched the PDF cover page.
- Confirmed the 'review' subfolder caught the 3 oddballs (which were old templates pre-2025).

Time savings: roughly 20 minutes every two weeks.`,
        note: 'Technical example. Notice the discipline: ran against a copy first, spot-checked the output, structured logging built in. Automation that runs unattended needs logs — without them you can\'t catch silent failures. The "ran against a copy first" line is non-negotiable for any file-mutating script.',
      },
    ],
    evaluationRubric: {
      criteria: [
        'Describes a specific, real repetitive task from their work',
        'Includes AI\'s response about automation potential or a script',
        'The automation suggestion is practical and relevant to the described task',
      ],
      passingScore: 2,
      systemPrompt:
        'You are evaluating an automation exploration exercise. The trainee described a repetitive work task and asked AI about automating it. Evaluate whether the task description is specific and whether the automation suggestion is practical.',
    },
  },
];

// ==========================================================================
// GAMES
// ==========================================================================

export const GAMES: Game[] = [
  // ---- Module 1: Your AI Toolkit ----
  {
    id: 'game-mod1-les3',
    moduleId: 'mod-1',
    lessonId: 'mod-1-les-3',
    title: 'The Bulletin Board Test',
    description:
      'Decide whether each piece of information is safe to paste into a cloud AI tool, or whether it should stay on the Cashman AI Portal.',
    startNodeId: 'node-1',
    nodes: [
      {
        id: 'node-1',
        situation:
          'You want to use AI to summarize a 40-page project specification for a $12M dredging contract. The spec contains scope details, equipment requirements, and pricing benchmarks. Where should you do this?',
        choices: [
          {
            label: 'Paste it into ChatGPT -- it\'s just a spec',
            nextNodeId: 'node-2',
            feedback:
              'Project specifications often contain proprietary information, scope details that inform bid strategy, and pricing data. This fails the bulletin board test -- you wouldn\'t post bid specs in the lobby. Use the Cashman AI Portal.',
            isCorrect: false,
          },
          {
            label: 'Use the Cashman AI Portal -- spec data should stay internal',
            nextNodeId: 'node-2',
            feedback:
              'Correct! Project specs contain sensitive scope and pricing information. The Cashman AI Portal processes everything on company infrastructure, keeping the data private.',
            isCorrect: true,
          },
        ],
      },
      {
        id: 'node-2',
        situation:
          'An engineer wants to learn about a new OSHA regulation on crane operations near navigable waterways. The question involves only publicly available regulatory information.',
        choices: [
          {
            label: 'Use any AI tool -- the information is already public',
            nextNodeId: 'node-3',
            feedback:
              'Correct! Public regulations are freely available. No company data is involved, so any AI tool is fine. You\'d happily post "OSHA crane regulations" on a bulletin board.',
            isCorrect: true,
          },
          {
            label: 'Only use the Cashman AI Portal -- all AI use must go through company systems',
            nextNodeId: 'node-3',
            feedback:
              'The Cashman AI Portal works fine, but it\'s not required for public information. The bulletin board test asks if the data is sensitive, not whether you\'re using AI. Public regulations are fair game for any tool.',
            isCorrect: false,
          },
        ],
      },
      {
        id: 'node-3',
        situation:
          'The finance team wants to analyze project cost data including profit margins, overhead rates, and bid markups across the last 20 projects.',
        choices: [
          {
            label: 'Use a cloud AI tool with an enterprise plan',
            nextNodeId: 'node-4',
            feedback:
              'Even enterprise plans for cloud AI tools may process your data on external servers. Profit margins and bid markups are among the most sensitive data at any company. Keep this on internal infrastructure.',
            isCorrect: false,
          },
          {
            label: 'Use the Cashman AI Portal -- financial data stays internal',
            nextNodeId: 'node-4',
            feedback:
              'Correct! Financial data like margins, overhead rates, and markups is extremely sensitive. You would never post this on a bulletin board. Keep it on the Cashman AI Portal.',
            isCorrect: true,
          },
        ],
      },
      {
        id: 'node-4',
        situation:
          'You\'re writing a LinkedIn post about Cashman\'s recent bridge project completion, using publicly available project photos and a press release.',
        choices: [
          {
            label: 'Use any AI tool -- everything is already public',
            nextNodeId: 'end',
            feedback:
              'Correct! The photos and press release are already public. You\'d literally post this on a bulletin board (or LinkedIn, which is basically a digital one). Any AI tool is fine for public content.',
            isCorrect: true,
          },
          {
            label: 'Use the Cashman AI Portal to keep all AI work internal',
            nextNodeId: 'end',
            feedback:
              'The Cashman AI Portal would work, but there\'s no security reason to restrict yourself here. All the source material is already public. Use whatever tool gives the best results for marketing content.',
            isCorrect: false,
          },
        ],
      },
    ],
  },
];

// ==========================================================================
// SURVEYS
// ==========================================================================

export const SURVEYS: Survey[] = [
  {
    id: 'survey-mod8-les3',
    moduleId: 'mod-8',
    lessonId: 'mod-8-les-3',
    title: 'Course Completion & Your AI Plan',
    questions: [
      {
        id: 'sq-1',
        type: 'rating',
        question:
          'How confident are you in using AI for email and written communication?',
        category: 'self-assessment',
      },
      {
        id: 'sq-2',
        type: 'rating',
        question:
          'How confident are you in using AI for reports, documents, and spreadsheets?',
        category: 'self-assessment',
      },
      {
        id: 'sq-3',
        type: 'rating',
        question:
          'How confident are you in identifying AI security risks (hallucinations, prompt injection, data leakage, deepfakes)?',
        category: 'self-assessment',
      },
      {
        id: 'sq-4',
        type: 'multiple-choice',
        question:
          'Which AI tool do you think will have the biggest impact on your daily work?',
        options: [
          'Cashman AI Portal (chat and search)',
          'Microsoft Copilot (Outlook, Word, Excel, PowerPoint)',
          'Claude Cowork (deep analysis)',
          'AI Agents (automated multi-step tasks)',
        ],
        category: 'self-assessment',
      },
      {
        id: 'sq-5',
        type: 'text',
        question:
          'Describe one specific work task where you plan to start using AI this week.',
        category: 'self-assessment',
      },
      {
        id: 'sq-6',
        type: 'rating',
        question:
          'Overall, how well has this training prepared you to use AI effectively and safely?',
        category: 'feedback',
      },
      {
        id: 'sq-7',
        type: 'text',
        question:
          'What was the most useful thing you learned in this training?',
        category: 'feedback',
      },
      {
        id: 'sq-8',
        type: 'text',
        question:
          'What topic would you like more depth on in a future training session?',
        category: 'feedback',
      },
    ],
  },
];

// ==========================================================================
// Helper Functions
// ==========================================================================

export function getExercise(id: string): Exercise | undefined {
  return EXERCISES.find((e) => e.id === id);
}

export function getGame(id: string): Game | undefined {
  return GAMES.find((g) => g.id === id);
}

export function getSurvey(id: string): Survey | undefined {
  return SURVEYS.find((s) => s.id === id);
}
