// Analytics utility for Luna
// Tracks user interactions and conversation metrics

export interface LunaAnalyticsEvent {
  event: string;
  properties?: Record<string, unknown>;
  timestamp: number;
}

export interface LunaSessionMetrics {
  sessionId: string;
  startTime: number;
  endTime?: number;
  privacyMode: 'on-the-record' | 'confidential';
  interactionMode: 'voice' | 'text';
  messagesExchanged: number;
  clarifyQuestionsAsked: number;
  planGenerated: boolean;
  /**
   * High-level, PII-light summary of the session outcome.
   * Only populated for on-the-record sessions and sent to the backend,
   * not forwarded to third-party analytics.
   */
  planSummary?: string;
  pdfDownloaded: boolean;
  summaryRead: boolean;
  completionRate: number;
  userDemographics?: {
    projectType?: string;
    industry?: string;
    budget?: string;
    timeline?: string;
  };
}

class LunaAnalytics {
  private events: LunaAnalyticsEvent[] = [];
  private sessionMetrics: LunaSessionMetrics | null = null;
  private isEnabled: boolean = true;

  constructor() {
    // Check if analytics should be disabled (e.g., confidential mode)
    this.isEnabled = typeof window !== 'undefined';
  }

  // Start tracking a new session
  startSession(sessionId: string, privacyMode: 'on-the-record' | 'confidential') {
    this.sessionMetrics = {
      sessionId,
      startTime: Date.now(),
      privacyMode,
      interactionMode: 'voice',
      messagesExchanged: 0,
      clarifyQuestionsAsked: 0,
      planGenerated: false,
      pdfDownloaded: false,
      summaryRead: false,
      completionRate: 0,
    };

    this.track('session_started', {
      sessionId,
      privacyMode,
      timestamp: new Date().toISOString(),
    });

    // Disable tracking for confidential sessions
    if (privacyMode === 'confidential') {
      this.isEnabled = false;
    }
  }

  // End the current session
  endSession() {
    if (!this.sessionMetrics) return;

    this.sessionMetrics.endTime = Date.now();
    const duration = this.sessionMetrics.endTime - this.sessionMetrics.startTime;

    // Calculate completion rate
    let completionScore = 0;
    if (this.sessionMetrics.messagesExchanged > 0) completionScore += 20;
    if (this.sessionMetrics.clarifyQuestionsAsked >= 2) completionScore += 30;
    if (this.sessionMetrics.planGenerated) completionScore += 30;
    if (this.sessionMetrics.pdfDownloaded || this.sessionMetrics.summaryRead) completionScore += 20;
    this.sessionMetrics.completionRate = completionScore;

    this.track('session_ended', {
      sessionId: this.sessionMetrics.sessionId,
      duration,
      completionRate: this.sessionMetrics.completionRate,
      metrics: this.sessionMetrics,
    });

    // Send to analytics backend if on-the-record
    if (this.sessionMetrics.privacyMode === 'on-the-record') {
      this.sendToBackend();
    }

    // Reset
    this.sessionMetrics = null;
    this.isEnabled = true;
  }

  // Track a specific event
  track(event: string, properties?: Record<string, unknown>) {
    if (!this.isEnabled) return;

    const analyticsEvent: LunaAnalyticsEvent = {
      event,
      properties,
      timestamp: Date.now(),
    };

    this.events.push(analyticsEvent);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Luna Analytics]', event, properties);
    }

    // Send to external analytics (Google Analytics, Mixpanel, etc.)
    this.sendToExternalAnalytics(analyticsEvent);
  }

  // Update session metrics
  updateMetrics(updates: Partial<LunaSessionMetrics>) {
    if (!this.sessionMetrics) return;

    Object.assign(this.sessionMetrics, updates);
  }

  // Track message exchange
  trackMessage(role: 'user' | 'luna', content: string) {
    if (!this.sessionMetrics) return;

    this.sessionMetrics.messagesExchanged++;

    this.track('message_sent', {
      role,
      contentLength: content.length,
      messageCount: this.sessionMetrics.messagesExchanged,
    });
  }

  // Track mode change
  trackModeChange(mode: 'voice' | 'text') {
    if (!this.sessionMetrics) return;

    this.sessionMetrics.interactionMode = mode;

    this.track('mode_changed', { mode });
  }

  // Track clarify phase
  trackClarifyPhase(questionsAsked: number) {
    if (!this.sessionMetrics) return;

    this.sessionMetrics.clarifyQuestionsAsked = questionsAsked;

    this.track('clarify_phase_completed', {
      questionsAsked,
    });
  }

  // Track plan generation
  trackPlanGenerated(plan: {
    summary: string;
    nextStepsCount: number;
    estimatedScope: string;
    tags: string[];
  }) {
    if (!this.sessionMetrics) return;

    this.sessionMetrics.planGenerated = true;
     // Store the summary only in session metrics so it can be persisted
     // for on-the-record sessions; avoid sending it to external analytics.
     this.sessionMetrics.planSummary = plan.summary;

    this.track('plan_generated', {
      nextStepsCount: plan.nextStepsCount,
      estimatedScope: plan.estimatedScope,
      tags: plan.tags,
    });
  }

  // Track PDF download
  trackPDFDownload() {
    if (!this.sessionMetrics) return;

    this.sessionMetrics.pdfDownloaded = true;

    this.track('pdf_downloaded');
  }

  // Track summary read
  trackSummaryRead() {
    if (!this.sessionMetrics) return;

    this.sessionMetrics.summaryRead = true;

    this.track('summary_read');
  }

  // Track errors
  trackError(error: string, context?: Record<string, unknown>) {
    this.track('error_occurred', {
      error,
      ...context,
    });
  }

  // Send events to backend
  private async sendToBackend() {
    if (!this.sessionMetrics) return;

    try {
      await fetch('/api/luna/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionMetrics: this.sessionMetrics,
          events: this.events,
        }),
      });
    } catch (error) {
      console.error('Failed to send analytics:', error);
    }

    // Clear events after sending
    this.events = [];
  }

  // Send to external analytics providers
  private sendToExternalAnalytics(event: LunaAnalyticsEvent) {
    if (typeof window === 'undefined') return;
    
    // Google Analytics 4
    const gtag = (window as { gtag?: (...args: unknown[]) => void }).gtag;
    if (gtag) {
      gtag('event', event.event, event.properties);
    }

    // Mixpanel
    const mixpanel = (window as { mixpanel?: { track: (event: string, properties?: unknown) => void } }).mixpanel;
    if (mixpanel) {
      mixpanel.track(event.event, event.properties);
    }

    // Custom analytics
    const customAnalytics = (window as { lunaAnalytics?: { track: (event: string, properties?: unknown) => void } }).lunaAnalytics;
    if (customAnalytics) {
      customAnalytics.track(event.event, event.properties);
    }
  }

  // Get current session metrics
  getMetrics(): LunaSessionMetrics | null {
    return this.sessionMetrics;
  }

  // Get all events
  getEvents(): LunaAnalyticsEvent[] {
    return this.events;
  }
}

// Export singleton instance
export const lunaAnalytics = new LunaAnalytics();
