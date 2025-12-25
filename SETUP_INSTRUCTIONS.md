# Quick Setup Instructions

## 🚀 Immediate Next Steps

### 1. Run Database Migrations (REQUIRED)

Go to your Supabase Dashboard → SQL Editor and run these two scripts in order:

#### Step 1: Set Up Image Storage
```sql
-- Copy and paste contents from: /supabase/setup-storage.sql
-- This creates the images bucket and sets up permissions
```

#### Step 2: Remove Recipe Time Fields
```sql
-- Copy and paste contents from: /supabase/remove-recipe-time-fields.sql
-- This removes prep_time and cook_time columns from recipes table
```

### 2. Test Recipe Management

1. Login as an employee
2. Go to Dashboard → "Manage Recipes"
3. Click "+ Create Recipe"
4. Try uploading an image using drag-and-drop
5. Fill in the form (notice no prep/cook time fields)
6. Submit and verify it works

### 3. Remaining Work

The product management system needs these pages created:
- Product creation form (`/src/app/(employee)/manage-products/create/page.tsx`)
- Product edit form (`/src/app/(employee)/manage-products/edit/[id]/page.tsx`)

Refer to `UI_IMPROVEMENTS_SUMMARY.md` for detailed instructions and code patterns.

---

## ✅ What's Already Done

### Recipe Management
- ✅ Improved creation form with numbered sections
- ✅ Improved edit form matching new design
- ✅ Image upload component with drag-and-drop
- ✅ Removed prep_time and cook_time fields
- ✅ Updated API endpoints
- ✅ Updated listing page
- ✅ Mobile FAB button

### Product Management
- ✅ Product listing page with filters
- ✅ Quick stats dashboard
- ✅ Low stock warnings
- ⏳ Create form (needs to be built)
- ⏳ Edit form (needs to be built)

### Components
- ✅ ImageUpload component (single image)
- ✅ MultiImageUpload component (multiple images with primary selection)

---

## 📱 Testing on Mobile

Both recipe and product management have floating action buttons (FAB) on mobile:
- Black circular button at bottom-right
- Visible only on screens < 768px wide
- Click to quickly create new items

---

## 🎨 UI Consistency

All forms now follow the same design pattern:
- Numbered sections (1-6)
- Black and white color scheme
- Consistent spacing and typography
- Image upload instead of URL-only
- Better mobile responsiveness
- Clear labels and helper text

See `UI_IMPROVEMENTS_SUMMARY.md` for complete design system reference.
