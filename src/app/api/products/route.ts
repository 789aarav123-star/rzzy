import { NextRequest, NextResponse } from 'next/server';
import { rateLimitResponse } from '@/lib/rate-limit';
import { sampleProducts } from '@/lib/sample-products';

export async function GET(request: NextRequest) {
  // Rate limit by IP
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const rateLimit = rateLimitResponse(ip);
  if (rateLimit) return rateLimit;

  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const featured = searchParams.get('featured');
  const id = searchParams.get('id');

  let products = [...sampleProducts];

  if (id) {
    const product = products.find((p) => p.id === id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json(product);
  }

  if (category) {
    products = products.filter((p) => p.category === category);
  }

  if (featured === 'true') {
    products = products.filter((p) => p.featured);
  }

  return NextResponse.json({
    products,
    total: products.length,
  });
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const rateLimit = rateLimitResponse(ip);
  if (rateLimit) return rateLimit;

  try {
    const body = await request.json();
    // In production, validate auth and save to Firebase
    return NextResponse.json({ success: true, id: Date.now().toString() }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const rateLimit = rateLimitResponse(ip);
  if (rateLimit) return rateLimit;

  try {
    const body = await request.json();
    // In production, validate auth and update in Firebase
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const rateLimit = rateLimitResponse(ip);
  if (rateLimit) return rateLimit;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
  }

  // In production, validate auth and delete from Firebase
  return NextResponse.json({ success: true });
}
