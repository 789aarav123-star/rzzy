import { NextRequest, NextResponse } from 'next/server';
import { rateLimitResponse } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const rateLimit = rateLimitResponse(ip);
  if (rateLimit) return rateLimit;

  // In production, fetch from Firebase
  return NextResponse.json({ orders: [], total: 0 });
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const rateLimit = rateLimitResponse(ip);
  if (rateLimit) return rateLimit;

  try {
    const body = await request.json();
    // In production, validate auth, save order to Firebase, etc.
    return NextResponse.json({
      success: true,
      orderId: `ORD-${Date.now()}`,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
