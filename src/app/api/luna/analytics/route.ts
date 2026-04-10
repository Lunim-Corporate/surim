import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionMetrics, events } = body;

    if (!sessionMetrics) {
      return NextResponse.json(
        { error: 'Session metrics are required' },
        { status: 400 }
      );
    }

    // Only process if not confidential
    if (sessionMetrics.privacyMode === 'confidential') {
      return NextResponse.json({ success: true, stored: false });
    }

    // Log analytics data
    console.log('[Luna Analytics]', {
      sessionId: sessionMetrics.sessionId,
      completionRate: sessionMetrics.completionRate,
      messagesExchanged: sessionMetrics.messagesExchanged,
      planGenerated: sessionMetrics.planGenerated,
      duration: sessionMetrics.endTime ? sessionMetrics.endTime - sessionMetrics.startTime : 0,
    });

    // In production, you would:
    // 1. Save to database (Supabase, PostgreSQL, MongoDB, etc.)
    // 2. Send to analytics service (Mixpanel, Amplitude, etc.)
    // 3. Integrate with CRM for lead tracking

    const supabaseUrl =
      process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey =
      process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('[Luna Analytics] Supabase not configured, skipping persistence.');
      return NextResponse.json({
        success: true,
        stored: false,
        sessionId: sessionMetrics.sessionId,
        reason: 'supabase_not_configured',
      });
    }

    // Persist on-the-record session metrics + summary to Supabase
    try {
      const supabase = supabaseServer();

      const { error } = await supabase
        .from('luna_sessions')
        .insert({
          session_id: sessionMetrics.sessionId,
          privacy_mode: sessionMetrics.privacyMode,
          interaction_mode: sessionMetrics.interactionMode,
          messages_exchanged: sessionMetrics.messagesExchanged,
          clarify_questions_asked: sessionMetrics.clarifyQuestionsAsked,
          plan_generated: sessionMetrics.planGenerated,
          pdf_downloaded: sessionMetrics.pdfDownloaded,
          summary_read: sessionMetrics.summaryRead,
          completion_rate: sessionMetrics.completionRate,
          user_demographics: sessionMetrics.userDemographics ?? null,
          // High-level plan summary for CRM/DB, only for on-the-record sessions
          plan_summary: sessionMetrics.planSummary ?? null,
          events: events ?? [],
          created_at: new Date(sessionMetrics.startTime).toISOString(),
          ended_at: sessionMetrics.endTime
            ? new Date(sessionMetrics.endTime).toISOString()
            : null,
        })
        .single();

      if (error) {
        console.error(new Error(error.message));
        console.error('[Luna Analytics] Failed to persist session:', error);
        return NextResponse.json(
          {
            success: false,
            stored: false,
            sessionId: sessionMetrics.sessionId,
            error: error.message,
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        stored: true,
        sessionId: sessionMetrics.sessionId,
      });
    } catch (error) {
      console.error(error);
      console.error('[Luna Analytics] Unexpected persistence error:', error);
      return NextResponse.json(
        {
          success: false,
          stored: false,
          sessionId: sessionMetrics.sessionId,
          error: 'Failed to persist Luna session',
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error(error);
    console.error('Error in analytics endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
