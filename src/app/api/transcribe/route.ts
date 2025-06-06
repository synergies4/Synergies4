import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const provider = formData.get('provider') as string;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['audio/webm', 'audio/mp4', 'audio/wav', 'audio/mpeg', 'audio/m4a'];
    if (!allowedTypes.includes(audioFile.type)) {
      return NextResponse.json(
        { error: 'Unsupported audio format. Please use WebM, MP4, WAV, MPEG, or M4A.' },
        { status: 400 }
      );
    }

    // Check file size (max 25MB for OpenAI Whisper)
    const maxSize = 25 * 1024 * 1024; // 25MB
    if (audioFile.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 25MB.' },
        { status: 400 }
      );
    }

    console.log(`Transcribing audio file: ${audioFile.name}, Size: ${audioFile.size} bytes, Type: ${audioFile.type}`);

    // Convert File to the format expected by OpenAI
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Create a file-like object for OpenAI
    const fileForOpenAI = new File([buffer], audioFile.name, {
      type: audioFile.type,
    });

    try {
      // Use OpenAI Whisper for transcription
      const transcription = await openai.audio.transcriptions.create({
        file: fileForOpenAI,
        model: 'whisper-1',
        language: 'en', // You can make this dynamic if needed
        response_format: 'text',
        temperature: 0.2, // Lower temperature for more consistent results
      });

      console.log('Transcription completed successfully');

      return NextResponse.json({
        transcription: transcription,
        provider: 'openai',
        model: 'whisper-1'
      });

    } catch (transcriptionError: any) {
      console.error('OpenAI transcription error:', transcriptionError);
      
      // Handle specific OpenAI errors
      if (transcriptionError.error?.code === 'invalid_file_format') {
        return NextResponse.json(
          { error: 'Invalid audio format. Please try a different file format.' },
          { status: 400 }
        );
      }

      if (transcriptionError.error?.code === 'file_too_large') {
        return NextResponse.json(
          { error: 'Audio file is too large. Please use a file smaller than 25MB.' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: 'Transcription failed. Please try again.' },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Transcription API error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error during transcription' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to transcribe audio.' },
    { status: 405 }
  );
} 