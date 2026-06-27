import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { products, recipes, user } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireRole } from '@/lib/auth/guards';
import type { SessionUser } from '@/lib/auth/guards';
import { generateContentWithFunctions } from '@/lib/gemini/client';

type Db = Awaited<ReturnType<typeof getDb>>;

// Define available functions the AI can call
const availableFunctions = [
  {
    name: 'create_recipe',
    description: 'Create a new recipe with ingredients, instructions, and optional images',
    parameters: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'The recipe title',
        },
        slug: {
          type: 'string',
          description: 'URL-friendly slug (lowercase, hyphens instead of spaces)',
        },
        description: {
          type: 'string',
          description: 'Brief description of the recipe',
        },
        difficulty: {
          type: 'string',
          enum: ['Easy', 'Medium', 'Hard'],
          description: 'Difficulty level',
        },
        servings: {
          type: 'number',
          description: 'Number of servings',
        },
        ingredients: {
          type: 'array',
          description: 'List of ingredients',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              amount: { type: 'string' },
              unit: { type: 'string' },
              notes: { type: 'string' },
            },
            required: ['name', 'amount'],
          },
        },
        instructions: {
          type: 'array',
          description: 'Step-by-step instructions',
          items: {
            type: 'object',
            properties: {
              step: { type: 'number' },
              instruction: { type: 'string' },
              duration: { type: 'number' },
            },
            required: ['step', 'instruction'],
          },
        },
        tips: {
          type: 'string',
          description: 'Optional cooking tips',
        },
        featured: {
          type: 'boolean',
          description: 'Whether to feature this recipe',
        },
      },
      required: ['title', 'slug', 'difficulty', 'servings', 'ingredients', 'instructions'],
    },
  },
  {
    name: 'create_product',
    description: 'Create a new product for the shop',
    parameters: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Product name',
        },
        slug: {
          type: 'string',
          description: 'URL-friendly slug',
        },
        description: {
          type: 'string',
          description: 'Product description',
        },
        price_regular: {
          type: 'number',
          description: 'Regular price',
        },
        category: {
          type: 'string',
          enum: ['ramen-bowl', 'retail-product', 'merchandise'],
          description: 'Product category',
        },
        stock_quantity: {
          type: 'number',
          description: 'Initial stock quantity',
        },
        is_featured: {
          type: 'boolean',
          description: 'Whether to feature this product',
        },
      },
      required: ['name', 'slug', 'price_regular', 'category', 'stock_quantity'],
    },
  },
  {
    name: 'approve_user',
    description: 'Approve a user and set their role',
    parameters: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'User email address',
        },
        role: {
          type: 'string',
          enum: ['customer', 'employee', 'admin'],
          description: 'Role to assign',
        },
      },
      required: ['email', 'role'],
    },
  },
  {
    name: 'update_inventory',
    description: 'Update product inventory quantity',
    parameters: {
      type: 'object',
      properties: {
        product_slug: {
          type: 'string',
          description: 'Product slug to update',
        },
        quantity: {
          type: 'number',
          description: 'New quantity',
        },
      },
      required: ['product_slug', 'quantity'],
    },
  },
  {
    name: 'delete_product',
    description: 'Delete a product from the shop',
    parameters: {
      type: 'object',
      properties: {
        slug: {
          type: 'string',
          description: 'Product slug to delete',
        },
      },
      required: ['slug'],
    },
  },
  {
    name: 'delete_recipe',
    description: 'Delete a recipe',
    parameters: {
      type: 'object',
      properties: {
        slug: {
          type: 'string',
          description: 'Recipe slug to delete',
        },
      },
      required: ['slug'],
    },
  },
  {
    name: 'update_product',
    description: 'Update product details (for shop/store items for sale, retail products, merchandise). Use this for items found at /shop, NOT for recipes.',
    parameters: {
      type: 'object',
      properties: {
        slug: {
          type: 'string',
          description: 'Product slug (URL-friendly version)',
        },
        name: { type: 'string', description: 'Product name' },
        price_regular: { type: 'number', description: 'Regular price in dollars' },
        description: { type: 'string' },
        is_featured: { type: 'boolean' },
      },
      required: ['slug'],
    },
  },
  {
    name: 'update_recipe',
    description: 'Update recipe details (for dishes/food recipes like ramen recipes, cooking instructions). Use this for items found at /recipes like "Rayu Island", "Tonkotsu Ramen", etc.',
    parameters: {
      type: 'object',
      properties: {
        slug: {
          type: 'string',
          description: 'Recipe slug (URL-friendly version of recipe name)',
        },
        title: {
          type: 'string',
          description: 'Recipe title/name'
        },
        description: { type: 'string' },
        difficulty: {
          type: 'string',
          enum: ['Easy', 'Medium', 'Hard'],
        },
        servings: { type: 'number' },
        featured: { type: 'boolean' },
      },
      required: ['slug'],
    },
  },
];

export async function POST(request: Request) {
  try {
    // Employee tool (linked from the employee dashboard) — require employee role.
    const gate = await requireRole(request, 'employee');
    if (gate.error) return gate.error;
    const { user } = gate;

    const db = await getDb();

    const body = await request.json();
    const { message, images, action } = body;

    // If action is provided, execute it (after user confirmation)
    if (action) {
      return await executeAction(action, db, user);
    }

    // Otherwise, generate AI response with function calling
    const systemPrompt = `You are an AI assistant helping employees at Ramen To The People restaurant.
You can help with:
- Creating recipes (with ingredients, instructions, images)
- Creating products for the shop
- Deleting products or recipes
- Updating recipe details (like "Rayu Island", "Tonkotsu Ramen" - these are RECIPES, not products)
- Updating product details (shop items for sale)
- Approving users and setting their roles
- Updating inventory quantities

IMPORTANT:
- Recipes are dishes/food items found at /recipes (like "Rayu Island", ramen bowls, etc.)
- Products are items for sale in the shop at /shop
- When updating recipes, convert the name to a slug (lowercase, hyphens instead of spaces)
  Example: "Rayu Island" → slug: "rayu-island"

When a user asks you to perform an action, use the appropriate function call.
Be conversational and helpful. Ask for clarification if needed.
When creating recipes or products, extract all relevant information from the user's message and images.

Current user: ${user.name || user.email}
User role: ${user.role || 'employee'}`;

    const fullPrompt = `${systemPrompt}\n\nUser: ${message}`;

    // Convert images to proper format
    const imageData = images?.map((img: any) => ({
      mimeType: img.mimeType,
      data: img.data.split(',')[1], // Remove data:image/jpeg;base64, prefix
    }));

    const response = await generateContentWithFunctions(
      fullPrompt,
      availableFunctions,
      imageData
    );

    // Check if AI wants to call a function
    const functionCalls = response.functionCalls;
    const functionCall = functionCalls && functionCalls.length > 0 ? functionCalls[0] : null;

    if (functionCall && functionCall.name) {
      // Return the proposed action for user confirmation
      return NextResponse.json({
        type: 'function_call',
        function: functionCall.name,
        arguments: functionCall.args,
        message: `I can help you with that. Here's what I'll do:\n\n${formatActionPreview(
          functionCall.name,
          functionCall.args
        )}\n\nWould you like me to proceed?`,
      });
    }

    // Return regular text response
    return NextResponse.json({
      type: 'text',
      message: response.text || '',
    });
  } catch (error) {
    console.error('AI Assistant error:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

function formatActionPreview(functionName: string, args: any): string {
  switch (functionName) {
    case 'create_recipe':
      return `**Create Recipe: ${args.title}**
- Difficulty: ${args.difficulty}
- Servings: ${args.servings}
- ${args.ingredients.length} ingredients
- ${args.instructions.length} steps
${args.featured ? '- Will be featured ⭐' : ''}`;

    case 'create_product':
      return `**Create Product: ${args.name}**
- Category: ${args.category}
- Price: $${args.price_regular}
- Initial stock: ${args.stock_quantity}
${args.is_featured ? '- Will be featured ⭐' : ''}`;

    case 'delete_product':
      return `**Delete Product**
- Product: ${args.slug}
⚠️ This action cannot be undone`;

    case 'delete_recipe':
      return `**Delete Recipe**
- Recipe: ${args.slug}
⚠️ This action cannot be undone`;

    case 'update_product':
      return `**Update Product: ${args.slug}**
${args.name ? `- Name: ${args.name}` : ''}
${args.price_regular ? `- Price: $${args.price_regular}` : ''}
${args.description ? `- Description updated` : ''}
${args.is_featured !== undefined ? `- Featured: ${args.is_featured}` : ''}`;

    case 'update_recipe':
      return `**Update Recipe: ${args.slug}**
${args.title ? `- Title: ${args.title}` : ''}
${args.difficulty ? `- Difficulty: ${args.difficulty}` : ''}
${args.servings ? `- Servings: ${args.servings}` : ''}
${args.description ? `- Description updated` : ''}
${args.featured !== undefined ? `- Featured: ${args.featured}` : ''}`;

    case 'approve_user':
      return `**Approve User**
- Email: ${args.email}
- Role: ${args.role}`;

    case 'update_inventory':
      return `**Update Inventory**
- Product: ${args.product_slug}
- New quantity: ${args.quantity}`;

    default:
      return JSON.stringify(args, null, 2);
  }
}

async function executeAction(action: any, db: Db, user: SessionUser) {
  const { function: functionName, arguments: args } = action;

  try {
    switch (functionName) {
      case 'create_recipe':
        return await createRecipe(args, db);

      case 'create_product':
        return await createProduct(args, db);

      case 'delete_product':
        return await deleteProduct(args, db);

      case 'delete_recipe':
        return await deleteRecipe(args, db);

      case 'update_product':
        return await updateProduct(args, db);

      case 'update_recipe':
        return await updateRecipe(args, db);

      case 'approve_user':
        // Check if user is admin
        if (user.role !== 'admin') {
          return NextResponse.json(
            { error: 'Only admins can approve users' },
            { status: 403 }
          );
        }
        return await approveUser(args, db);

      case 'update_inventory':
        return await updateInventory(args, db);

      default:
        return NextResponse.json({ error: 'Unknown function' }, { status: 400 });
    }
  } catch (error) {
    console.error('Action execution error:', error);
    return NextResponse.json(
      { error: 'Failed to execute action', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function createRecipe(args: any, db: Db) {
  const now = new Date().toISOString();
  const [recipe] = await db
    .insert(recipes)
    .values({
      id: crypto.randomUUID(),
      title: args.title,
      slug: args.slug,
      description: args.description,
      difficulty: args.difficulty,
      servings: args.servings,
      ingredients: args.ingredients,
      instructions: args.instructions,
      images: args.images || [],
      tips: args.tips,
      active: true,
      featured: args.featured || false,
      created_at: now,
      updated_at: now,
    })
    .returning();

  return NextResponse.json({
    type: 'success',
    message: `✅ Recipe "${args.title}" created successfully!`,
    data: { id: recipe.id, slug: recipe.slug },
    link: `/recipes/${recipe.slug}`,
  });
}

async function createProduct(args: any, db: Db) {
  const now = new Date().toISOString();
  const [product] = await db
    .insert(products)
    .values({
      id: crypto.randomUUID(),
      name: args.name,
      slug: args.slug,
      // `sku` is required (notNull). The AI create_product schema has no sku,
      // so derive a stable one from the slug.
      sku: args.sku || args.slug.toUpperCase(),
      description: args.description,
      price_regular: args.price_regular,
      category: args.category,
      stock: args.stock_quantity,
      images: args.images || [],
      active: true,
      featured: args.is_featured || false,
      created_at: now,
      updated_at: now,
    })
    .returning();

  return NextResponse.json({
    type: 'success',
    message: `✅ Product "${args.name}" created successfully!`,
    data: { id: product.id, slug: product.slug },
    link: `/shop/${product.slug}`,
  });
}

async function approveUser(args: any, db: Db) {
  // Find user by email
  const [targetUser] = await db
    .select()
    .from(user)
    .where(eq(user.email, args.email))
    .limit(1);

  if (!targetUser) {
    throw new Error('User not found');
  }

  // Set the user's role (approval == having a non-customer role assigned).
  await db
    .update(user)
    .set({ role: args.role, updatedAt: new Date() })
    .where(eq(user.id, targetUser.id));

  return NextResponse.json({
    type: 'success',
    message: `✅ User ${args.email} approved as ${args.role}!`,
  });
}

async function updateInventory(args: any, db: Db) {
  const [product] = await db
    .update(products)
    .set({ stock: args.quantity, updated_at: new Date().toISOString() })
    .where(eq(products.slug, args.product_slug))
    .returning();

  if (!product) {
    throw new Error('Product not found');
  }

  return NextResponse.json({
    type: 'success',
    message: `✅ Inventory updated for ${product.name}: ${args.quantity} units`,
    data: { id: product.id, stock_quantity: product.stock },
  });
}

async function deleteProduct(args: any, db: Db) {
  await db.delete(products).where(eq(products.slug, args.slug));

  return NextResponse.json({
    type: 'success',
    message: `✅ Product "${args.slug}" has been deleted successfully`,
  });
}

async function deleteRecipe(args: any, db: Db) {
  await db.delete(recipes).where(eq(recipes.slug, args.slug));

  return NextResponse.json({
    type: 'success',
    message: `✅ Recipe "${args.slug}" has been deleted successfully`,
  });
}

async function updateProduct(args: any, db: Db) {
  const updateData: Partial<typeof products.$inferInsert> = {
    updated_at: new Date().toISOString(),
  };

  if (args.name) updateData.name = args.name;
  if (args.price_regular) updateData.price_regular = args.price_regular;
  if (args.description) updateData.description = args.description;
  if (args.is_featured !== undefined) updateData.featured = args.is_featured;

  const [product] = await db
    .update(products)
    .set(updateData)
    .where(eq(products.slug, args.slug))
    .returning();

  if (!product) {
    throw new Error('Product not found');
  }

  return NextResponse.json({
    type: 'success',
    message: `✅ Product "${product.name}" has been updated successfully`,
    link: `/shop/${product.slug}`,
  });
}

async function updateRecipe(args: any, db: Db) {
  const updateData: Partial<typeof recipes.$inferInsert> = {
    updated_at: new Date().toISOString(),
  };

  if (args.title) updateData.title = args.title;
  if (args.description) updateData.description = args.description;
  if (args.difficulty) updateData.difficulty = args.difficulty;
  if (args.servings) updateData.servings = args.servings;
  if (args.featured !== undefined) updateData.featured = args.featured;

  const [recipe] = await db
    .update(recipes)
    .set(updateData)
    .where(eq(recipes.slug, args.slug))
    .returning();

  if (!recipe) {
    throw new Error('Recipe not found');
  }

  return NextResponse.json({
    type: 'success',
    message: `✅ Recipe "${recipe.title}" has been updated successfully`,
    link: `/recipes/${recipe.slug}`,
  });
}
