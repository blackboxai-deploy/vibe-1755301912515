import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, systemPrompt, width = 1024, height = 1024, guidance_scale = 7.5, num_inference_steps = 50 } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const response = await fetch('https://oi-server.onrender.com/chat/completions', {
      method: 'POST',
      headers: {
        'CustomerId': 'cus_SGPn4uhjPI0F4w',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer xxx'
      },
      body: JSON.stringify({
        model: 'replicate/black-forest-labs/flux-1.1-pro',
        messages: [
          {
            role: 'system',
            content: systemPrompt || 'Generate a high-quality, detailed image based on the user prompt. Focus on artistic composition, proper lighting, and visual appeal.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
        stream: false,
        image_generation: {
          width,
          height,
          guidance_scale,
          num_inference_steps
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('API Error:', errorData);
      return NextResponse.json(
        { error: 'Failed to generate image', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Extract image URL from response
    let imageUrl = null;
    if (data.choices && data.choices[0] && data.choices[0].message) {
      const content = data.choices[0].message.content;
      // Look for image URL in the response
      const urlMatch = content.match(/https?:\/\/[^\s]+\.(jpg|jpeg|png|webp)/i);
      if (urlMatch) {
        imageUrl = urlMatch[0];
      }
    }

    // If no image URL found in content, check for image_url field
    if (!imageUrl && data.image_url) {
      imageUrl = data.image_url;
    }

    // If still no image URL, check choices for image data
    if (!imageUrl && data.choices && data.choices[0] && data.choices[0].image_url) {
      imageUrl = data.choices[0].image_url;
    }

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'No image URL found in response', response: data },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      imageUrl,
      prompt,
      systemPrompt,
      parameters: {
        width,
        height,
        guidance_scale,
        num_inference_steps
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      message: 'AI Image Generation API',
      model: 'replicate/black-forest-labs/flux-1.1-pro',
      endpoint: '/api/generate',
      methods: ['POST'],
      parameters: {
        prompt: 'string (required)',
        systemPrompt: 'string (optional)',
        width: 'number (default: 1024)',
        height: 'number (default: 1024)',
        guidance_scale: 'number (default: 7.5)',
        num_inference_steps: 'number (default: 50)'
      }
    },
    { status: 200 }
  );
}