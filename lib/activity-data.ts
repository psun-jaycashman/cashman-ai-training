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
    title: 'Polish a Rough Draft',
    variant: 'paste-back',
    instructions:
      'Rewrite the rough project closeout summary from the lesson. Make it concise, well-structured, and formal. After rewriting, check for any facts AI may have added that weren\'t in the original (hallucinations). Paste your polished version below.',
    scenario:
      'The original draft is a casual, rambling closeout summary for the Port Arthur ferry landing project. Key facts: 14 months (2 months over), hurricane caused 3-week shutdown, $3.8M vs $3.5M budget, overrun from hurricane and unforeseen pile conditions, 15 additional piles via CO, one recordable (sprained ankle), good CPARS rating, operational since March 1.',
    evaluationRubric: {
      criteria: [
        'The rewrite is well-structured with clear sections or headings',
        'Uses formal, professional tone (not casual like the original)',
        'Is more concise than the original while retaining key facts',
        'Includes the key data points from the original (14 months, $3.8M, hurricane, 15 piles, one recordable, etc.)',
        'Does not add facts or details that were not in the original draft',
      ],
      passingScore: 3,
      systemPrompt:
        'You are evaluating a polished rewrite of a rough project closeout summary. The original was casual and disorganized. Check that the rewrite is professional and well-structured. IMPORTANT: Also check whether the trainee\'s version added any invented details (hallucinations) not present in the original -- this was specifically called out in the lesson.',
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
