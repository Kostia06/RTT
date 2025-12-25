import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateContentWithFunctions } from '@/lib/gemini/client';

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
];

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { message, images, action } = body;

    // If action is provided, execute it (after user confirmation)
    if (action) {
      return await executeAction(action, supabase, user);
    }

    // Otherwise, generate AI response with function calling
    const systemPrompt = `You are an AI assistant helping employees at Ramen To The People restaurant.
You can help with:
- Creating recipes (with ingredients, instructions, images)
- Creating products for the shop
- Approving users and setting their roles
- Updating inventory quantities

When a user asks you to perform an action, use the appropriate function call.
Be conversational and helpful. Ask for clarification if needed.
When creating recipes or products, extract all relevant information from the user's message and images.

Current user: ${user.user_metadata?.name || user.email}
User role: ${user.user_metadata?.role || 'employee'}`;

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
    const functionCall = response.functionCalls()?.[0];

    if (functionCall) {
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
      message: response.text(),
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

async function executeAction(action: any, supabase: any, user: any) {
  const { function: functionName, arguments: args } = action;

  try {
    switch (functionName) {
      case 'create_recipe':
        return await createRecipe(args, supabase);

      case 'create_product':
        return await createProduct(args, supabase);

      case 'approve_user':
        // Check if user is admin
        if (user.user_metadata?.role !== 'admin') {
          return NextResponse.json(
            { error: 'Only admins can approve users' },
            { status: 403 }
          );
        }
        return await approveUser(args, supabase);

      case 'update_inventory':
        return await updateInventory(args, supabase);

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

async function createRecipe(args: any, supabase: any) {
  const { data: recipe, error } = await supabase
    .from('recipes')
    .insert({
      title: args.title,
      slug: args.slug,
      description: args.description,
      difficulty: args.difficulty,
      servings: args.servings,
      ingredients: JSON.stringify(args.ingredients),
      instructions: JSON.stringify(args.instructions),
      images: JSON.stringify(args.images || []),
      tips: args.tips,
      active: true,
      featured: args.featured || false,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return NextResponse.json({
    type: 'success',
    message: `✅ Recipe "${args.title}" created successfully!`,
    data: { id: recipe.id, slug: recipe.slug },
    link: `/recipes/${recipe.slug}`,
  });
}

async function createProduct(args: any, supabase: any) {
  const { data: product, error } = await supabase
    .from('products')
    .insert({
      name: args.name,
      slug: args.slug,
      description: args.description,
      price_regular: args.price_regular,
      category: args.category,
      stock_quantity: args.stock_quantity,
      images: JSON.stringify(args.images || []),
      active: true,
      is_featured: args.is_featured || false,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return NextResponse.json({
    type: 'success',
    message: `✅ Product "${args.name}" created successfully!`,
    data: { id: product.id, slug: product.slug },
    link: `/shop/${product.slug}`,
  });
}

async function approveUser(args: any, supabase: any) {
  // Find user by email
  const { data: users } = await supabase.auth.admin.listUsers();
  const targetUser = users?.users.find((u: any) => u.email === args.email);

  if (!targetUser) {
    throw new Error('User not found');
  }

  // Update user metadata
  const { error } = await supabase.auth.admin.updateUserById(targetUser.id, {
    user_metadata: {
      ...targetUser.user_metadata,
      role: args.role,
      approved: true,
    },
  });

  if (error) {
    throw error;
  }

  return NextResponse.json({
    type: 'success',
    message: `✅ User ${args.email} approved as ${args.role}!`,
  });
}

async function updateInventory(args: any, supabase: any) {
  const { data: product, error } = await supabase
    .from('products')
    .update({ stock_quantity: args.quantity })
    .eq('slug', args.product_slug)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return NextResponse.json({
    type: 'success',
    message: `✅ Inventory updated for ${product.name}: ${args.quantity} units`,
    data: { id: product.id, stock_quantity: product.stock_quantity },
  });
}
