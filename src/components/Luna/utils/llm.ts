// LLM Integration for Luna
// Supports OpenAI and Anthropic with fallback to mock

interface LLMMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface LLMResponse {
  content: string;
  tokensUsed?: number;
}

export async function callLLM(
  messages: LLMMessage[],
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }
): Promise<LLMResponse> {
  const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  
  // If no API key, use mock response
  if (!apiKey) {
    console.warn('No LLM API key found, using mock response');
    return mockLLMResponse(messages);
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: options?.model || 'gpt-4o-mini',
        messages,
        temperature: options?.temperature || 0.7,
        max_tokens: options?.maxTokens || 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      tokensUsed: data.usage?.total_tokens,
    };
  } catch (error) {
    console.error('LLM API error, falling back to mock:', error);
    return mockLLMResponse(messages);
  }
}

function mockLLMResponse(messages: LLMMessage[]): LLMResponse {
  const lastMessage = messages[messages.length - 1];
  const userContent = lastMessage.content.toLowerCase();

  // Generate contextual mock response
  let response = '';
  
  if (messages.length === 1 || !messages.some(m => m.content.includes('clarifying'))) {
    // First interaction - provide understanding
    response = `I understand you're interested in ${
      userContent.includes('website') ? 'website development' :
      userContent.includes('app') ? 'mobile app development' :
      userContent.includes('design') ? 'design services' :
      userContent.includes('marketing') ? 'digital marketing' :
      'digital solutions'
    }. This is an exciting project!`;
  } else {
    // Subsequent interactions - acknowledge input
    response = `Thank you for that information. ${
      userContent.includes('budget') || userContent.includes('timeline') ?
      'Understanding your budget and timeline helps us create the perfect solution.' :
      userContent.includes('goal') || userContent.includes('want') ?
      'Your goals are clear, and we can definitely help you achieve them.' :
      'I appreciate you sharing that detail.'
    }`;
  }

  return { content: response };
}

export function generateClarifyPrompt(
  conversation: Array<{ role: string; content: string }>,
  metadata?: Record<string, unknown>
): LLMMessage[] {
  const conversationText = conversation
    .map((msg, index) => `${index + 1}. ${msg.role.toUpperCase()}: ${msg.content}`)
    .join('\n');
  const metaText = metadata ? JSON.stringify(metadata, null, 2) : '{}';

  return [
    {
      role: 'system',
      content: `You are Luna, a helpful AI assistant for Surim Studio, a digital agency. 
Review the conversation so far, ensure you deeply understand the project, and decide whether to ask another clarifying question or move forward to a plan.

Format your response EXACTLY as JSON:
{
  "understanding": "Brief statement (1–2 sentences) summarizing what they need and any key details they've already provided.",
  "questionIntro": "Friendly, on-brand sentence Luna would say before the next question (e.g., 'Got it. One more thing:')",
  "questions": ["Question 1", "Question 2"],
  "decision": {
    "readinessScore": 0-1,
    "clarityScore": 0-1,
    "confidence": 0-1,
    "recommendedAction": "ask_more" | "generate_plan" | "handoff",
    "shouldNudgeHuman": boolean,
    "nudgeMessage": "Short sentence nudging them to speak to Surim if applicable, otherwise empty string.",
    "suggestedFollowUpAngle": "If recommendedAction is ask_more, describe the most valuable topic to clarify (e.g., 'launch timeline'). Otherwise empty string.",
    "rationale": "1-2 sentences explaining your call referencing what the user actually said."
  }
}

Guidelines:
- Ask at most 2 clarifying questions, and only when recommendedAction is "ask_more".
- Questions should be specific, contextual, and avoid repeating information the user already gave.
- Skip target-audience questions unless the audience truly matters and hasn't been clearly described.
- If the user sounds uncertain or overwhelmed, lean toward "handoff" with a warm nudge to talk to Surim.
- If there is already enough information for a plan, set recommendedAction to "generate_plan".
- Never invent details or ask boilerplate questions.

Be warm, human, and concise.`,
    },
    {
      role: 'user',
      content: `Conversation so far:
${conversationText || 'No conversation yet.'}

Metadata:
${metaText}`,
    },
  ];
}

export function generatePlanPrompt(conversation: Array<{ role: string; content: string }>): LLMMessage[] {
  const conversationText = conversation
    .map(msg => `${msg.role}: ${msg.content}`)
    .join('\n');

  return [
    {
      role: 'system',
      content: `You are Luna, a helpful AI assistant for Surim Studio. Based on the conversation, generate a personalized action plan.

Format your response EXACTLY as JSON:
{
  "summary": "3-4 sentence, concrete summary of their project and how Surim can help. In plain language, cover: (1) what they are trying to achieve, (2) the current situation or constraints, and (3) the shape of the solution or engagement you recommend. When the user has mentioned specific details like timeline, budget, current stage, or target audience, naturally weave those into the summary, but do not invent numbers, company names, or facts they never gave.",
  "keyInsights": [
    "Insight 1 that reflects an important detail they shared (for example, their audience, industry, or product stage)",
    "Insight 2 that can reference timeline, urgency, or launch moment if they talked about when they want to go live",
    "Insight 3 that can reference budget, constraints, or success criteria if they mentioned any"
  ],
  "nextSteps": [
    {
      "title": "Step Title",
      "description": "Detailed, practical description of what will happen and what the user gets out of it.",
      "action": "calendly|portfolio|proposal|contact"
    }
  ],
  "estimatedScope": "Time estimate (e.g., '2-4 months') or level of effort (e.g., 'small discovery sprint', 'full product engagement')",
  "calendlyPurpose": "A short, friendly explanation of what a call with Surim will cover and why it will be valuable for this user.",
  "tags": ["tag1", "tag2", "tag3"]
When you write "summary" and "keyInsights":
- If the user gave a clear timeline, you may mention it (e.g. "launch in Q4"), otherwise do not guess.
- If the user gave a budget range, you may refer to it in general terms (e.g. "a lean MVP budget"), otherwise stay neutral.
- If they described a target audience or demographics, mention it; if not, keep the language broader.
- If the user explicitly sounds uncertain or confused about what to do, gently acknowledge that and note that a Surim team member can help them gain clarity.

Never demand missing details or pressure the user to provide them; simply make the plan as concrete as their input allows. Avoid generic phrases like "digital solutions" or "we will leverage our expertise" without explaining what that actually looks like for this user.

For "nextSteps":
- Include at least 3 steps when possible.
- Make each step action-oriented and easy to understand (e.g. "Map your core user journeys", "Run a 1-week discovery sprint", "Book a 30-minute call to validate scope").
- Always include one step that nudges them to speak with Surim directly (action "calendly" or "contact"), especially if the conversation shows uncertainty, complexity, or hesitation.
- If the user still seems unsure of their goals or scope, add wording that invites them to let a Surim team member guide the decision-making.

Be encouraging, specific, and practical. The goal is that the user could read this card and clearly understand what will happen next and how Surim can help.`,
    },
    {
      role: 'user',
      content: `Based on this conversation, generate a personalized plan:\n\n${conversationText}`,
    },
  ];
}
