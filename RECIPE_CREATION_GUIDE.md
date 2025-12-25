# Recipe Creation Quick Guide

## Ways to Create New Recipes

You now have **multiple easy ways** to create new recipes:

### 1. Employee Dashboard Card (Recommended)
- **Path**: Login → Dashboard
- **Location**: Employee Dashboard
- Click on the **"Manage Recipes"** card
- Then click **"+ Create Recipe"** button

### 2. Direct Navigation
- **URL**: `http://localhost:3000/manage-recipes`
- Click the **"+ Create Recipe"** button in the header

### 3. Mobile Floating Action Button (FAB)
- **Path**: `/manage-recipes` on mobile
- Look for the **black circular button** at bottom-right
- Tap the **+** icon to create instantly

### 4. Direct URL
- **URL**: `http://localhost:3000/manage-recipes/create`
- Go directly to the creation form

---

## Recipe Creation Form Features

### Basic Information
- **Recipe Title** - Auto-generates URL slug
- **Description** - Brief overview of the dish
- **Difficulty Level** - Easy, Medium, Hard
- **Servings** - Number of people served
- **Prep Time** - Minutes to prepare
- **Cook Time** - Minutes to cook

### Dynamic Ingredients
- **Add/Remove** - Unlimited ingredients
- **Fields**:
  - Name (required)
  - Amount (required)
  - Unit (optional)
  - Notes (optional)

### Step-by-Step Instructions
- **Auto-numbered steps**
- **Add/Remove** - Unlimited steps
- **Duration** - Time per step (optional)

### Images
- **Multiple images** supported
- **Primary image** selection
- **URL-based** (upload feature coming soon)
- **Placeholders**: Use https://via.placeholder.com/800x600

### Publishing Options
- **Active** - Make visible on public recipes page
- **Featured** - Highlight in featured section
- **Tips** - Cooking advice and substitutions

---

## Recipe Management Features

### View All Recipes
- **Filters**: All / Active / Inactive
- **Stats**: Total, Active, Featured counts
- **Search**: By title or ingredients (coming soon)

### Actions Per Recipe
- **View** - See public recipe page
- **Edit** - Modify any recipe details
- **Delete** - Remove with confirmation

### Quick Stats Dashboard
- **Total Recipes** - All recipes in system
- **Active Recipes** - Currently published
- **Featured Recipes** - Highlighted on homepage

---

## Access Control

### Who Can Create Recipes?
- ✅ **Employees** - Full access
- ✅ **Admins** - Full access
- ❌ **Customers** - Read-only (active recipes)
- ❌ **Public** - Read-only (active recipes)

### Permissions
- **Create** - Employees & Admins
- **Edit** - Employees & Admins
- **Delete** - Employees & Admins
- **Publish/Unpublish** - Employees & Admins
- **View Inactive** - Employees & Admins only

---

## Tips for Creating Great Recipes

### 1. Clear Titles
```
✅ "Spicy Tonkotsu Ramen with Chashu Pork"
❌ "My Recipe"
```

### 2. Accurate Measurements
```
✅ "2 cups" or "500ml"
❌ "Some" or "A bit"
```

### 3. Detailed Instructions
```
✅ "Simmer broth for 18 hours at 200°F, stirring every 2 hours"
❌ "Cook for a while"
```

### 4. Quality Images
```
✅ High-res (800x600+), well-lit, focused
❌ Blurry, dark, or low-resolution
```

### 5. Helpful Tips
```
✅ "Can substitute chicken for pork"
✅ "Best served immediately"
✅ "Freeze leftover broth for up to 3 months"
```

---

## Workflow Example

1. **Login** as employee
2. **Navigate** to Dashboard
3. **Click** "Manage Recipes" card
4. **Click** "+ Create Recipe" button
5. **Fill in** basic information
6. **Add** ingredients one by one
7. **Write** step-by-step instructions
8. **Add** image URLs
9. **Write** cooking tips
10. **Toggle** Active/Featured as needed
11. **Click** "Create Recipe"
12. **Done!** Recipe is now live (if active)

---

## Troubleshooting

### Can't create recipes?
- ✅ Ensure you're logged in
- ✅ Verify your role is "employee" or "admin"
- ✅ Check RLS policies are set up (see RECIPES_SETUP.md)

### Recipe not showing on public page?
- ✅ Make sure "Active" is checked
- ✅ Clear browser cache
- ✅ Verify recipe was saved successfully

### Images not loading?
- ✅ Use direct image URLs (not file uploads yet)
- ✅ Ensure URL is publicly accessible
- ✅ Use https:// URLs (not http://)

---

## Coming Soon

- 📸 **Image Upload** - Direct file upload instead of URLs
- 🔍 **Search & Filter** - Find recipes by ingredients
- 📊 **Analytics** - Track recipe views and popularity
- 🏷️ **Tags** - Categorize by cuisine, diet, etc.
- 📝 **Drafts** - Save work-in-progress recipes
- 🔄 **Version History** - Track recipe changes
- ⭐ **Reviews** - Customer ratings and feedback
