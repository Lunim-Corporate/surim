import { NextRequest, NextResponse } from 'next/server';
import { callLLM, generatePlanPrompt } from '@/components/Luna/utils/llm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversation, privacyMode } = body;

    if (!conversation || !Array.isArray(conversation)) {
      return NextResponse.json(
        { error: 'Conversation history is required' },
        { status: 400 }
      );
    }

    // Generate prompt for LLM
    const messages = generatePlanPrompt(conversation);

    // Call LLM (with fallback to mock if no API key)
    const llmResponse = await callLLM(messages, {
      temperature: 0.7,
      maxTokens: 800,
    });

    // Parse JSON response
    let planResponse;
    try {
      // Try to extract JSON from response
      const jsonMatch = llmResponse.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        planResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch {
      // Fallback to structured response
      planResponse = {
        summary: "Based on our conversation, you're looking to create or improve a digital experience that meaningfully supports your goals. Surim Studio specializes in turning these kinds of ideas into concrete roadmaps and launches. The next step is to shape this into a focused plan together.",
        keyInsights: [
          "Your project will benefit from a clear focus on user experience and measurable outcomes.",
          "Agreeing a realistic timeline and scope up front will de-risk delivery.",
          "You will get more value by aligning the work to your broader business strategy, not just a list of features."
        ],
        nextSteps: [
          {
            title: "Book a Taster Session",
            description: "Schedule a free 30-minute consultation to walk through your context, refine the scope, and decide together on the right level of investment.",
            action: "calendly"
          },
          {
            title: "Review Our Portfolio",
            description: "Explore similar projects we've delivered to see how we approach strategy, design, and implementation across different industries.",
            action: "portfolio"
          },
          {
            title: "Get a Custom Proposal",
            description: "Receive a detailed proposal tailored to your specific needs, including phasing, investment ranges, and key milestones.",
            action: "proposal"
          }
        ],
        estimatedScope: "2-4 months",
        calendlyPurpose: "Discuss your project in detail, test whether we are a good fit, and co-create a clear next step.",
        tags: ["web-development", "ux-design", "custom-solutions"]
      };
    }

    return NextResponse.json({
      success: true,
      data: planResponse,
      privacyMode,
      tokensUsed: llmResponse.tokensUsed,
    });

  } catch (error) {
    console.error(error);
    console.error('Error in plan endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
