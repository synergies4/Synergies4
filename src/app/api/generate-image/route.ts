import { NextRequest, NextResponse } from 'next/server';

type AIProvider = 'anthropic' | 'openai' | 'google';

export async function POST(request: NextRequest) {
  try {
    const { prompt, provider = 'openai' } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a string' },
        { status: 400 }
      );
    }

    let apiKey: string | undefined;
    let apiUrl: string;
    let headers: Record<string, string>;
    let requestBody: any;

    switch (provider) {
      case 'openai':
        apiKey = process.env.OPENAI_API_KEY;
        apiUrl = 'https://api.openai.com/v1/images/generations';
        headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        };
        requestBody = {
          model: 'dall-e-3',
          prompt: prompt,
          n: 1,
          size: '1024x1024',
          quality: 'standard'
        };
        break;
      case 'google':
        // Google Imagen API (placeholder - actual implementation would vary)
        apiKey = process.env.GOOGLE_AI_API_KEY;
        return NextResponse.json(
          { 
            error: 'Image generation with Google is not yet implemented. Please use OpenAI provider.' 
          },
          { status: 501 }
        );
      case 'anthropic':
        // Anthropic doesn't have image generation
        return NextResponse.json(
          { 
            error: 'Anthropic does not support image generation. Please use OpenAI provider.' 
          },
          { status: 501 }
        );
      default:
        return NextResponse.json(
          { error: 'Invalid provider specified' },
          { status: 400 }
        );
    }

    if (!apiKey) {
      console.error(`${provider.toUpperCase()}_API_KEY is not configured`);
      return NextResponse.json(
        { 
          error: `Image generation is currently unavailable with ${provider}. Please check API key configuration.` 
        },
        { status: 500 }
      );
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`${provider} Image API error:`, response.status, errorData);
      
      return NextResponse.json(
        { 
          error: `Failed to generate image with ${provider}. Please try again later.` 
        },
        { status: 500 }
      );
    }

    const data = await response.json();
    let imageUrl: string;

    // Extract image URL based on provider
    switch (provider) {
      case 'openai':
        if (!data.data || !data.data[0] || !data.data[0].url) {
          throw new Error('Unexpected response format from OpenAI');
        }
        imageUrl = data.data[0].url;
        break;
      default:
        throw new Error('Unknown provider');
    }

    return NextResponse.json({
      imageUrl: imageUrl,
      provider: provider,
      prompt: prompt
    });

  } catch (error) {
    console.error('Image generation API error:', error);
    
    return NextResponse.json(
      { 
        error: "Failed to generate image. Please try again later." 
      },
      { status: 500 }
    );
  }
} 