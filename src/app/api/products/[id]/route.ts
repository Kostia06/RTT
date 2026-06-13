import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { products, product_variants, related_products } from '@/lib/db/schema';
import { and, asc, eq, inArray, ne, or } from 'drizzle-orm';
import { requireRole } from '@/lib/auth/guards';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = await getDb();
    const { id } = await params;

    // Match by id OR slug — seeded products use non-UUID ids (e.g.
    // `prod-tonkotsu-kit`), so a UUID-shape heuristic misroutes them to a slug
    // lookup and fails. Matching both handles slugs (public detail page) and
    // ids (admin edit links) regardless of id format.
    const where = and(
      eq(products.active, true),
      or(eq(products.id, id), eq(products.slug, id))
    );

    const productRows = await db.select().from(products).where(where).limit(1);
    const product = productRows[0];

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Fetch variants for this product
    const variantRows = await db
      .select()
      .from(product_variants)
      .where(eq(product_variants.product_id, product.id));

    const variants = variantRows.map((v) => ({
      id: v.id,
      name: v.name,
      sku: v.sku,
      price: v.price,
      stock: v.stock,
      options: v.options,
    }));

    // Fetch explicitly related products
    const relatedRows = await db
      .select()
      .from(related_products)
      .where(eq(related_products.product_id, product.id))
      .orderBy(asc(related_products.sort_order));

    let relatedProducts: Array<{
      id: string;
      name: string;
      slug: string;
      description: string | null;
      price: number;
      images: unknown;
      category: string;
    }> = [];

    if (relatedRows.length > 0) {
      const productIds = relatedRows.map((rp) => rp.related_product_id);
      const relatedDetails = await db
        .select()
        .from(products)
        .where(and(inArray(products.id, productIds), eq(products.active, true)));

      relatedProducts = relatedDetails.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price_regular,
        images: p.images,
        category: p.category,
      }));
    }

    // If no related products found, get similar products from same category
    if (relatedProducts.length === 0) {
      const similar = await db
        .select()
        .from(products)
        .where(
          and(
            eq(products.category, product.category),
            eq(products.active, true),
            ne(products.id, product.id)
          )
        )
        .limit(4);

      relatedProducts = similar.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price_regular,
        images: p.images,
        category: p.category,
      }));
    }

    return NextResponse.json({
      product: {
        ...product,
        variants,
        relatedProducts,
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const gate = await requireRole(request, 'admin');
  if (gate.error) return gate.error;

  try {
    const db = await getDb();
    const { id } = await params;
    const body = await request.json();

    // Update the product
    const updated = await db
      .update(products)
      .set({
        name: body.name,
        description: body.description,
        price_regular: body.price_regular,
        category: body.category,
        slug: body.slug,
        images: body.images,
        featured: body.featured ?? body.is_featured,
        nutritional_info: body.nutritional_info,
        updated_at: new Date().toISOString(),
      })
      .where(eq(products.id, id))
      .returning();

    const product = updated[0];

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ product }, { status: 200 });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const gate = await requireRole(request, 'admin');
  if (gate.error) return gate.error;

  try {
    const db = await getDb();
    const { id } = await params;
    const body = await request.json();

    const updateData: Partial<typeof products.$inferInsert> = {
      updated_at: new Date().toISOString(),
    };
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.price_regular !== undefined) updateData.price_regular = body.price_regular;
    if (body.price_bulk !== undefined) updateData.price_bulk = body.price_bulk;
    if (body.price_cost !== undefined) updateData.price_cost = body.price_cost;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.sku !== undefined) updateData.sku = body.sku;
    if (body.images !== undefined) updateData.images = body.images;
    if (body.stock !== undefined) updateData.stock = body.stock;
    if (body.unit !== undefined) updateData.unit = body.unit;
    if (body.nutritional_info !== undefined) updateData.nutritional_info = body.nutritional_info;
    if (body.cooking_instructions !== undefined) updateData.cooking_instructions = body.cooking_instructions;
    if (body.active !== undefined) updateData.active = body.active;
    if (body.featured !== undefined) updateData.featured = body.featured;
    else if (body.is_featured !== undefined) updateData.featured = body.is_featured;

    const updated = await db
      .update(products)
      .set(updateData)
      .where(eq(products.id, id))
      .returning();

    const product = updated[0];

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ product }, { status: 200 });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const gate = await requireRole(request, 'admin');
  if (gate.error) return gate.error;

  try {
    const db = await getDb();
    const { id } = await params;

    // Soft delete by setting active to false
    await db
      .update(products)
      .set({
        active: false,
        updated_at: new Date().toISOString(),
      })
      .where(eq(products.id, id));

    return NextResponse.json(
      { message: 'Product deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
