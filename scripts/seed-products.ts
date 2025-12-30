import mongoose from 'mongoose';
import connectDB from '../src/lib/db/mongodb';
import Product from '../src/models/Product';

const products = [
  // Ramen Bowls
  {
    name: 'Classic Tonkotsu Ramen',
    slug: 'classic-tonkotsu-ramen',
    description: 'Our signature tonkotsu ramen features a rich, creamy pork bone broth slow-simmered for 18 hours. Topped with tender chashu pork, marinated soft-boiled egg, fresh scallions, and wood ear mushrooms. Served with our house-made wavy noodles.',
    shortDescription: 'Rich 18-hour pork bone broth with chashu and soft-boiled egg',
    category: 'ramen-bowl' as const,
    price: 14.99,
    images: [
      {
        url: 'https://placehold.co/800x800/black/white?text=Tonkotsu+Ramen',
        alt: 'Classic Tonkotsu Ramen',
        isPrimary: true,
      },
    ],
    variants: [
      {
        name: 'Regular - Mild',
        sku: 'RTT-TONK-REG-MILD',
        price: 14.99,
        stock: 100,
        options: { spiceLevel: 'mild' as const, size: 'regular' as const },
      },
      {
        name: 'Regular - Medium',
        sku: 'RTT-TONK-REG-MED',
        price: 14.99,
        stock: 100,
        options: { spiceLevel: 'medium' as const, size: 'regular' as const },
      },
      {
        name: 'Large - Mild',
        sku: 'RTT-TONK-LRG-MILD',
        price: 17.99,
        stock: 75,
        options: { spiceLevel: 'mild' as const, size: 'large' as const },
      },
    ],
    nutritionalInfo: {
      calories: 580,
      protein: 32,
      carbs: 65,
      fat: 18,
      sodium: 1850,
    },
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'Spicy Miso Ramen',
    slug: 'spicy-miso-ramen',
    description: 'Bold and fiery miso broth infused with chili oil and garlic. Features ground pork, corn, bean sprouts, and a perfectly cooked ajitama egg. Finished with sesame seeds and nori. For those who like it hot!',
    shortDescription: 'Fiery miso broth with chili oil, ground pork, and ajitama',
    category: 'ramen-bowl' as const,
    price: 15.99,
    images: [
      {
        url: 'https://placehold.co/800x800/black/white?text=Spicy+Miso',
        alt: 'Spicy Miso Ramen',
        isPrimary: true,
      },
    ],
    variants: [
      {
        name: 'Regular - Medium',
        sku: 'RTT-MISO-REG-MED',
        price: 15.99,
        stock: 90,
        options: { spiceLevel: 'medium' as const, size: 'regular' as const },
      },
      {
        name: 'Regular - Hot',
        sku: 'RTT-MISO-REG-HOT',
        price: 15.99,
        stock: 85,
        options: { spiceLevel: 'hot' as const, size: 'regular' as const },
      },
      {
        name: 'Regular - Extra Hot',
        sku: 'RTT-MISO-REG-XHOT',
        price: 15.99,
        stock: 60,
        options: { spiceLevel: 'extra-hot' as const, size: 'regular' as const },
      },
    ],
    nutritionalInfo: {
      calories: 620,
      protein: 28,
      carbs: 68,
      fat: 22,
      sodium: 2100,
    },
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'Shoyu Ramen',
    slug: 'shoyu-ramen',
    description: 'Traditional soy sauce-based broth with chicken and dashi. Light yet flavorful, topped with tender chicken chashu, menma (bamboo shoots), nori, and green onions. A classic choice.',
    shortDescription: 'Light soy sauce broth with chicken chashu and bamboo shoots',
    category: 'ramen-bowl' as const,
    price: 13.99,
    images: [
      {
        url: 'https://placehold.co/800x800/black/white?text=Shoyu+Ramen',
        alt: 'Shoyu Ramen',
        isPrimary: true,
      },
    ],
    variants: [
      {
        name: 'Regular - Mild',
        sku: 'RTT-SHOYU-REG-MILD',
        price: 13.99,
        stock: 110,
        options: { spiceLevel: 'mild' as const, size: 'regular' as const },
      },
      {
        name: 'Large - Mild',
        sku: 'RTT-SHOYU-LRG-MILD',
        price: 16.99,
        stock: 80,
        options: { spiceLevel: 'mild' as const, size: 'large' as const },
      },
    ],
    nutritionalInfo: {
      calories: 510,
      protein: 30,
      carbs: 62,
      fat: 14,
      sodium: 1650,
    },
    isActive: true,
    isFeatured: false,
  },
  {
    name: 'Vegetarian Ramen',
    slug: 'vegetarian-ramen',
    description: 'Plant-based miso broth with shiitake mushrooms, bok choy, corn, bamboo shoots, and crispy tofu. Finished with sesame oil and topped with nori. Completely vegan and packed with umami flavor.',
    shortDescription: 'Vegan miso broth with shiitake, tofu, and seasonal vegetables',
    category: 'ramen-bowl' as const,
    price: 13.99,
    images: [
      {
        url: 'https://placehold.co/800x800/black/white?text=Veg+Ramen',
        alt: 'Vegetarian Ramen',
        isPrimary: true,
      },
    ],
    variants: [
      {
        name: 'Regular - Mild',
        sku: 'RTT-VEG-REG-MILD',
        price: 13.99,
        stock: 95,
        options: { spiceLevel: 'mild' as const, size: 'regular' as const },
      },
      {
        name: 'Regular - Medium',
        sku: 'RTT-VEG-REG-MED',
        price: 13.99,
        stock: 90,
        options: { spiceLevel: 'medium' as const, size: 'regular' as const },
      },
    ],
    nutritionalInfo: {
      calories: 480,
      protein: 18,
      carbs: 70,
      fat: 12,
      sodium: 1450,
    },
    isActive: true,
    isFeatured: false,
  },
  {
    name: 'Premium Wagyu Ramen',
    slug: 'premium-wagyu-ramen',
    description: 'Our most luxurious offering. Rich beef bone broth with slices of A5 Wagyu beef, black garlic oil, enoki mushrooms, and a perfectly cooked onsen egg. Garnished with microgreens and truffle oil.',
    shortDescription: 'A5 Wagyu beef in rich bone broth with truffle oil',
    category: 'ramen-bowl' as const,
    price: 22.99,
    compareAtPrice: 26.99,
    images: [
      {
        url: 'https://placehold.co/800x800/black/white?text=Wagyu+Ramen',
        alt: 'Premium Wagyu Ramen',
        isPrimary: true,
      },
    ],
    variants: [
      {
        name: 'Regular',
        sku: 'RTT-WAGYU-REG',
        price: 22.99,
        stock: 40,
        options: { size: 'regular' as const },
      },
    ],
    nutritionalInfo: {
      calories: 720,
      protein: 42,
      carbs: 58,
      fat: 32,
      sodium: 1950,
    },
    isActive: true,
    isFeatured: true,
  },

  // Retail Products
  {
    name: 'Fresh Ramen Noodles (2-pack)',
    slug: 'fresh-ramen-noodles-2pack',
    description: 'Our signature house-made ramen noodles, crafted daily with premium wheat flour and kansui. Perfectly chewy texture that holds up to rich broths. Each pack serves 2. Cook fresh in 2-3 minutes.',
    shortDescription: 'House-made fresh noodles, serves 2',
    category: 'retail-product' as const,
    price: 8.99,
    images: [
      {
        url: 'https://placehold.co/800x800/black/white?text=Fresh+Noodles',
        alt: 'Fresh Ramen Noodles',
        isPrimary: true,
      },
    ],
    variants: [
      {
        name: '2-pack',
        sku: 'RTT-NOOD-2PK',
        price: 8.99,
        stock: 150,
        options: {},
      },
    ],
    isActive: true,
    isFeatured: false,
  },
  {
    name: 'House-Made Tare Sauce',
    slug: 'house-made-tare-sauce',
    description: 'Our secret tare (seasoning sauce) that brings ramen to life. Made with soy sauce, sake, mirin, and aromatics. Add to your homemade broth for authentic flavor. 250ml bottle.',
    shortDescription: 'Authentic seasoning sauce for ramen broth, 250ml',
    category: 'retail-product' as const,
    price: 12.99,
    images: [
      {
        url: 'https://placehold.co/800x800/black/white?text=Tare+Sauce',
        alt: 'House-Made Tare Sauce',
        isPrimary: true,
      },
    ],
    variants: [
      {
        name: '250ml',
        sku: 'RTT-TARE-250',
        price: 12.99,
        stock: 80,
        options: {},
      },
    ],
    isActive: true,
    isFeatured: false,
  },
  {
    name: 'Ramen Spice Mix',
    slug: 'ramen-spice-mix',
    description: 'Elevate your ramen game with our signature spice blend. Features toasted sesame, chili flakes, garlic, and seaweed. Perfect for adding heat and depth. 100g jar.',
    shortDescription: 'Signature spice blend for ramen, 100g',
    category: 'retail-product' as const,
    price: 6.99,
    images: [
      {
        url: 'https://placehold.co/800x800/black/white?text=Spice+Mix',
        alt: 'Ramen Spice Mix',
        isPrimary: true,
      },
    ],
    variants: [
      {
        name: '100g',
        sku: 'RTT-SPICE-100',
        price: 6.99,
        stock: 120,
        options: {},
      },
    ],
    isActive: true,
    isFeatured: false,
  },

  // Merchandise
  {
    name: 'RTT Black T-Shirt',
    slug: 'rtt-black-tshirt',
    description: 'Premium cotton t-shirt featuring our "Respect the Technique" logo. Ultra-soft fabric with a classic fit. Available in multiple sizes. Show your ramen pride!',
    shortDescription: 'Premium cotton tee with RTT logo',
    category: 'merchandise' as const,
    price: 24.99,
    images: [
      {
        url: 'https://placehold.co/800x800/black/white?text=RTT+Shirt',
        alt: 'RTT Black T-Shirt',
        isPrimary: true,
      },
    ],
    variants: [
      {
        name: 'Small',
        sku: 'RTT-SHIRT-S',
        price: 24.99,
        stock: 30,
        options: {},
      },
      {
        name: 'Medium',
        sku: 'RTT-SHIRT-M',
        price: 24.99,
        stock: 50,
        options: {},
      },
      {
        name: 'Large',
        sku: 'RTT-SHIRT-L',
        price: 24.99,
        stock: 50,
        options: {},
      },
      {
        name: 'X-Large',
        sku: 'RTT-SHIRT-XL',
        price: 24.99,
        stock: 40,
        options: {},
      },
    ],
    isActive: true,
    isFeatured: false,
  },
  {
    name: 'Authentic Ramen Bowl Set',
    slug: 'authentic-ramen-bowl-set',
    description: 'Professional-grade ceramic ramen bowl set. Includes 2 large bowls, 2 pairs of chopsticks, and 2 soup spoons. Deep bowl design holds generous portions. Microwave and dishwasher safe.',
    shortDescription: 'Ceramic bowl set for 2 with chopsticks and spoons',
    category: 'merchandise' as const,
    price: 49.99,
    images: [
      {
        url: 'https://placehold.co/800x800/black/white?text=Bowl+Set',
        alt: 'Ramen Bowl Set',
        isPrimary: true,
      },
    ],
    variants: [
      {
        name: 'Set of 2',
        sku: 'RTT-BOWL-SET2',
        price: 49.99,
        stock: 35,
        options: {},
      },
    ],
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'Premium Chopstick Set',
    slug: 'premium-chopstick-set',
    description: 'Hand-crafted wooden chopsticks with elegant black finish. Set of 4 pairs. Perfect weight and balance for noodle eating. Comes in a beautiful gift box.',
    shortDescription: 'Hand-crafted wooden chopsticks, 4 pairs',
    category: 'merchandise' as const,
    price: 15.99,
    images: [
      {
        url: 'https://placehold.co/800x800/black/white?text=Chopsticks',
        alt: 'Premium Chopstick Set',
        isPrimary: true,
      },
    ],
    variants: [
      {
        name: 'Set of 4',
        sku: 'RTT-CHOP-SET4',
        price: 15.99,
        stock: 60,
        options: {},
      },
    ],
    isActive: true,
    isFeatured: false,
  },
];

async function seedProducts() {
  try {
    console.log('🌱 Connecting to MongoDB...');
    await connectDB();

    console.log('🗑️  Clearing existing products...');
    await Product.deleteMany({});

    console.log('📝 Creating products...');
    const createdProducts = await Product.insertMany(products);

    console.log(`✅ Successfully created ${createdProducts.length} products!`);
    console.log('\nProduct Summary:');
    console.log(`- Ramen Bowls: ${createdProducts.filter(p => p.category === 'ramen-bowl').length}`);
    console.log(`- Retail Products: ${createdProducts.filter(p => p.category === 'retail-product').length}`);
    console.log(`- Merchandise: ${createdProducts.filter(p => p.category === 'merchandise').length}`);
    console.log(`- Featured Products: ${createdProducts.filter(p => p.isFeatured).length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    process.exit(1);
  }
}

seedProducts();
