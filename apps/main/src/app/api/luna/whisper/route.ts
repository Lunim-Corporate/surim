import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const apiKey =
      process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing OpenAI API key for Whisper transcription' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const audio = formData.get('audio');
    const lang = formData.get('lang')?.toString();

    if (!audio || !(audio instanceof Blob)) {
      return NextResponse.json(
        { error: 'Audio file is required' },
        { status: 400 }
      );
    }

    const openaiForm = new FormData();
    // Pass through the audio blob to OpenAI
    openaiForm.append('file', audio, 'recording.webm');
    openaiForm.append('model', 'whisper-1');
    if (lang) {
      openaiForm.append('language', lang);
    }

    const response = await fetch(
      'https://api.openai.com/v1/audio/transcriptions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: openaiForm,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(new Error(`Whisper API error ${response.status}: ${errorText}`));
      console.error('Whisper API error:', response.status, errorText);
      return NextResponse.json(
        { error: 'Failed to transcribe audio' },
        { status: 500 }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      text: data.text ?? '',
    });
  } catch (error) {
    console.error(error);
    console.error('Error in Whisper endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

