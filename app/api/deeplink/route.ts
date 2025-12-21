import { NextRequest, NextResponse } from 'next/server';
import { CoupangPartnersClient } from 'coupang-partners-sdk-standalone';
import { DEFAULT_SUB_ID } from '@/lib/constants';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get('url');
    const subId = searchParams.get('subId') || DEFAULT_SUB_ID;

    if (!url) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      );
    }

    const client = new CoupangPartnersClient({
      accessKey: process.env.COUPANG_ACCESS_KEY!,
      secretKey: process.env.COUPANG_SECRET_KEY!,
    });

    const response = await client.deeplink({
      coupangUrls: [url],
      subId,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Deeplink API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
