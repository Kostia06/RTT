'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { RecipeDifficulty, RECIPE_DIFFICULTIES } from '@/types/recipe';
import MultiImageUpload, { UploadedImage } from '@/components/ui/MultiImageUpload';

interface RecipeIngredient {
  name: string;
  amount: string;
  unit?: string;
  notes?: string;
}

interface RecipeInstruction {
  step: number;
  instruction: string;
  duration?: number;
}

export default function EditRecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { isAuthenticated, isEmployee, isLoading } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [recipeId, setRecipeId] = useState<string>('');

  // Form state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<RecipeDifficulty>('Medium');
  const [servings, setServings] = useState('2');
  const [tips, setTips] = useState('');
  const [active, setActive] = useState(true);
  const [featured, setFeatured] = useState(false);

  // Dynamic fields
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([
    { name: '', amount: '', unit: '', notes: '' }
  ]);
  const [instructions, setInstructions] = useState<RecipeInstruction[]>([
    { step: 1, instruction: '', duration: undefined }
  ]);
  const [images, setImages] = useState<UploadedImage[]>([
    { url: '', alt: '', isPrimary: true }
  ]);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isEmployee)) {
      router.push('/login?redirect=/manage-recipes');
    }
  }, [isAuthenticated, isEmployee, isLoading, router]);

  // Load recipe data
  useEffect(() => {
    const loadRecipe = async () => {
      try {
        const resolvedParams = await params;
        const id = resolvedParams.id;
        setRecipeId(id);

        const response = await fetch(`/api/recipes/${id}`);
        if (!response.ok) {
          throw new Error('Recipe not found');
        }

        const data = await response.json();
        const recipe = data.recipe;

        // Populate form with existing data
        setTitle(recipe.title);
        setSlug(recipe.slug);
        setDescription(recipe.description || '');
        setDifficulty(recipe.difficulty);
        setServings(recipe.servings?.toString() || '2');
        setTips(recipe.tips || '');
        setActive(recipe.active);
        setFeatured(recipe.featured);

        // Set ingredients
        if (recipe.ingredients && recipe.ingredients.length > 0) {
          setIngredients(recipe.ingredients);
        }

        // Set instructions
        if (recipe.instructions && recipe.instructions.length > 0) {
          setInstructions(recipe.instructions);
        }

        // Set images
        if (recipe.images && recipe.images.length > 0) {
          setImages(recipe.images);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error loading recipe:', error);
        alert('Failed to load recipe');
        router.push('/manage-recipes');
      }
    };

    if (!isLoading && isAuthenticated && isEmployee) {
      loadRecipe();
    }
  }, [params, isLoading, isAuthenticated, isEmployee, router]);

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', amount: '', unit: '', notes: '' }]);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const updateIngredient = (index: number, field: keyof RecipeIngredient, value: string) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  const addInstruction = () => {
    setInstructions([
      ...instructions,
      { step: instructions.length + 1, instruction: '', duration: undefined }
    ]);
  };

  const removeInstruction = (index: number) => {
    if (instructions.length > 1) {
      const updated = instructions.filter((_, i) => i !== index);
      // Renumber steps
      updated.forEach((inst, i) => inst.step = i + 1);
      setInstructions(updated);
    }
  };

  const updateInstruction = (index: number, field: keyof RecipeInstruction, value: string | number) => {
    const updated = [...instructions];
    updated[index] = { ...updated[index], [field]: value };
    setInstructions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Filter out empty ingredients and instructions
      const validIngredients = ingredients.filter(ing => ing.name && ing.amount);
      const validInstructions = instructions.filter(inst => inst.instruction);
      const validImages = images.filter(img => img.url);

      if (validIngredients.length === 0) {
        alert('Please add at least one ingredient');
        setSubmitting(false);
        return;
      }

      if (validInstructions.length === 0) {
        alert('Please add at least one instruction');
        setSubmitting(false);
        return;
      }

      const response = await fetch(`/api/recipes/${recipeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug,
          description,
          difficulty,
          servings: parseInt(servings),
          ingredients: validIngredients,
          instructions: validInstructions,
          images: validImages,
          tips,
          active,
          featured,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/manage-recipes');
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error updating recipe:', error);
      alert('Failed to update recipe');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-white pt-24 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-24 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-black mb-2">
            Edit Recipe
          </h1>
          <p className="text-gray-600">
            Update your recipe details and save changes
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white p-6 md:p-8 shadow-sm border border-gray-200">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-black text-white flex items-center justify-center text-sm font-bold">
                1
              </span>
              Basic Information
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Recipe Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 focus:outline-none focus:border-black transition-colors text-base"
                  placeholder="e.g., Spicy Tonkotsu Ramen with Chashu Pork"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  URL Slug *
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 focus:outline-none focus:border-black transition-colors text-base"
                  placeholder="e.g., spicy-tonkotsu-ramen-with-chashu-pork"
                />
                <p className="text-xs text-gray-500 mt-1.5">
                  This is the recipe&apos;s URL. Be careful when changing it.
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 focus:outline-none focus:border-black transition-colors text-base resize-none"
                  placeholder="Write a compelling description that will make people want to try this recipe..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Difficulty Level *
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as RecipeDifficulty)}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 focus:outline-none focus:border-black transition-colors text-base"
                  >
                    {RECIPE_DIFFICULTIES.map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Number of Servings *
                  </label>
                  <input
                    type="number"
                    value={servings}
                    onChange={(e) => setServings(e.target.value)}
                    required
                    min="1"
                    max="50"
                    className="w-full px-4 py-3 border-2 border-gray-200 focus:outline-none focus:border-black transition-colors text-base"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Ingredients */}
          <div className="bg-white p-6 md:p-8 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black flex items-center gap-2">
                <span className="w-8 h-8 bg-black text-white flex items-center justify-center text-sm font-bold">
                  2
                </span>
                Ingredients *
              </h2>
              <button
                type="button"
                onClick={addIngredient}
                className="px-4 py-2 bg-black text-white text-sm font-bold hover:bg-gray-800 transition-colors"
              >
                + Add Ingredient
              </button>
            </div>

            <div className="space-y-3">
              {ingredients.map((ingredient, index) => (
                <div key={index} className="flex gap-2 p-3 bg-gray-50 border border-gray-200">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-2">
                    <input
                      type="text"
                      value={ingredient.name}
                      onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                      placeholder="Ingredient name *"
                      className="md:col-span-4 px-3 py-2 border border-gray-300 focus:outline-none focus:border-black text-sm"
                    />
                    <input
                      type="text"
                      value={ingredient.amount}
                      onChange={(e) => updateIngredient(index, 'amount', e.target.value)}
                      placeholder="Amount *"
                      className="md:col-span-2 px-3 py-2 border border-gray-300 focus:outline-none focus:border-black text-sm"
                    />
                    <input
                      type="text"
                      value={ingredient.unit || ''}
                      onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                      placeholder="Unit (e.g., cups)"
                      className="md:col-span-2 px-3 py-2 border border-gray-300 focus:outline-none focus:border-black text-sm"
                    />
                    <input
                      type="text"
                      value={ingredient.notes || ''}
                      onChange={(e) => updateIngredient(index, 'notes', e.target.value)}
                      placeholder="Notes (optional)"
                      className="md:col-span-4 px-3 py-2 border border-gray-300 focus:outline-none focus:border-black text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    disabled={ingredients.length === 1}
                    className="flex-shrink-0 px-3 py-2 text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Remove ingredient"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-white p-6 md:p-8 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black flex items-center gap-2">
                <span className="w-8 h-8 bg-black text-white flex items-center justify-center text-sm font-bold">
                  3
                </span>
                Instructions *
              </h2>
              <button
                type="button"
                onClick={addInstruction}
                className="px-4 py-2 bg-black text-white text-sm font-bold hover:bg-gray-800 transition-colors"
              >
                + Add Step
              </button>
            </div>

            <div className="space-y-4">
              {instructions.map((instruction, index) => (
                <div key={index} className="flex gap-3 p-4 bg-gray-50 border border-gray-200">
                  <div className="flex-shrink-0 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-black text-sm">
                    {instruction.step}
                  </div>
                  <div className="flex-1 space-y-2">
                    <textarea
                      value={instruction.instruction}
                      onChange={(e) => updateInstruction(index, 'instruction', e.target.value)}
                      placeholder="Describe this step in detail..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-black text-sm resize-none"
                    />
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-medium text-gray-700">
                        Duration (optional):
                      </label>
                      <input
                        type="number"
                        value={instruction.duration || ''}
                        onChange={(e) => updateInstruction(index, 'duration', e.target.value ? parseInt(e.target.value) : '')}
                        placeholder="Minutes"
                        min="0"
                        className="w-24 px-3 py-1.5 border border-gray-300 focus:outline-none focus:border-black text-sm"
                      />
                      <span className="text-xs text-gray-500">minutes</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeInstruction(index)}
                    disabled={instructions.length === 1}
                    className="flex-shrink-0 px-2 py-2 text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Remove step"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Images */}
          <div className="bg-white p-6 md:p-8 shadow-sm border border-gray-200">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-black text-white flex items-center justify-center text-sm font-bold">
                4
              </span>
              Recipe Images
            </h2>
            <MultiImageUpload
              images={images}
              onChange={setImages}
              folder="recipes"
              maxImages={8}
            />
          </div>

          {/* Tips */}
          <div className="bg-white p-6 md:p-8 shadow-sm border border-gray-200">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-black text-white flex items-center justify-center text-sm font-bold">
                5
              </span>
              Cooking Tips & Notes
            </h2>
            <textarea
              value={tips}
              onChange={(e) => setTips(e.target.value)}
              rows={5}
              className="w-full px-4 py-3 border-2 border-gray-200 focus:outline-none focus:border-black transition-colors text-base resize-none"
              placeholder="Share helpful tips, tricks, substitutions, or serving suggestions..."
            />
          </div>

          {/* Settings */}
          <div className="bg-white p-6 md:p-8 shadow-sm border border-gray-200">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-black text-white flex items-center justify-center text-sm font-bold">
                6
              </span>
              Publishing Settings
            </h2>

            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-5 h-5 mt-0.5"
                />
                <div>
                  <span className="text-base font-bold text-gray-900 group-hover:text-black">
                    Active (Visible on Website)
                  </span>
                  <p className="text-sm text-gray-600 mt-0.5">
                    When checked, this recipe will be visible to all visitors on your public recipes page
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-5 h-5 mt-0.5"
                />
                <div>
                  <span className="text-base font-bold text-gray-900 group-hover:text-black">
                    Featured Recipe
                  </span>
                  <p className="text-sm text-gray-600 mt-0.5">
                    Featured recipes will be highlighted on the homepage and at the top of the recipes list
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-4 bg-black text-white font-black text-base hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Saving Changes...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-8 py-4 border-2 border-gray-300 text-gray-700 font-bold text-base hover:border-black hover:text-black transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
