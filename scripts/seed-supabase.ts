import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// Load environment variables FIRST
dotenv.config({ path: resolve(__dirname, '../.env') });

// Create Supabase client directly here
const getServiceSupabase = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
};

const products = [
  // Ramen Bowls
  {
    name: 'Classic Tonkotsu Ramen',
    slug: 'classic-tonkotsu-ramen',
    description: 'Our signature tonkotsu ramen features a rich, creamy pork bone broth slow-simmered for 18 hours. Topped with tender chashu pork, marinated soft-boiled egg, fresh scallions, and wood ear mushrooms. Served with our house-made wavy noodles.',
    short_description: 'Rich 18-hour pork bone broth with chashu and soft-boiled egg',
    category: 'ramen-bowl',
    price: 14.99,
    is_active: true,
    is_featured: true,
    images: [
      {
        url: 'https://placehold.co/800x800/black/white?text=Tonkotsu+Ramen',
        alt: 'Classic Tonkotsu Ramen',
        is_primary: true,
        sort_order: 0,
      },
    ],
    variants: [
      { name: 'Regular - Mild', sku: 'RTT-TONK-REG-MILD', price: 14.99, stock: 100, options: { spiceLevel: 'mild', size: 'regular' } },
      { name: 'Regular - Medium', sku: 'RTT-TONK-REG-MED', price: 14.99, stock: 100, options: { spiceLevel: 'medium', size: 'regular' } },
      { name: 'Large - Mild', sku: 'RTT-TONK-LRG-MILD', price: 17.99, stock: 75, options: { spiceLevel: 'mild', size: 'large' } },
    ],
    nutritional_info: {
      calories: 580,
      protein: 32,
      carbs: 65,
      fat: 18,
      sodium: 1850,
    },
  },
  {
    name: 'Spicy Miso Ramen',
    slug: 'spicy-miso-ramen',
    description: 'Bold and fiery miso broth infused with chili oil and garlic. Features ground pork, corn, bean sprouts, and a perfectly cooked ajitama egg. Finished with sesame seeds and nori. For those who like it hot!',
    short_description: 'Fiery miso broth with chili oil, ground pork, and ajitama',
    category: 'ramen-bowl',
    price: 15.99,
    is_active: true,
    is_featured: true,
    images: [
      {
        url: 'https://placehold.co/800x800/black/white?text=Spicy+Miso',
        alt: 'Spicy Miso Ramen',
        is_primary: true,
        sort_order: 0,
      },
    ],
    variants: [
      { name: 'Regular - Medium', sku: 'RTT-MISO-REG-MED', price: 15.99, stock: 90, options: { spiceLevel: 'medium', size: 'regular' } },
      { name: 'Regular - Hot', sku: 'RTT-MISO-REG-HOT', price: 15.99, stock: 85, options: { spiceLevel: 'hot', size: 'regular' } },
      { name: 'Regular - Extra Hot', sku: 'RTT-MISO-REG-XHOT', price: 15.99, stock: 60, options: { spiceLevel: 'extra-hot', size: 'regular' } },
    ],
    nutritional_info: {
      calories: 620,
      protein: 28,
      carbs: 68,
      fat: 22,
      sodium: 2100,
    },
  },
  {
    name: 'Shoyu Ramen',
    slug: 'shoyu-ramen',
    description: 'Traditional soy sauce-based broth with chicken and dashi. Light yet flavorful, topped with tender chicken chashu, menma (bamboo shoots), nori, and green onions. A classic choice.',
    short_description: 'Light soy sauce broth with chicken chashu and bamboo shoots',
    category: 'ramen-bowl',
    price: 13.99,
    is_active: true,
    is_featured: false,
    images: [
      {
        url: 'https://placehold.co/800x800/black/white?text=Shoyu+Ramen',
        alt: 'Shoyu Ramen',
        is_primary: true,
        sort_order: 0,
      },
    ],
    variants: [
      { name: 'Regular - Mild', sku: 'RTT-SHOYU-REG-MILD', price: 13.99, stock: 110, options: { spiceLevel: 'mild', size: 'regular' } },
      { name: 'Large - Mild', sku: 'RTT-SHOYU-LRG-MILD', price: 16.99, stock: 80, options: { spiceLevel: 'mild', size: 'large' } },
    ],
    nutritional_info: {
      calories: 510,
      protein: 30,
      carbs: 62,
      fat: 14,
      sodium: 1650,
    },
  },
  {
    name: 'Vegetarian Ramen',
    slug: 'vegetarian-ramen',
    description: 'Plant-based miso broth with shiitake mushrooms, bok choy, corn, bamboo shoots, and crispy tofu. Finished with sesame oil and topped with nori. Completely vegan and packed with umami flavor.',
    short_description: 'Vegan miso broth with shiitake, tofu, and seasonal vegetables',
    category: 'ramen-bowl',
    price: 13.99,
    is_active: true,
    is_featured: false,
    images: [
      {
        url: 'https://placehold.co/800x800/black/white?text=Veg+Ramen',
        alt: 'Vegetarian Ramen',
        is_primary: true,
        sort_order: 0,
      },
    ],
    variants: [
      { name: 'Regular - Mild', sku: 'RTT-VEG-REG-MILD', price: 13.99, stock: 95, options: { spiceLevel: 'mild', size: 'regular' } },
      { name: 'Regular - Medium', sku: 'RTT-VEG-REG-MED', price: 13.99, stock: 90, options: { spiceLevel: 'medium', size: 'regular' } },
    ],
    nutritional_info: {
      calories: 480,
      protein: 18,
      carbs: 70,
      fat: 12,
      sodium: 1450,
    },
  },
  {
    name: 'Premium Wagyu Ramen',
    slug: 'premium-wagyu-ramen',
    description: 'Our most luxurious offering. Rich beef bone broth with slices of A5 Wagyu beef, black garlic oil, enoki mushrooms, and a perfectly cooked onsen egg. Garnished with microgreens and truffle oil.',
    short_description: 'A5 Wagyu beef in rich bone broth with truffle oil',
    category: 'ramen-bowl',
    price: 22.99,
    compare_at_price: 26.99,
    is_active: true,
    is_featured: true,
    images: [
      {
        url: 'https://placehold.co/800x800/black/white?text=Wagyu+Ramen',
        alt: 'Premium Wagyu Ramen',
        is_primary: true,
        sort_order: 0,
      },
    ],
    variants: [
      { name: 'Regular', sku: 'RTT-WAGYU-REG', price: 22.99, stock: 40, options: { size: 'regular' } },
    ],
    nutritional_info: {
      calories: 720,
      protein: 42,
      carbs: 58,
      fat: 32,
      sodium: 1950,
    },
  },

  // Retail Products
  {
    name: 'Fresh Ramen Noodles (2-pack)',
    slug: 'fresh-ramen-noodles-2pack',
    description: 'Our signature house-made ramen noodles, crafted daily with premium wheat flour and kansui. Perfectly chewy texture that holds up to rich broths. Each pack serves 2. Cook fresh in 2-3 minutes.',
    short_description: 'House-made fresh noodles, serves 2',
    category: 'retail-product',
    price: 8.99,
    is_active: true,
    is_featured: false,
    images: [
      {
        url: 'https://placehold.co/800x800/black/white?text=Fresh+Noodles',
        alt: 'Fresh Ramen Noodles',
        is_primary: true,
        sort_order: 0,
      },
    ],
    variants: [
      { name: '2-pack', sku: 'RTT-NOOD-2PK', price: 8.99, stock: 150, options: {} },
    ],
  },
  {
    name: 'House-Made Tare Sauce',
    slug: 'house-made-tare-sauce',
    description: 'Our secret tare (seasoning sauce) that brings ramen to life. Made with soy sauce, sake, mirin, and aromatics. Add to your homemade broth for authentic flavor. 250ml bottle.',
    short_description: 'Authentic seasoning sauce for ramen broth, 250ml',
    category: 'retail-product',
    price: 12.99,
    is_active: true,
    is_featured: false,
    images: [
      {
        url: 'https://placehold.co/800x800/black/white?text=Tare+Sauce',
        alt: 'House-Made Tare Sauce',
        is_primary: true,
        sort_order: 0,
      },
    ],
    variants: [
      { name: '250ml', sku: 'RTT-TARE-250', price: 12.99, stock: 80, options: {} },
    ],
  },
  {
    name: 'Ramen Spice Mix',
    slug: 'ramen-spice-mix',
    description: 'Elevate your ramen game with our signature spice blend. Features toasted sesame, chili flakes, garlic, and seaweed. Perfect for adding heat and depth. 100g jar.',
    short_description: 'Signature spice blend for ramen, 100g',
    category: 'retail-product',
    price: 6.99,
    is_active: true,
    is_featured: false,
    images: [
      {
        url: 'https://placehold.co/800x800/black/white?text=Spice+Mix',
        alt: 'Ramen Spice Mix',
        is_primary: true,
        sort_order: 0,
      },
    ],
    variants: [
      { name: '100g', sku: 'RTT-SPICE-100', price: 6.99, stock: 120, options: {} },
    ],
  },

  // Merchandise
  {
    name: 'RTT Black T-Shirt',
    slug: 'rtt-black-tshirt',
    description: 'Premium cotton t-shirt featuring our "Respect the Technique" logo. Ultra-soft fabric with a classic fit. Available in multiple sizes. Show your ramen pride!',
    short_description: 'Premium cotton tee with RTT logo',
    category: 'merchandise',
    price: 24.99,
    is_active: true,
    is_featured: false,
    images: [
      {
        url: 'https://placehold.co/800x800/black/white?text=RTT+Shirt',
        alt: 'RTT Black T-Shirt',
        is_primary: true,
        sort_order: 0,
      },
    ],
    variants: [
      { name: 'Small', sku: 'RTT-SHIRT-S', price: 24.99, stock: 30, options: {} },
      { name: 'Medium', sku: 'RTT-SHIRT-M', price: 24.99, stock: 50, options: {} },
      { name: 'Large', sku: 'RTT-SHIRT-L', price: 24.99, stock: 50, options: {} },
      { name: 'X-Large', sku: 'RTT-SHIRT-XL', price: 24.99, stock: 40, options: {} },
    ],
  },
  {
    name: 'Authentic Ramen Bowl Set',
    slug: 'authentic-ramen-bowl-set',
    description: 'Professional-grade ceramic ramen bowl set. Includes 2 large bowls, 2 pairs of chopsticks, and 2 soup spoons. Deep bowl design holds generous portions. Microwave and dishwasher safe.',
    short_description: 'Ceramic bowl set for 2 with chopsticks and spoons',
    category: 'merchandise',
    price: 49.99,
    is_active: true,
    is_featured: true,
    images: [
      {
        url: 'https://placehold.co/800x800/black/white?text=Bowl+Set',
        alt: 'Ramen Bowl Set',
        is_primary: true,
        sort_order: 0,
      },
    ],
    variants: [
      { name: 'Set of 2', sku: 'RTT-BOWL-SET2', price: 49.99, stock: 35, options: {} },
    ],
  },
  {
    name: 'Premium Chopstick Set',
    slug: 'premium-chopstick-set',
    description: 'Hand-crafted wooden chopsticks with elegant black finish. Set of 4 pairs. Perfect weight and balance for noodle eating. Comes in a beautiful gift box.',
    short_description: 'Hand-crafted wooden chopsticks, 4 pairs',
    category: 'merchandise',
    price: 15.99,
    is_active: true,
    is_featured: false,
    images: [
      {
        url: 'https://placehold.co/800x800/black/white?text=Chopsticks',
        alt: 'Premium Chopstick Set',
        is_primary: true,
        sort_order: 0,
      },
    ],
    variants: [
      { name: 'Set of 4', sku: 'RTT-CHOP-SET4', price: 15.99, stock: 60, options: {} },
    ],
  },
];

async function seedProducts() {
  try {
    console.log('🌱 Starting Supabase seeding...');
    const supabase = getServiceSupabase();

    console.log('🗑️  Clearing existing data...');

    // Delete in correct order (respecting foreign keys)
    await supabase.from('product_nutritional_info').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('product_variants').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('product_images').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    console.log('📝 Creating products...');
    let createdCount = 0;

    for (const productData of products) {
      const { images, variants, nutritional_info, ...productFields } = productData;

      // Insert product
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert(productFields)
        .select()
        .single();

      if (productError) {
        console.error(`Error creating product ${productData.name}:`, productError);
        continue;
      }

      createdCount++;

      // Insert images
      if (images && images.length > 0) {
        const imagesToInsert = images.map((img) => ({
          ...img,
          product_id: product.id,
        }));

        const { error: imagesError } = await supabase
          .from('product_images')
          .insert(imagesToInsert);

        if (imagesError) {
          console.error(`Error creating images for ${productData.name}:`, imagesError);
        }
      }

      // Insert variants
      if (variants && variants.length > 0) {
        const variantsToInsert = variants.map((variant) => ({
          ...variant,
          product_id: product.id,
        }));

        const { error: variantsError } = await supabase
          .from('product_variants')
          .insert(variantsToInsert);

        if (variantsError) {
          console.error(`Error creating variants for ${productData.name}:`, variantsError);
        }
      }

      // Insert nutritional info
      if (nutritional_info) {
        const { error: nutritionError } = await supabase
          .from('product_nutritional_info')
          .insert({
            ...nutritional_info,
            product_id: product.id,
          });

        if (nutritionError) {
          console.error(`Error creating nutrition info for ${productData.name}:`, nutritionError);
        }
      }

      console.log(`✅ Created: ${productData.name}`);
    }

    console.log(`\n🎉 Successfully created ${createdCount} products!`);
    console.log('\nProduct Summary:');

    const { data: stats } = await supabase
      .from('products')
      .select('category');

    if (stats) {
      const ramenBowls = stats.filter(p => p.category === 'ramen-bowl').length;
      const retailProducts = stats.filter(p => p.category === 'retail-product').length;
      const merchandise = stats.filter(p => p.category === 'merchandise').length;

      console.log(`- Ramen Bowls: ${ramenBowls}`);
      console.log(`- Retail Products: ${retailProducts}`);
      console.log(`- Merchandise: ${merchandise}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    process.exit(1);
  }
}

seedProducts();
