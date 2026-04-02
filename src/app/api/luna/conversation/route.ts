import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

interface ConversationMessage {
  role: 'user' | 'luna';
  content: string;
}

interface PersistConversationPayload {
  sessionId: string;
  privacyMode: 'on-the-record' | 'confidential';
  interactionMode: 'voice' | 'text';
  messages: ConversationMessage[];
  plan: {
    summary: string;
    keyInsights: string[];
    nextSteps: Array<{
      title: string;
      description: string;
      action?: string;
    }>;
    estimatedScope: string;
    calendlyPurpose: string;
    tags: string[];
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<PersistConversationPayload>;
    const { sessionId, privacyMode, interactionMode, messages, plan } = body;

    if (
      !sessionId ||
      !privacyMode ||
      !interactionMode ||
      !messages ||
      !Array.isArray(messages) ||
      !plan ||
      !plan.summary
    ) {
      return NextResponse.json(
        { error: 'Missing required conversation data.' },
        { status: 400 }
      );
    }

    if (privacyMode !== 'on-the-record') {
      return NextResponse.json({
        success: true,
        stored: false,
        reason: 'confidential_session',
      });
    }

    const supabaseUrl =
      process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey =
      process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('[Luna Conversation] Supabase not configured, skipping persistence.');
      return NextResponse.json({
        success: true,
        stored: false,
        sessionId,
        reason: 'supabase_not_configured',
      });
    }

    let supabase;
    try {
      supabase = supabaseServer();
    } catch (error) {
      console.error(error);
      console.error('[Luna Conversation] Failed to init Supabase client:', error);
      return NextResponse.json({
        success: true,
        stored: false,
        sessionId,
        reason: 'supabase_client_error',
      });
    }
    const { error } = await supabase
      .from('luna_conversations')
      .insert({
        session_id: sessionId,
        privacy_mode: privacyMode,
        interaction_mode: interactionMode,
        messages,
        plan_summary: plan.summary,
        plan_details: plan,
      })
      .single();

    if (error) {
      console.error(new Error(error.message));
      console.error('[Luna Conversation] Failed to persist conversation:', error);
      return NextResponse.json(
        {
          success: false,
          stored: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      stored: true,
      sessionId,
    });
  } catch (error) {
    console.error(error);
    console.error('[Luna Conversation] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
