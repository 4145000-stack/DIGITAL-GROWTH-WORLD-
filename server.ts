import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Fallback intelligent agent responses tailored to each agent role if API key is not configured
const FALLBACK_RESPONSES: Record<
  string,
  (msg: string, context?: any) => { reply: string; animation: 'talk' | 'work' | 'happy' | 'think'; suggestedAction?: string; createdTask?: any }
> = {
  nova: (msg) => {
    const lower = msg.toLowerCase();
    if (lower.includes('audit') || lower.includes('readiness') || lower.includes('score')) {
      return {
        reply: `**Digital Growth Readiness Diagnostic (Strategy Office)**\n\n1. **Core Architecture & Automation**: 78/100 (Solid baseline, needs unified telemetry)\n2. **Go-to-Market Vector Velocity**: 84/100 (Strong inbound interest, organic referral loops accelerating)\n3. **Operational Leverage**: 69/100 (Manual task bottlenecks slowing cross-team handoffs)\n\n**Strategic Recommendation**: Prioritize operational automation first to protect engineering focus, then scale campaign spend.`,
        animation: 'think',
        suggestedAction: 'Prioritize Operational Automation',
        createdTask: {
          title: 'Conduct Q4 Strategy & Digital Readiness Audit',
          description: 'Comprehensive business model and priority diagnosis mapped by Nova.',
          category: 'Growth',
        },
      };
    }
    if (lower.includes('priority') || lower.includes('priorities') || lower.includes('roadmap')) {
      return {
        reply: `Here is our strategic priority hierarchy for maximum compounding leverage:\n\n- **Tier 1 (High Impact / Immediate)**: Streamline customer conversion funnels with Closer & Pixel.\n- **Tier 2 (High Impact / Structural)**: Automate delivery workflows with Orbit to expand capacity.\n- **Tier 3 (Optimization)**: Deep-focus sprints with Coach to protect maker hours.\n\nClarity precedes momentum. Which tier would you like to drill into?`,
        animation: 'talk',
        suggestedAction: 'Review Priority Matrix',
      };
    }
    return {
      reply: `From a strategic perspective, every high-growth business succeeds by aligning three pillars: **Clear Market Positioning**, **Frictionless Distribution**, and **Operational Discipline**.\n\nWhat strategic initiative or business opportunity are we evaluating right now?`,
      animation: 'talk',
      suggestedAction: 'Analyze Opportunity',
    };
  },

  pixel: (msg) => {
    const lower = msg.toLowerCase();
    if (lower.includes('campaign') || lower.includes('viral') || lower.includes('ad')) {
      return {
        reply: `🚀 **Campaign Concept: "The Growth OS Sprint"**\n\n- **Primary Hook**: "Most teams don't have an execution problem—they have a context-switching bottleneck."\n- **Distribution Channels**: LinkedIn founder carousels + Short-form video breakdown + X/Twitter high-signal thread.\n- **Lead Magnet**: "Interactive Virtual HQ Playbook" (Free 1-click template).\n\nLet's spin up 3 visual ad variants and test copy hooks today!`,
        animation: 'work',
        suggestedAction: 'Launch Ad Copy Variants',
        createdTask: {
          title: 'Deploy Growth OS Multi-Channel Campaign',
          description: 'High-converting social hooks and lead magnet funnel designed by Pixel.',
          category: 'Growth',
        },
      };
    }
    if (lower.includes('hook') || lower.includes('headline') || lower.includes('content')) {
      return {
        reply: `Here are 3 high-converting hook angles crafted for maximum CTR:\n\n1. *"The 15-minute workflow that replaced our 2-hour daily status meetings."*\n2. *"Why high-output creators are shifting from isolated apps to collaborative virtual worlds."*\n3. *"3 hidden metrics that doubled our warm inbound conversion in 14 days."*\n\nWhich angle aligns best with our audience tone?`,
        animation: 'happy',
        suggestedAction: 'Draft Full Content Piece',
      };
    }
    return {
      reply: `Creative energy is flowing in the studio! I'm constantly analyzing high-converting campaigns, attention dynamics, and viral loops.\n\nWhether you need punchy ad copy, an organic content calendar, or lead magnets, let's make some noise!`,
      animation: 'talk',
      suggestedAction: 'Brainstorm Campaign Hooks',
    };
  },

  closer: (msg) => {
    const lower = msg.toLowerCase();
    if (lower.includes('price') || lower.includes('expensive') || lower.includes('budget') || lower.includes('objection')) {
      return {
        reply: `**Objection Reframing Protocol: Price & Budget**\n\nWhen a prospect says *"Your solution is too expensive"*, never discount immediately. Reframe cost into ROI velocity:\n\n*"I completely understand why budget allocation is top of mind for you, [Name]. Typically our partners find that the cost of inaction—losing 8+ hours a week to disconnected workflows—exceeds our investment in the first 14 days. If we could prove a 3x return in month one, would that justify moving forward?"*\n\nShall I draft a personalized follow-up script with this framing?`,
        animation: 'think',
        suggestedAction: 'Generate Follow-Up Script',
      };
    }
    if (lower.includes('follow') || lower.includes('lead') || lower.includes('pipeline')) {
      return {
        reply: `**High-Velocity Follow-Up Sequence (3 Touches)**\n\n1. **Touch 1 (+24h)**: Value-drop summarizing their exact challenge + 1 tailored tip (Zero pitch).\n2. **Touch 2 (+72h)**: Micro-case study of similar client achieving +40% speed.\n3. **Touch 3 (+5d)**: Direct decision check: *"Are we still on track to eliminate [pain point] this quarter, or should we pause for now?"*\n\nThis sequence routinely revives 38% of stalled conversations!`,
        animation: 'work',
        suggestedAction: 'Send Revive Sequence',
        createdTask: {
          title: 'Execute High-Velocity Follow-Up Sequence',
          description: 'Multi-touch outbound and inbound pipeline cadence led by Closer.',
          category: 'Growth',
        },
      };
    }
    return {
      reply: `Pipeline looking sharp! I'm tracking all our active opportunities and conversations. Remember: every prospect objection is simply an unanswered question in disguise.\n\nTell me about the deal or conversation you're working on right now!`,
      animation: 'talk',
      suggestedAction: 'Audit Deal Pipeline',
    };
  },

  orbit: (msg) => {
    const lower = msg.toLowerCase();
    if (lower.includes('task') || lower.includes('milestone') || lower.includes('plan') || lower.includes('sprint')) {
      return {
        reply: `**Operational Work Breakdown & Execution Plan**\n\n- **Milestone 1 (Days 1–3)**: Spec requirements and finalize system boundary contracts.\n- **Milestone 2 (Days 4–7)**: Core build sprint & cross-functional review.\n- **Milestone 3 (Days 8–10)**: Automated testing & telemetry validation.\n- **Milestone 4 (Days 11–14)**: Phased rollout and stakeholder debrief.\n\nI have converted this into active sprint cards with defined acceptance criteria!`,
        animation: 'work',
        suggestedAction: 'Add Sprint to Backlog',
        createdTask: {
          title: 'Execute 4-Phase Operational Milestone Plan',
          description: 'Granular work breakdown structure with timeline dependencies built by Orbit.',
          category: 'Operations',
        },
      };
    }
    return {
      reply: `Operations room is running at peak synchronization. My directive is translating high-level vision into frictionless execution.\n\nGive me any project or idea, and I'll deconstruct it into milestones, tasks, and dependency matrices on the spot.`,
      animation: 'talk',
      suggestedAction: 'Deconstruct Project',
    };
  },

  coach: (msg) => {
    const lower = msg.toLowerCase();
    if (lower.includes('focus') || lower.includes('pomodoro') || lower.includes('session') || lower.includes('start')) {
      return {
        reply: `🎉 **25-Minute Deep Focus Sprint Activated!**\n\nHere is our protocol for maximum flow state:\n1. Close distracting tabs and silence notifications.\n2. Pick **ONE** specific task to complete—no multitasking.\n3. I will sit beside you in the Focus Room and hold the space.\n\nTake one deep breath. Let's do this together!`,
        animation: 'happy',
        suggestedAction: 'Start 25-Min Sprint',
      };
    }
    if (lower.includes('overwhelm') || lower.includes('procrastinat') || lower.includes('stuck') || lower.includes('tired')) {
      return {
        reply: `I hear you. Overwhelm happens when the brain tries to solve the whole mountain all at once. Let's make it effortless:\n\n**The 2-Minute Rule**: Don't worry about finishing the task right now. Just commit to opening the document and writing the very first sentence. That's all.\n\nOnce momentum starts, motivation follows. Ready to take that micro-step?`,
        animation: 'think',
        suggestedAction: 'Commit to 2-Minute Micro-Step',
      };
    }
    return {
      reply: `Welcome to the Focus Room! As your accountability partner, I'm here to ensure your vision translates into deep, distraction-free work.\n\nWhenever you want to start a timed focus sprint or overcome a mental blocker, let me know.`,
      animation: 'talk',
      suggestedAction: 'Set Focus Goal',
    };
  },
};

interface MeetingSpeakerProfile {
  id: string;
  name: string;
  role: string;
  department: string;
}

const MEETING_AGENT_PROFILES: Record<string, MeetingSpeakerProfile> = {
  nova: { id: 'nova', name: 'NOVA', role: 'Digital Strategist', department: 'Strategy Office' },
  pixel: { id: 'pixel', name: 'PIXEL', role: 'Marketing Agent', department: 'Creative Studio' },
  closer: { id: 'closer', name: 'CLOSER', role: 'Sales Agent', department: 'Sales Office' },
  orbit: { id: 'orbit', name: 'ORBIT', role: 'Operations Agent', department: 'Operations Centre' },
  coach: { id: 'coach', name: 'COACH', role: 'Focus & Accountability Agent', department: 'Focus Centre' },
};

function generateMeetingTurnFallback(
  agenda: string,
  attendeeIds: string[],
  transcript: any[],
  userPrompt?: string,
  targetSpeakerId?: string
) {
  let chosenId = targetSpeakerId?.toLowerCase().replace(/^agent_/, '');
  if (!chosenId || !attendeeIds.includes(chosenId)) {
    if (!transcript || transcript.length === 0) {
      chosenId = attendeeIds[0] || 'nova';
    } else {
      const lastSpeaker = transcript[transcript.length - 1]?.speakerId?.toLowerCase().replace(/^agent_/, '');
      const idx = attendeeIds.indexOf(lastSpeaker);
      chosenId = attendeeIds[(idx + 1) % attendeeIds.length] || attendeeIds[0] || 'nova';
    }
  }

  const profile = MEETING_AGENT_PROFILES[chosenId] || MEETING_AGENT_PROFILES.nova;
  let reply = '';
  let animation: 'talk' | 'think' | 'work' | 'happy' = 'talk';
  let suggestedAction = '';
  let createdTask: any = null;

  switch (chosenId) {
    case 'nova':
      animation = 'think';
      reply = userPrompt
        ? `Regarding "${userPrompt}": From a strategic macro-view, our priority must be aligning market readiness with our highest-leverage distribution engine. If we spread resources across too many experiments, velocity drops. Let's establish our single North Star metric for "${agenda}" before committing sprint capacity.`
        : `Let's frame our strategic thesis for **${agenda}**. Looking at our business readiness diagnostics, the highest leverage move is to double down on our core differentiator while removing delivery friction. I recommend Pixel and Closer synchronize messaging so customer expectations match our operational reality.`;
      suggestedAction = 'Align North Star Metric';
      createdTask = {
        title: `Strategic Alignment: ${agenda.slice(0, 30)}`,
        description: 'Establish unit economics and North Star success metrics from Strategy Office.',
        category: 'Growth',
      };
      break;

    case 'pixel':
      animation = 'work';
      reply = userPrompt
        ? `Creative perspective on "${userPrompt}": We can package this into an irresistible content angle. Inbound attention is driven by contrarian insights and high-utility toolkits. Let's spin up 3 interactive hooks for LinkedIn, X, and short-form video to test message-market fit within 48 hours!`
        : `Building on Nova's strategic framework for **${agenda}**: In the Creative Studio, we're ready to deploy a multi-channel campaign sprint. We will launch an educational carousel, a behind-the-scenes build thread, and a free interactive assessment tool to capture top-of-funnel email leads.`;
      suggestedAction = 'Launch Content Sprint';
      createdTask = {
        title: `Campaign Kit: ${agenda.slice(0, 30)}`,
        description: 'Design 3 high-converting visual ad variants and educational carousel in Creative Studio.',
        category: 'Design',
      };
      break;

    case 'closer':
      animation = 'talk';
      reply = userPrompt
        ? `Sales reality on "${userPrompt}": When prospects ask about this, it usually signals an underlying hesitation around implementation risk or ROI timeline. If we arm our team with an upfront ROI calculator and a 14-day proof-of-value guarantee, close rates will spike by at least 30%.`
        : `From the Sales Office: Pixel's inbound leads will convert much faster if we pre-empt the top 3 buying objections before the discovery call. I propose standardizing our value-matrix presentation and automating warm email touchpoints at day 2 and day 5 post-demo.`;
      suggestedAction = 'Standardize Discovery Cadence';
      createdTask = {
        title: `Objection Playbook: ${agenda.slice(0, 30)}`,
        description: 'Draft discovery scripts and objection handling matrix in Sales Office.',
        category: 'Growth',
      };
      break;

    case 'orbit':
      animation = 'work';
      reply = userPrompt
        ? `Operations workflow for "${userPrompt}": Great concept, but ideas without milestones create chaos. I am mapping this directly into our operations backlog with strict dependency tags, estimated story points, and 2-week sprint releases so nobody gets blocked.`
        : `From the Operations Centre: I've synthesized Nova's strategic goals and Closer's pipeline needs into concrete execution milestones. We need 3 clear swimlanes: Infrastructure Readiness, Campaign Deployment, and Sales Enablement. All tasks are linked with zero circular dependencies.`;
      suggestedAction = 'Map Sprint Backlog';
      createdTask = {
        title: `Sprint Workflows: ${agenda.slice(0, 30)}`,
        description: 'Configure Jira/backlog swimlanes and task dependency graphs in Operations Centre.',
        category: 'Operations',
      };
      break;

    case 'coach':
      animation = 'happy';
      reply = userPrompt
        ? `Energy & Focus check on "${userPrompt}": The team's vision is crystal clear, but execution requires protected flow state. Let's schedule two focused 25-minute Pomodoro sprints today without Slack or email interruptions. Small daily wins compound exponentially!`
        : `From the Focus Centre: High performance is sustainable only when we protect maker hours. As we roll out **${agenda}**, let's establish daily 15-minute standups and dedicated 90-minute deep-work focus blocks. We maintain clarity, eliminate burnout, and celebrate each milestone!`;
      suggestedAction = 'Begin 25m Focus Block';
      createdTask = {
        title: `Deep Work Block: ${agenda.slice(0, 30)}`,
        description: 'Structure 25-minute uninterrupted sprint with Coach accountability tracking.',
        category: 'Product',
      };
      break;
  }

  return {
    speakerId: profile.id,
    speakerName: profile.name,
    speakerRole: profile.role,
    department: profile.department,
    reply,
    animation,
    suggestedAction,
    createdTask,
  };
}

function generateMeetingSummaryFallback(agenda: string, transcript: any[]) {
  return {
    success: true,
    summary: `Executive multi-agent strategic alignment session completed for "${agenda}". The team reviewed core market vectors, synchronized inbound marketing with sales qualification cadences, and established clear operational sprint milestones with protected deep-work blocks.`,
    keyTakeaways: [
      { agent: 'NOVA', takeaway: 'Identified core leverage points and prioritized North Star unit economics.' },
      { agent: 'PIXEL', takeaway: 'Prepared 3 multi-channel viral content hooks and lead capture magnets.' },
      { agent: 'CLOSER', takeaway: 'Reframed primary pricing objections and shortened discovery-to-close pipeline.' },
      { agent: 'ORBIT', takeaway: 'Deconstructed initiatives into a 2-week milestone backlog with clean dependencies.' },
      { agent: 'COACH', takeaway: 'Instituted 25-minute deep-work sprints to protect execution focus and team morale.' },
    ],
    actionItems: [
      {
        title: `Execute Sprint Backlog: ${agenda.slice(0, 24)}`,
        description: 'Carry out assigned tasks across Strategy, Creative, Sales, and Operations departments.',
        category: 'Operations',
        priority: 'high',
        xpReward: 250,
      },
      {
        title: 'Review Conversion Analytics',
        description: 'Measure pipeline velocity and campaign engagement weekly in Business HQ.',
        category: 'Growth',
        priority: 'medium',
        xpReward: 150,
      },
    ],
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      hasGeminiApiKey: !!process.env.GEMINI_API_KEY,
      timestamp: Date.now(),
    });
  });

  // Agent Chat endpoint with Gemini integration
  app.post('/api/chat', async (req, res) => {
    try {
      const {
        agentId,
        message,
        conversationHistory = [],
        systemInstructions = '',
        role = '',
        specialty = '',
        personality = '',
        capabilities = [],
        tools = [],
      } = req.body;

      const normalizedAgentId = (agentId || 'nova')
        .toLowerCase()
        .replace(/^agent_/, '');

      const ai = getAIClient();

      if (!ai) {
        // Fallback intelligent simulation matching exact agent role and system instructions
        const fallbackFn =
          FALLBACK_RESPONSES[normalizedAgentId] || FALLBACK_RESPONSES.nova;
        const result = fallbackFn(message, { role, specialty });
        return res.json({
          success: true,
          modelUsed: 'mock-agent-intelligence',
          ...result,
        });
      }

      // Build context and instruction
      const fullSystemPrompt = `${systemInstructions}

You are speaking with the user inside DIGITAL GROWTH WORLD™, a virtual workplace simulation.
Your role: ${role}
Your specialty: ${specialty}
Your personality: ${personality}
Your capabilities: ${Array.isArray(capabilities) ? capabilities.join(', ') : ''}

CRITICAL RESPONSE FORMAT:
Respond with a JSON object matching this schema:
{
  "reply": "Your in-character, high-quality, actionable response. Use bolding and markdown formatting for readability. Stay true to your role and personality.",
  "animation": "think" | "work" | "talk" | "happy" | "idle",
  "suggestedAction": "A short 2-4 word follow-up action pill the user can click, or null",
  "createdTask": null or { "title": "Task title", "description": "Brief description", "category": "Growth" | "Engineering" | "Design" | "Product" | "Operations" }
}

Guidelines for "animation":
- "think": when analyzing complex information, diagnosing strategy, pondering frameworks, or evaluating tradeoffs.
- "work": when creating plans, writing copy, managing pipelines, generating task tickets, or executing tasks.
- "talk": for conversational explanations, advice, guidance, or direct answers.
- "happy": when celebrating milestones, high wins, completed sprints, or sharing exciting breakthroughs.
- "idle": when inactive or resting.

Output ONLY valid JSON.`;

      // Format conversation turns for Gemini
      const formattedContents: any[] = [];

      if (Array.isArray(conversationHistory)) {
        for (const msg of conversationHistory.slice(-10)) {
          if (!msg.text) continue;
          formattedContents.push({
            role: msg.role === 'user' || msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }],
          });
        }
      }

      // Add current message
      formattedContents.push({
        role: 'user',
        parts: [{ text: message }],
      });

      // Try primary model with fallback alternatives
      const modelCandidates = [
        'gemini-3.8-flash',
        'gemini-flash-latest',
        'gemini-3.1-flash-lite',
      ];

      let responseText = '';
      let functionCalls: any = null;
      let lastError: any = null;
      let successfulModel = '';

      const apiTools = Array.isArray(tools) && tools.length > 0 
        ? [{ functionDeclarations: tools }] 
        : undefined;

      for (const modelName of modelCandidates) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: formattedContents,
            config: {
              systemInstruction: fullSystemPrompt,
              temperature: 0.7,
              responseMimeType: 'application/json',
              tools: apiTools,
            },
          });
          
          if (response.functionCalls && response.functionCalls.length > 0) {
             functionCalls = response.functionCalls;
             successfulModel = modelName;
             break;
          }

          if (response.text) {
            responseText = response.text;
            successfulModel = modelName;
            break;
          }
        } catch (err: any) {
          lastError = err;
          // Continue to next model candidate
        }
      }

      if (!responseText && !functionCalls && lastError) {
        throw lastError;
      }

      // If the model invoked a tool
      if (functionCalls && functionCalls.length > 0) {
        const fc = functionCalls[0];
        return res.json({
          success: true,
          modelUsed: successfulModel,
          toolCall: {
            name: fc.name,
            args: fc.args,
          },
          animation: 'work',
        });
      }

      let parsed: any = null;

      try {
        parsed = JSON.parse(responseText);
      } catch {
        // Extract JSON if wrapped in markdown code blocks
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            parsed = JSON.parse(jsonMatch[0]);
          } catch {
            parsed = null;
          }
        }
      }

      if (parsed && typeof parsed.reply === 'string') {
        const validAnimations = ['think', 'work', 'talk', 'happy', 'idle'];
        const anim = validAnimations.includes(parsed.animation)
          ? parsed.animation
          : 'talk';

        return res.json({
          success: true,
          modelUsed: 'gemini-flash-latest',
          reply: parsed.reply,
          animation: anim,
          suggestedAction: parsed.suggestedAction || undefined,
          createdTask: parsed.createdTask || undefined,
        });
      }

      // If parsing failed, return text directly with animated state
      return res.json({
        success: true,
        modelUsed: 'gemini-flash-latest',
        reply: responseText.trim(),
        animation: 'talk',
      });
    } catch (error: any) {
      console.error('Error handling agent chat request:', error);
      const normalizedAgentId = (req.body.agentId || 'nova')
        .toLowerCase()
        .replace(/^agent_/, '');
      const fallbackFn =
        FALLBACK_RESPONSES[normalizedAgentId] || FALLBACK_RESPONSES.nova;
      const result = fallbackFn(req.body.message || '', req.body);

      return res.json({
        success: true,
        modelUsed: 'fallback-after-error',
        errorNotice: error?.message || 'Upstream API error',
        ...result,
      });
    }
  });

  // 3. Multi-Agent Meeting Turn endpoint
  app.post('/api/meeting/turn', async (req, res) => {
    try {
      const {
        agenda = 'Strategic Growth & Operational Alignment',
        attendeeIds = ['nova', 'pixel', 'closer', 'orbit', 'coach'],
        transcript = [],
        userPrompt,
        targetSpeakerId,
      } = req.body;

      const ai = getAIClient();

      const cleanAttendeeIds = (
        Array.isArray(attendeeIds)
          ? attendeeIds
          : ['nova', 'pixel', 'closer', 'orbit', 'coach']
      ).map((id: string) => id.toLowerCase().replace(/^agent_/, ''));

      if (!ai) {
        const turn = generateMeetingTurnFallback(
          agenda,
          cleanAttendeeIds,
          transcript,
          userPrompt,
          targetSpeakerId
        );
        return res.json({
          success: true,
          modelUsed: 'offline-multi-agent-simulator',
          ...turn,
        });
      }

      const meetingSystemPrompt = `You are orchestrating a real-time executive strategy meeting in DIGITAL GROWTH WORLD™.
Meeting Agenda: "${agenda}"
Invited Agent Attendees:
- NOVA (Digital Strategist): Strategic audit, business readiness, market priorities, positioning.
- PIXEL (Marketing Agent): Content hooks, viral distribution, lead generation campaigns, multi-channel funnels.
- CLOSER (Sales Agent): Pipeline momentum, objection handling, high-converting discovery, closing contracts.
- ORBIT (Operations Agent): Milestone breakdown, sprint workflows, backlog tickets, execution dependencies.
- COACH (Focus & Accountability Agent): Flow state, 25m sprint blocks, goal accountability, anti-burnout pacing.

Current Transcript of Meeting:
${(Array.isArray(transcript) ? transcript : []).map((t: any) => `${t.speakerName} (${t.speakerRole}): ${t.text}`).join('\n') || '(Meeting has just convened)'}

${userPrompt ? `A Human Founder in the room just interjected: "${userPrompt}"` : 'Continue the collaborative discussion.'}
${targetSpeakerId ? `Specifically prompt ${targetSpeakerId.toUpperCase()} to speak.` : 'Select the most appropriate agent among the invited attendees to speak next.'}

Rules:
1. Speak strictly in character as the chosen agent.
2. Advance the discussion with concrete tactical depth—do NOT use generic platitudes.
3. Build upon what the previous speakers said, referencing their points directly.
4. Output MUST be strictly valid JSON matching this schema:
{
  "speakerId": "nova" | "pixel" | "closer" | "orbit" | "coach",
  "speakerName": "NOVA" | "PIXEL" | "CLOSER" | "ORBIT" | "COACH",
  "speakerRole": "Digital Strategist" | "Marketing Agent" | "Sales Agent" | "Operations Agent" | "Focus Agent",
  "department": "Strategy Office" | "Creative Studio" | "Sales Office" | "Operations Centre" | "Focus Centre",
  "reply": "Speech text (2-4 punchy, high-signal paragraphs with bullet points)",
  "animation": "talk" | "think" | "work" | "happy",
  "suggestedAction": "Optional next discussion topic",
  "createdTask": null or {
    "title": "Actionable task name",
    "description": "Concrete task details",
    "category": "Growth" | "Engineering" | "Design" | "Product" | "Operations"
  }
}`;

      const modelCandidates = [
        'gemini-3.8-flash',
        'gemini-flash-latest',
        'gemini-3.1-flash-lite',
      ];
      let responseText = '';
      let lastErr: any = null;

      for (const modelName of modelCandidates) {
        try {
          const resp = await ai.models.generateContent({
            model: modelName,
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: `Generate the next speaking turn for the meeting. Agenda: ${agenda}`,
                  },
                ],
              },
            ],
            config: {
              systemInstruction: meetingSystemPrompt,
              temperature: 0.7,
              responseMimeType: 'application/json',
            },
          });
          if (resp.text) {
            responseText = resp.text;
            break;
          }
        } catch (e: any) {
          lastErr = e;
        }
      }

      if (!responseText) {
        throw lastErr || new Error('No response from Gemini models');
      }

      let parsed: any = null;
      try {
        parsed = JSON.parse(responseText);
      } catch {
        const match = responseText.match(/\{[\s\S]*\}/);
        if (match) parsed = JSON.parse(match[0]);
      }

      if (parsed && parsed.reply) {
        return res.json({
          success: true,
          modelUsed: 'gemini-3.8-flash',
          speakerId: parsed.speakerId?.toLowerCase() || cleanAttendeeIds[0],
          speakerName: parsed.speakerName || 'NOVA',
          speakerRole: parsed.speakerRole || 'Digital Strategist',
          department: parsed.department || 'Meeting Room',
          reply: parsed.reply,
          animation: parsed.animation || 'talk',
          suggestedAction: parsed.suggestedAction,
          createdTask: parsed.createdTask,
        });
      }

      throw new Error('Could not parse structured meeting turn');
    } catch (error: any) {
      console.error('Meeting turn error, falling back to simulator:', error);
      const cleanAttendeeIds = (
        Array.isArray(req.body.attendeeIds)
          ? req.body.attendeeIds
          : ['nova', 'pixel', 'closer', 'orbit', 'coach']
      ).map((id: string) => id.toLowerCase().replace(/^agent_/, ''));
      const fallback = generateMeetingTurnFallback(
        req.body.agenda,
        cleanAttendeeIds,
        req.body.transcript,
        req.body.userPrompt,
        req.body.targetSpeakerId
      );
      return res.json({
        success: true,
        modelUsed: 'fallback-after-error',
        ...fallback,
      });
    }
  });

  // 4. Meeting Summary endpoint
  app.post('/api/meeting/summary', async (req, res) => {
    try {
      const {
        agenda = 'General Meeting',
        transcript = [],
        attendeeIds = [],
      } = req.body;
      const ai = getAIClient();

      const fallback = {
        success: true,
        decision: "Proceed with the default execution plan.",
        actionItems: [
          { title: "Review plan", description: "Review default plan", responsibleAgent: "orbit", priority: "high", category: "Operations" }
        ],
        nextSteps: "Begin execution immediately."
      };

      if (!ai || !Array.isArray(transcript) || transcript.length === 0) {
        return res.json(fallback);
      }

      const summaryPrompt = `Summarize this executive meeting in DIGITAL GROWTH WORLD™.
Agenda: "${agenda}"
Transcript:
${transcript.map((t: any) => `${t.speakerName}: ${t.text}`).join('\n')}

Generate a JSON executive summary in this format EXACTLY:
{
  "decision": "Clear statement of the final strategic decision made.",
  "actionItems": [
    { 
      "title": "Task title", 
      "description": "Concrete task details", 
      "responsibleAgent": "nova | pixel | closer | orbit | coach",
      "priority": "high | medium | low",
      "category": "Growth"
    }
  ],
  "nextSteps": "What happens immediately next"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [{ role: 'user', parts: [{ text: summaryPrompt }] }],
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text);
        return res.json({ success: true, ...parsed });
      }

      return res.json(fallback);
    } catch (e) {
      return res.json({
        success: true,
        decision: "Proceed with the default execution plan.",
        actionItems: [],
        nextSteps: "Begin execution immediately."
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
