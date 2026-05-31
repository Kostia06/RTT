import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { getActiveProducts } from '@/lib/db/queries/products';

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const db = await getDb();
    const rows = await getActiveProducts(db, {
      category: sp.get('category') ?? undefined,
      featured: sp.get('featured') === 'true',
      limit: parseInt(sp.get('limit') || '50'),
      skip: parseInt(sp.get('skip') || '0'),
    });
    return NextResponse.json({ products: rows }, { status: 200 });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
