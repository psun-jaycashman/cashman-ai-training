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
