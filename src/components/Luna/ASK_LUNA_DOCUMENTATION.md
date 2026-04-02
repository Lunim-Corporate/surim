# 🤖 Ask Luna - Comprehensive Documentation

**Version**: 1.0.0  
**Last Updated**: 2025-11-03  
**Status**: Production Ready ✅

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Component Structure](#component-structure)
5. [User Experience Flow](#user-experience-flow)
6. [Technical Implementation](#technical-implementation)
7. [Branding & Design](#branding--design)
8. [API Integration](#api-integration)
9. [Speech Synthesis](#speech-synthesis)
10. [Analytics & Tracking](#analytics--tracking)
11. [Deployment Guide](#deployment-guide)
12. [Troubleshooting](#troubleshooting)

---

## Overview

**Ask Luna** is Lunim's AI-powered assistant that helps users discover the perfect next steps for their digital transformation projects. Luna provides a conversational, voice-first experience accessible directly from the navigation bar.

### Key Capabilities
- 🎙️ **Voice-First Interaction**: Natural conversation using speech recognition and synthesis
- 💬 **Text Alternative**: Full text-based interaction mode
- 🔒 **Privacy Controls**: On-the-record or confidential session modes
- 📊 **Personalized Plans**: Tailored recommendations based on user input
- 📄 **PDF Export**: Downloadable action plans
- 🔊 **Audio Playback**: Summary read-aloud feature

---

## Features

### 1. **Navigation Integration**
- Accessible from navbar on all pages
- Glass-morphism button with white glow effect
- Desktop and mobile responsive
- No separate landing page required

### 2. **Voice & Text Modes**
- **Voice Mode** (Default): Hands-free conversation
- **Text Mode**: Traditional chat interface
- Seamless mode switching
- Auto-transcription of voice input

### 3. **Privacy Options**
- **On-the-record**: Conversation history saved
- **Confidential**: Private session, no data retention
- User choice before session starts

### 4. **Conversation Flow**
1. Initial project description
2. 2-3 clarifying questions
3. Personalized action plan with next steps
4. PDF download and audio summary

### 5. **Output Formats**
- **Visual**: Interactive plan cards with animations
- **Audio**: Text-to-speech summary playback
- **PDF**: Branded downloadable document

---

## Architecture

```
Ask Luna System Architecture
│
├── Frontend Components
│   ├── Navigation Button (src/slices/NavigationMenu/)
│   ├── Luna Portal Modal (src/components/Luna/)
│   ├── Speech Hooks (hooks/)
│   ├── UI Components (components/)
│   └── State Management (lunaReducer.ts)
│
├── Backend APIs
│   ├── /api/luna/clarify - Question generation
│   ├── /api/luna/plan - Action plan creation
│   └── /api/luna/analytics - Event tracking
│
├── Utilities
│   ├── Speech Manager (utils/speechManager.ts)
│   ├── PDF Generator (utils/pdf.ts)
│   └── Analytics Tracker (utils/analytics.ts)
│
└── Assets
    └── luna.png - Official brand image
```

---

## Component Structure

### Core Components

#### 1. **LunaPortal** (Main Container)
**File**: `src/components/Luna/LunaPortal.tsx`

```tsx
<LunaPortal isOpen={boolean} onClose={function} />
```

**Responsibilities**:
- Modal management
- State orchestration
- Speech synthesis integration
- API calls and data handling
- User input processing

**State Management**:
- Uses reducer pattern (`lunaReducer`)
- Session management
- Message history
- Conversation phase tracking

#### 2. **LunaPortrait** (Visual Avatar)
**File**: `src/components/Luna/components/LunaPortrait.tsx`

**Features**:
- Animated Luna brand image
- White glow effects
- Pulsing animations when speaking
- Listening ring indicator
- Speaking wave visualizer

#### 3. **VoiceControls** (Interaction Interface)
**File**: `src/components/Luna/components/VoiceControls.tsx`

**Controls**:
- Voice/Text mode toggle
- Privacy mode selector
- Microphone button
- Status indicators

#### 4. **LunaCaption** (Real-time Text Display)
**File**: `src/components/Luna/components/LunaCaption.tsx`

**Purpose**:
- Shows live transcription
- Displays Luna's responses
- Role-based styling (user vs Luna)

#### 5. **SpeechErrorBoundary** (Error Handling)
**File**: `src/components/Luna/components/SpeechErrorBoundary.tsx`

**Function**:
- Catches speech synthesis errors
- Provides graceful fallback
- User-friendly error messages

### Utility Modules

#### Speech Manager
**File**: `src/components/Luna/utils/speechManager.ts`

Singleton pattern for centralized speech control:
```typescript
import { speechManager } from '@/components/Luna/utils/speechManager';

// Usage
await speechManager.speak(text, {
  onStart: () => console.log('Started'),
  onEnd: () => console.log('Ended'),
  onError: (error) => console.error(error)
});

speechManager.cancel(); // Stop speech
```

#### Analytics Tracker
**File**: `src/components/Luna/utils/analytics.ts`

Track user interactions:
```typescript
import { lunaAnalytics } from '@/components/Luna/utils/analytics';

lunaAnalytics.startSession(sessionId, privacyMode);
lunaAnalytics.trackMessage(role, content);
lunaAnalytics.trackModeChange(mode);
lunaAnalytics.endSession();
```

#### PDF Generator
**File**: `src/components/Luna/utils/pdf.ts`

Generate branded PDFs:
```typescript
import { generatePlanPDF, downloadPDF } from '@/components/Luna/utils/pdf';

const blob = await generatePlanPDF(plan, privacyMode);
downloadPDF(blob);
```

---

## User Experience Flow

### Session Start
```
1. User clicks "Ask Luna" button in navbar
   ↓
2. Modal opens with Luna brand image
   ↓
3. Choose privacy preference:
   - On-the-record (white button)
   - Confidential (dark button with border)
   ↓
4. Luna greets user (voice + text)
```

### Conversation
```
5. User describes project (voice or text)
   ↓
6. Luna asks clarifying question
   ↓
7. User responds
   ↓
8. Luna asks 2nd clarifying question
   ↓
9. User responds
   ↓
10. Luna generates personalized plan
```

### Plan Delivery
```
11. Plan displayed as animated cards
    - Numbered steps
    - Title + description
    - Hover effects
    ↓
12. User actions:
    - Read Summary (audio playback)
    - Download PDF (branded document)
```

---

## Technical Implementation

### State Machine

```typescript
type LunaState = 
  | 'idle'          // No session
  | 'landing'       // Session started, awaiting input
  | 'thinking'      // Processing request
  | 'clarify'       // Asking questions
  | 'plan-ready'    // Plan generated
  | 'error';        // Error occurred
```

### Message Flow

```typescript
interface Message {
  id: string;
  role: 'user' | 'luna';
  content: string;
  timestamp: Date;
}

interface Session {
  id: string;
  privacyMode: 'on-the-record' | 'confidential';
  messages: Message[];
  clarify?: ClarifyData;
  plan?: PlanData;
  createdAt: Date;
}
```

### API Endpoints

#### POST /api/luna/clarify
**Request**:
```json
{
  "conversation": [
    { "role": "user", "content": "I want to build a mobile app" }
  ],
  "privacyMode": "on-the-record",
  "metadata": {
    "userMessageCount": 1,
    "minTurnsForPlan": 3,
    "maxTurns": 6
  }
}
```

**Response**:
```json
{
  "data": {
    "understanding": "Sounds like you're exploring a mobile experience to reach customers on iOS and Android.",
    "questions": [
      "Is there a target launch window or milestone you're aiming for?",
      "What would success look like in terms of engagement or revenue?"
    ],
    "decision": {
      "readinessScore": 0.42,
      "clarityScore": 0.38,
      "confidence": 0.55,
      "recommendedAction": "ask_more",
      "shouldNudgeHuman": false,
      "nudgeMessage": "",
      "suggestedFollowUpAngle": "your launch timeline",
      "rationale": "They described the product concept but haven't shared timing or success criteria yet."
    }
  }
}
```

#### POST /api/luna/plan
**Request**:
```json
{
  "conversation": [...messages],
  "privacyMode": "on-the-record"
}
```

**Response**:
```json
{
  "data": {
    "summary": "Based on your needs...",
    "nextSteps": [
      {
        "title": "Define Core Features",
        "description": "...",
        "estimatedTime": "1-2 weeks"
      }
    ],
    "estimatedScope": "Medium",
    "tags": ["mobile", "ios", "android"]
  }
}
```

#### POST /api/luna/analytics
**Request**:
```json
{
  "event": "session_start",
  "data": {
    "sessionId": "session-123",
    "privacyMode": "on-the-record"
  }
}
```

---

## Branding & Design

### Color Palette

```css
/* Primary Backgrounds */
--black: #000000;
--zinc-900: #18181b;
--zinc-950: #09090b;

/* Borders */
--zinc-800: #27272a;
--zinc-700: #3f3f46;

/* Text */
--white: #ffffff;
--gray-400: #9ca3af;
--gray-500: #6b7280;

/* Accents */
--white-10: rgba(255, 255, 255, 0.1);
--white-20: rgba(255, 255, 255, 0.2);
```

### Typography

```css
/* Headers */
font-family: var(--font-secondary);
font-weight: 600-700;

/* Body */
font-family: var(--font-primary);
font-weight: 400-500;
```

### Animations

```typescript
// Spring animations
transition={{ type: "spring", damping: 25, stiffness: 300 }}

// Fade-in with slide
initial={{ opacity: 0, y: 10 }}
animate={{ opacity: 1, y: 0 }}

// Staggered list
transition={{ delay: index * 0.1 }}

// Hover effects
hover:scale-105
hover:shadow-xl
```

### Visual Hierarchy

1. **Modal**: Black background, rounded-3xl, deep shadows
2. **Header**: Gradient stripe, Luna image, white text
3. **Content**: Zinc-950 to black gradient
4. **Cards**: Zinc-900/950 with subtle borders
5. **Buttons**: White (primary), Zinc-800 (secondary)

---

## API Integration

### OpenAI Integration

**Configuration**:
```typescript
// Environment variable required
OPENAI_API_KEY=sk-...

// Default model
model: "gpt-4-turbo-preview"
temperature: 0.7
max_tokens: 500
```

### Fallback Handling

```typescript
// Automatic fallback to mock data if API fails
try {
  const response = await openai.chat.completions.create({...});
  return response;
} catch (error) {
  console.error('OpenAI error, using fallback');
  return mockResponse;
}
```

### Rate Limiting

- Conversations are sequential (no parallel requests)
- Session-based tracking prevents abuse
- API timeouts: 30 seconds

---

## Speech Synthesis

### Browser Support

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | ✅ Full | Best performance |
| Edge | ✅ Full | Uses Windows voices |
| Safari | ✅ Full | Requires user interaction |
| Firefox | ✅ Partial | Limited voices |
| Mobile Safari | ✅ Full | iOS 7+ |
| Mobile Chrome | ✅ Full | Android 5+ |

### Voice Selection

```typescript
// Prefers female voices for Luna
const preferredVoices = [
  'Female',
  'Samantha',
  'Zira',
  // Falls back to any English voice
];
```

### Configuration

```typescript
{
  rate: 0.95,    // Slightly slower for clarity
  pitch: 1.0,    // Normal pitch
  volume: 1.0    // Full volume
}
```

### Error Handling

```typescript
// Graceful degradation
- "interrupted" errors → Ignored (expected during cleanup)
- "not-allowed" errors → User interaction required
- "audio-busy" errors → Retry after delay
- Other errors → Fall back to text mode
```

---

## Analytics & Tracking

### Events Tracked

1. **Session Events**
   - `session_start` - User starts conversation
   - `session_end` - User closes portal

2. **Message Events**
   - `message_sent` - User sends message
   - `message_received` - Luna responds

3. **Phase Events**
   - `clarify_phase` - Question number
   - `plan_generated` - Plan details

4. **Interaction Events**
   - `mode_change` - Voice ↔ Text
   - `pdf_download` - User downloads plan
   - `summary_read` - Audio playback

### Data Structure

```typescript
interface AnalyticsEvent {
  event: string;
  timestamp: Date;
  sessionId: string;
  data: Record<string, unknown>;
}
```

### Integration Points

```typescript
// Add your analytics service
export async function sendAnalytics(event: AnalyticsEvent) {
  // Example: Google Analytics
  gtag('event', event.event, event.data);
  
  // Example: Mixpanel
  mixpanel.track(event.event, event.data);
  
  // Example: Custom backend
  await fetch('/api/analytics', {
    method: 'POST',
    body: JSON.stringify(event)
  });
}
```

---

## Deployment Guide

### Prerequisites

```bash
# Environment variables required
OPENAI_API_KEY=sk-...

# Optional analytics
GA_ID=G-XXXXXXXXXX
MIXPANEL_TOKEN=...
```

### Build Process

```bash
# Install dependencies
npm install

# Run linting
npm run lint

# Type check
npx tsc --noEmit

# Build for production
npm run build

# Start production server
npm start
```

### Asset Verification

```bash
# Ensure Luna brand image exists
ls -la src/assets/luna.png

# Verify image is optimized
# Recommended: WebP format, < 100KB
```

### Checklist

- [ ] Environment variables configured
- [ ] Luna image present and optimized
- [ ] API endpoints tested
- [ ] Speech synthesis tested across browsers
- [ ] Analytics integration verified
- [ ] Mobile responsive tested
- [ ] Accessibility tested
- [ ] Error boundaries working
- [ ] PDF generation tested
- [ ] Performance metrics acceptable

---

## Troubleshooting

### Speech Synthesis Issues

**Problem**: Luna not speaking

**Solutions**:
1. Check browser console for errors
2. Verify user interaction before speech
3. Test in different browser
4. Check system volume/audio output
5. Verify speech synthesis support: `'speechSynthesis' in window`

**Problem**: "interrupted" errors in console

**Solution**: These are expected during cleanup - ignore them

---

### API Integration Issues

**Problem**: Clarify/Plan requests failing

**Solutions**:
1. Verify `OPENAI_API_KEY` is set
2. Check API quota/limits
3. Verify network connectivity
4. Check browser console for CORS errors
5. Fallback mock data should activate automatically

---

### Modal Display Issues

**Problem**: Modal not appearing

**Solutions**:
1. Check `isOpen` prop is true
2. Verify z-index (should be 50)
3. Check browser console for React errors
4. Verify Luna image loaded

---

### Mobile Issues

**Problem**: Voice not working on mobile

**Solutions**:
1. Mobile Safari requires user interaction first
2. Check microphone permissions
3. Use HTTPS (required for speech recognition)
4. Test in native browser (not in-app browsers)

---

## Best Practices

### For Developers

1. **Never bypass user interaction** for speech synthesis
2. **Always clean up** speech on component unmount
3. **Use stateRef** for latest state in async callbacks
4. **Log extensively** during development
5. **Test cross-browser** before deployment

### For Designers

1. **Maintain Lunim branding** (black/white/zinc)
2. **Use Luna brand image** consistently
3. **Smooth animations** enhance UX
4. **Clear visual feedback** for all states
5. **Mobile-first** responsive design

### For Content

1. **Keep Luna's voice** friendly and professional
2. **Limit clarifying questions** to 2-3
3. **Actionable next steps** only
4. **Clear, concise language**
5. **Respect privacy mode** selection

---

## Future Enhancements

### Planned Features
- [ ] Multi-language support
- [ ] Voice selection (different voices)
- [ ] Conversation history review
- [ ] Integration with CRM
- [ ] Follow-up email with plan
- [ ] Calendar integration for next steps
- [ ] Video call scheduling
- [ ] Team collaboration features

### Technical Improvements
- [ ] Implement conversation caching
- [ ] Add offline support
- [ ] Optimize bundle size
- [ ] Add A/B testing framework
- [ ] Enhanced analytics dashboard
- [ ] Real-time collaboration
- [ ] WebSocket for streaming responses

---

## Support & Maintenance

### Monitoring

**Key Metrics**:
- Session completion rate
- Average conversation length
- Mode preference (voice vs text)
- PDF download rate
- Error rate by type

**Alerts**:
- API failure rate > 5%
- Speech synthesis errors > 10%
- Session abandonment > 30%

### Updates

**Regular Maintenance**:
- Weekly: Review analytics
- Monthly: Update prompts based on feedback
- Quarterly: Review and update dependencies
- Annually: Major feature releases

---

## Credits

**Development Team**: Lunim Engineering
**Design**: Lunim Design Team  
**Brand Assets**: Lunim Marketing  
**AI Integration**: OpenAI GPT-4  
**Speech Synthesis**: Web Speech API  

---

## Version History

### v1.0.0 (2025-11-03)
- Initial production release
- Voice and text interaction
- Privacy modes
- PDF generation
- Analytics integration
- Full Lunim branding
- Mobile responsive
- Error handling and recovery

---

## License

© 2025 Lunim. All rights reserved.

This documentation is proprietary and confidential.

---

**Last Review**: 2025-11-03  
**Next Review**: 2025-12-03  
**Maintained by**: Lunim Engineering Team
