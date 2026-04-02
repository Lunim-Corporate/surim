import { NextRequest, NextResponse } from 'next/server';
import { callLLM, generateClarifyPrompt } from '@/components/Luna/utils/llm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversation, metadata, privacyMode } = body;

    if (!conversation || !Array.isArray(conversation) || conversation.length === 0) {
      return NextResponse.json(
        { error: 'Conversation history is required' },
        { status: 400 }
      );
    }

    const messages = generateClarifyPrompt(conversation, {
      ...metadata,
      privacyMode,
    });

    const llmResponse = await callLLM(messages, {
      temperature: 0.4,
      maxTokens: 700,
    });

    let clarifyResponse;
    try {
      const jsonMatch = llmResponse.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        clarifyResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch {
      clarifyResponse = {
        understanding: 'I understand the general outline of your project. Let me confirm a few details so we can shape a strong plan.',
        questionIntro: 'Appreciate the context. Before we move forward, may I ask:',
        questions: [
          "What's the most important outcome you want to see from this initiative?",
          'Is there a specific launch window or constraint we should be aware of?',
        ],
        decision: {
          readinessScore: 0.35,
          clarityScore: 0.35,
          confidence: 0.4,
          recommendedAction: 'ask_more',
          shouldNudgeHuman: false,
          nudgeMessage: '',
          suggestedFollowUpAngle: 'overall goals and timeline',
          rationale: 'Fallback response: continue clarifying core goals and timing before planning.',
        },
      };
    }

    return NextResponse.json({
      success: true,
      data: clarifyResponse,
      privacyMode,
      tokensUsed: llmResponse.tokensUsed,
    });
  } catch (error) {
    console.error(error);
    console.error('Error in clarify endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
