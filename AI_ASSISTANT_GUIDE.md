# AI Assistant for Employee Dashboard

## Overview

The AI Assistant is powered by Google's Gemini AI and helps employees perform common tasks through natural language conversations. It can handle text and image inputs, and always asks for confirmation before executing actions.

## Features

### Supported Actions

1. **Create Recipes**
   - Accepts text descriptions and optional images
   - Extracts ingredients, instructions, difficulty, servings
   - Generates proper recipe format with slug

2. **Create Products**
   - Add new products to the shop
   - Set pricing, category, and stock levels
   - Support for product images

3. **Approve Users** (Admin only)
   - Approve pending users
   - Assign roles (customer, employee, admin)

4. **Update Inventory**
   - Modify stock quantities for products
   - Quick inventory adjustments

## Setup Instructions

### 1. Get Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key

### 2. Configure Environment Variables

Add the following to your `.env.local` file:

```bash
GEMINI_API_KEY=your_api_key_here
```

### 3. Verify Installation

The AI Assistant will automatically appear as a prominent section on the employee dashboard, right below the stats section.

## Usage Examples

### Creating a Recipe

**Example 1: Text Only**
```
User: "Create a recipe for Tonkotsu Ramen. It serves 4 people and is hard difficulty.
Ingredients: 2 lbs pork bones, 6 cups water, 4 packs fresh ramen noodles, 4 soft boiled eggs,
2 cups bean sprouts, 4 sheets nori.
Instructions: 1) Boil pork bones for 12 hours. 2) Cook noodles for 2 minutes. 3) Assemble bowls."

AI: [Extracts data and shows preview]
"I can help you with that. Here's what I'll do:

**Create Recipe: Tonkotsu Ramen**
- Difficulty: Hard
- Servings: 4
- 6 ingredients
- 3 steps

Would you like me to proceed?"

User: [Clicks Confirm]

AI: "✅ Recipe 'Tonkotsu Ramen' created successfully!"
```

**Example 2: With Images**
```
User: [Uploads 3 images of ramen] "Create a recipe for this Miso Ramen I made"

AI: [Analyzes images and generates recipe]
"Based on the images, I can see this is a Miso Ramen with corn, green onions, and chashu pork.
I'll create a recipe with these ingredients..."
```

### Creating a Product

```
User: "Add a new product: Organic Ramen Noodles, retail product, $8.99, 50 in stock"

AI: "I can help you with that. Here's what I'll do:

**Create Product: Organic Ramen Noodles**
- Category: retail-product
- Price: $8.99
- Initial stock: 50

Would you like me to proceed?"
```

### Approving Users (Admin Only)

```
User: "Approve john@example.com as an employee"

AI: "I can help you with that. Here's what I'll do:

**Approve User**
- Email: john@example.com
- Role: employee

Would you like me to proceed?"
```

### Updating Inventory

```
User: "Update tonkotsu-ramen-kit to 25 units"

AI: "I can help you with that. Here's what I'll do:

**Update Inventory**
- Product: tonkotsu-ramen-kit
- New quantity: 25

Would you like me to proceed?"
```

## How It Works

### 1. Request Flow

```
User Input (text + images)
  → Gemini AI (with function calling)
  → Action Proposal
  → User Confirmation
  → Execute Action
  → Success Response
```

### 2. Function Calling

The AI uses Gemini's function calling feature to determine which action to take. When it detects an intent to perform an action, it:

1. Extracts relevant parameters
2. Validates the data
3. Shows a preview to the user
4. Waits for confirmation
5. Executes the action only after user approves

### 3. Safety Features

- **Always asks for confirmation** before executing any action
- **Shows preview** of what will be created/changed
- **Validates permissions** (e.g., only admins can approve users)
- **Error handling** with clear error messages
- **Rollback support** - can cancel at any time

## Technical Details

### Architecture

```
/src/lib/gemini/client.ts                      # Gemini API integration
/src/app/api/ai/assistant/route.ts             # API endpoint with function definitions
/src/components/employee/AIAssistantSection.tsx # Full dashboard section component
/src/app/(employee)/dashboard/page.tsx         # Dashboard with AI section integrated
```

### Function Definitions

Functions are defined in `/src/app/api/ai/assistant/route.ts`:

- `create_recipe`: Creates a new recipe in Supabase
- `create_product`: Creates a new product in Supabase
- `approve_user`: Approves a user and sets their role
- `update_inventory`: Updates product stock quantity

### Image Processing

Images are:
1. Converted to base64 format
2. Sent to Gemini Vision model
3. Analyzed for relevant content (ingredients, plating, presentation)
4. Used to enhance recipe/product creation

## Best Practices

### For Recipe Creation

- Be specific about difficulty level (Easy, Medium, Hard)
- Include exact measurements in ingredients
- Provide step-by-step instructions
- Upload high-quality images showing the final dish

### For Product Creation

- Use clear, descriptive product names
- Follow slug format: lowercase with hyphens
- Choose the correct category (ramen-bowl, retail-product, merchandise)
- Set realistic stock quantities

### For User Management

- Always verify email addresses before approving
- Choose appropriate roles based on responsibilities
- Only admins should approve other admins

## Troubleshooting

### AI Not Responding

- Check that GEMINI_API_KEY is set correctly
- Verify you're logged in as an employee
- Check browser console for errors

### Action Fails After Confirmation

- Check Supabase connection
- Verify user has necessary permissions
- Check for validation errors in response

### Images Not Processing

- Ensure images are in supported formats (JPG, PNG)
- Keep image file sizes under 10MB
- Upload images one at a time for better results

## UI Features

### Layout
- **Purple gradient header** with AI branding and online status indicator
- **Three-column responsive layout**:
  - Left/Main: Message history and conversation
  - Middle: Input area with image upload and send button
  - Right: Quick actions sidebar with tips and session stats
- **Border design** with bold black borders matching the site's aesthetic

### Quick Actions Sidebar
- **One-click templates** for common tasks:
  - Create Recipe
  - Add Product
  - Update Inventory
- **Helpful tips** about using the AI effectively
- **Session statistics** showing message count and attached images

### Message Display
- **User messages**: Black background with white text (right-aligned)
- **AI messages**: White background with border (left-aligned)
- **Image previews** in grid layout within messages
- **Action links** with "View Result" buttons for created items
- **Loading indicator** with animated bouncing dots

### Confirmation Dialog
- **Warning modal** with yellow alert icon
- **Preview of action** with all details clearly shown
- **Cancel or Confirm** buttons for safety
- **Overlay backdrop** to focus attention

### Animations
- **Smooth scroll** entrance animation with GSAP
- **Scale and fade-in** effect on page load
- **Message animations** as they appear in chat
- **Responsive transitions** throughout the interface

## Future Enhancements

Potential additions:
- Voice input support
- Recipe search and editing
- Bulk operations
- Analytics and reporting
- Multi-language support
- Suggested recipes based on inventory
- Export conversation history
- Keyboard shortcuts for power users
