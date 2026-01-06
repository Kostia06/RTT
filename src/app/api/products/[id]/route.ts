import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Build query
    let query = supabase
      .from('products')
      .select('*')
      .eq('active', true);

    // Determine if id is UUID or slug
    if (UUID_REGEX.test(id)) {
      query = query.eq('id', id);
    } else {
      query = query.eq('slug', id);
    }

    const { data: product, error } = await query.single();

    if (error || !product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Try to fetch variants (table might not exist yet)
    let variants: any[] = [];
    try {
      const { data: variantsData, error: variantsError } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', product.id)
        .eq('active', true);

      if (variantsError) {
        console.error('Error fetching variants:', variantsError);
      } else if (variantsData && variantsData.length > 0) {
        variants = variantsData.map((v: any) => ({
          id: v.id,
          name: v.name,
          sku: v.sku,
          size: v.size,
          packQuantity: v.pack_quantity,
          price: parseFloat(v.price),
          stock: v.stock,
        }));
        console.log(`Found ${variants.length} variants for product ${product.id}`);
      } else {
        console.log(`No variants found for product ${product.id}`);
      }
    } catch (err) {
      // Table doesn't exist yet, skip variants
      console.error('Error with product_variants table:', err);
    }

    // Try to fetch similar/related products
    let relatedProducts: any[] = [];
    try {
      // First try to get explicitly related products
      const { data: relatedProductsData } = await supabase
        .from('related_products')
        .select('related_product_id, relationship_type, sort_order')
        .eq('product_id', product.id)
        .order('sort_order', { ascending: true });

      if (relatedProductsData && relatedProductsData.length > 0) {
        // Fetch the actual products
        const productIds = relatedProductsData.map(rp => rp.related_product_id);
        const { data: relatedProductDetails } = await supabase
          .from('products')
          .select('id, name, slug, description, price_regular, images, category')
          .in('id', productIds)
          .eq('active', true);

        if (relatedProductDetails) {
          relatedProducts = relatedProductDetails.map((p: any) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            description: p.description,
            price: parseFloat(p.price_regular),
            images: p.images,
            category: p.category,
          }));
        }
      }

      // If no related products found, get similar products from same category
      if (relatedProducts.length === 0) {
        const { data: similarProducts } = await supabase
          .from('products')
          .select('id, name, slug, description, price_regular, images, category')
          .eq('category', product.category)
          .eq('active', true)
          .neq('id', product.id)
          .limit(4);

        if (similarProducts) {
          relatedProducts = similarProducts.map((p: any) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            description: p.description,
            price: parseFloat(p.price_regular),
            images: p.images,
            category: p.category,
          }));
        }
      }
    } catch (err) {
      // Table doesn't exist yet, skip related products
      console.log('Error fetching related products:', err);
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
  try {
    const supabase = await createClient();
    const { id } = await params;
    const body = await request.json();

    // Validate ID is UUID
    if (!UUID_REGEX.test(id)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    // Update the product
    const { data: product, error } = await supabase
      .from('products')
      .update({
        name: body.name,
        description: body.description,
        price_regular: body.price_regular,
        category: body.category,
        slug: body.slug,
        images: body.images,
        is_featured: body.is_featured,
        nutritional_info: body.nutritional_info,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating product:', error);
      return NextResponse.json(
        { error: 'Failed to update product', details: error.message },
        { status: 500 }
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
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Validate ID is UUID
    if (!UUID_REGEX.test(id)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    // Soft delete by setting active to false
    const { error } = await supabase
      .from('products')
      .update({
        active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('Error deleting product:', error);
      return NextResponse.json(
        { error: 'Failed to delete product', details: error.message },
        { status: 500 }
      );
    }

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
