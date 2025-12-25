// Recipe Difficulty Levels
export type RecipeDifficulty = 'Easy' | 'Medium' | 'Hard';

export const RECIPE_DIFFICULTIES: RecipeDifficulty[] = ['Easy', 'Medium', 'Hard'];

// Recipe Image
export interface RecipeImage {
  url: string;
  alt: string;
  isPrimary?: boolean;
}

// Recipe Ingredient
export interface RecipeIngredient {
  name: string;
  amount: string;
  unit?: string;
  notes?: string;
}

// Recipe Instruction Step
export interface RecipeInstruction {
  step: number;
  instruction: string;
  image?: string;
  duration?: number; // in minutes
}

// Nutritional Info (per serving)
export interface NutritionalInfo {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  sodium?: number;
  fiber?: number;
  [key: string]: number | undefined;
}

// Main Recipe Interface (matches Supabase schema)
export interface Recipe {
  id: string;
  title: string;
  slug: string;
  description?: string;
  difficulty: RecipeDifficulty;
  servings: number;
  ingredients: RecipeIngredient[];
  instructions: RecipeInstruction[];
  nutritional_info?: NutritionalInfo;
  images: RecipeImage[];
  tips?: string;
  active: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

// Recipe Card (for list views)
export interface RecipeCard {
  id: string;
  title: string;
  slug: string;
  description?: string;
  difficulty: RecipeDifficulty;
  servings: number;
  images: RecipeImage[];
  featured: boolean;
}

// Recipe Filter Options
export interface RecipeFilters {
  difficulty?: RecipeDifficulty;
  featured?: boolean;
}
