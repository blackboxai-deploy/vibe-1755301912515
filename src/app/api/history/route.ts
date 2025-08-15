import { NextRequest, NextResponse } from 'next/server';

interface GeneratedImage {
  id: string;
  prompt: string;
  imageUrl: string;
  timestamp: number;
  settings?: {
    width?: number;
    height?: number;
    style?: string;
    guidance_scale?: number;
  };
}

// In-memory storage for demo purposes
// In production, you'd use a database
let imageHistory: GeneratedImage[] = [];

export async function GET() {
  try {
    // Return history sorted by most recent first
    const sortedHistory = imageHistory.sort((a, b) => b.timestamp - a.timestamp);
    
    return NextResponse.json({
      success: true,
      data: sortedHistory,
      count: sortedHistory.length
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch history' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, imageUrl, settings } = body;

    if (!prompt || !imageUrl) {
      return NextResponse.json(
        { success: false, error: 'Prompt and imageUrl are required' },
        { status: 400 }
      );
    }

    const newImage: GeneratedImage = {
      id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      prompt,
      imageUrl,
      timestamp: Date.now(),
      settings: settings || {}
    };

    imageHistory.push(newImage);

    // Keep only the last 100 images to prevent memory issues
    if (imageHistory.length > 100) {
      imageHistory = imageHistory.slice(-100);
    }

    return NextResponse.json({
      success: true,
      data: newImage
    });
  } catch (error) {
    console.error('Error saving to history:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save to history' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Image ID is required' },
        { status: 400 }
      );
    }

    const initialLength = imageHistory.length;
    imageHistory = imageHistory.filter(img => img.id !== id);

    if (imageHistory.length === initialLength) {
      return NextResponse.json(
        { success: false, error: 'Image not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Image deleted from history'
    });
  } catch (error) {
    console.error('Error deleting from history:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete from history' },
      { status: 500 }
    );
  }
}