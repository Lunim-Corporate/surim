import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const apiKey =
      process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    const useOpenAiTts =
      process.env.USE_OPENAI_TTS === 'true' ||
      process.env.USE_OPENAI_TTS === '1' ||
      process.env.NEXT_PUBLIC_USE_OPENAI_TTS === 'true';

    if (!useOpenAiTts) {
      return NextResponse.json(
        { error: 'OpenAI TTS is disabled (USE_OPENAI_TTS is not true)' },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing OpenAI API key for TTS' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const text = body?.text as string | undefined;
    const voice = (body?.voice as string | undefined) ?? 'nova';
    const instructions = "Accent/Affect: British mixed with East African accent; slow, sophisticated yet friendly, clearly understandable with a charming touch of East African intonation.\n\nTone: Warm and a little snooty. Speak with pride and knowledge for the art being presented.\n\nPacing: Moderate, with deliberate pauses at key observations to allow listeners to appreciate details.\n\nEmotion: Calm, knowledgeable enthusiasm; show genuine reverence and fascination for the artwork.\n\nPronunciation: Clearly articulate French words (e.g., \"Mes amis,\" \"incroyable\") in French and artist names (e.g., \"Leonardo da Vinci\") with authentic French pronunciation.\n\nPersonality Affect: Cultured, engaging, and refined, guiding visitors with a blend of artistic passion and welcoming charm.";

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: 'Text is required for TTS' },
        { status: 400 }
      );
    }

    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini-tts',
        voice,
        input: text,
        instructions,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(new Error(`OpenAI TTS API error ${response.status}: ${errorText}`));
      console.error('OpenAI TTS API error:', response.status, errorText);
      return NextResponse.json(
        { error: 'Failed to generate speech audio' },
        { status: 500 }
      );
    }

    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error(error);
    console.error('Error in /api/luna/tts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

