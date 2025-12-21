import { NextRequest, NextResponse } from 'next/server';
import { CoupangPartnersClient } from 'coupang-partners-sdk-standalone';
import { DEFAULT_SUB_ID } from '@/lib/constants';

const client = new CoupangPartnersClient({
  accessKey: process.env.COUPANG_ACCESS_KEY || '',
  secretKey: process.env.COUPANG_SECRET_KEY || ''
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('deviceId');
    const subId = searchParams.get('subId') || DEFAULT_SUB_ID;
    const imageSize = searchParams.get('imageSize') || '512x512';

    if (!deviceId) {
      return NextResponse.json(
        { error: 'Device ID is required' },
        { status: 400 }
      );
    }

    const response = await client.recommendation({
      deviceId,
      subId,
      imageSize: imageSize as '230x230' | '300x300' | '512x512'
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Recommendation API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}