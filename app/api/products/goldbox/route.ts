import { NextRequest, NextResponse } from 'next/server';
import { CoupangPartnersClient } from 'coupang-partners-sdk-standalone';

const client = new CoupangPartnersClient({
  accessKey: process.env.COUPANG_ACCESS_KEY || '',
  secretKey: process.env.COUPANG_SECRET_KEY || ''
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subId = searchParams.get('subId') || undefined;
    const imageSize = searchParams.get('imageSize') || '230x230';

    const response = await client.goldbox({
      subId,
      imageSize: imageSize as any
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('GoldBox API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}