'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { RecipeDifficulty, RECIPE_DIFFICULTIES } from '@/types/recipe';

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

interface RecipeImage {
  url: string;
  alt: string;
  isPrimary?: boolean;
}

export default function CreateRecipePage() {
  const { isAuthenticated, isEmployee, isLoading } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<RecipeDifficulty>('Medium');
  const [prepTime, setPrepTime] = useState('');
  const [cookTime, setCookTime] = useState('');
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
  const [images, setImages] = useState<RecipeImage[]>([
    { url: '', alt: '', isPrimary: true }
  ]);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isEmployee)) {
      router.push('/login?redirect=/manage-recipes/create');
    }
  }, [isAuthenticated, isEmployee, isLoading, router]);

  // Auto-generate slug from title
  useEffect(() => {
    if (title && !slug) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setSlug(generatedSlug);
    }
  }, [title]);

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', amount: '', unit: '', notes: '' }]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
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
    const updated = instructions.filter((_, i) => i !== index);
    // Renumber steps
    updated.forEach((inst, i) => inst.step = i + 1);
    setInstructions(updated);
  };

  const updateInstruction = (index: number, field: keyof RecipeInstruction, value: string | number) => {
    const updated = [...instructions];
    updated[index] = { ...updated[index], [field]: value };
    setInstructions(updated);
  };

  const addImage = () => {
    setImages([...images, { url: '', alt: '', isPrimary: false }]);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const updateImage = (index: number, field: keyof RecipeImage, value: string | boolean) => {
    const updated = [...images];
    if (field === 'isPrimary' && value === true) {
      // Only one primary image
      updated.forEach((img, i) => img.isPrimary = i === index);
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setImages(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Filter out empty ingredients and instructions
      const validIngredients = ingredients.filter(ing => ing.name && ing.amount);
      const validInstructions = instructions.filter(inst => inst.instruction);
      const validImages = images.filter(img => img.url);

      const response = await fetch('/api/recipes/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug,
          description,
          difficulty,
          prep_time: prepTime ? parseInt(prepTime) : null,
          cook_time: cookTime ? parseInt(cookTime) : null,
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
        alert('Recipe created successfully!');
        router.push('/manage-recipes');
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error creating recipe:', error);
      alert('Failed to create recipe');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white pt-24 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-black tracking-tight text-black">Create New Recipe</h1>
          <p className="text-gray-600 mt-2">Fill in the details to add a new recipe</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="bg-gray-50 p-6 space-y-4">
            <h2 className="text-xl font-bold">Basic Information</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recipe Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="e.g., Spicy Tonkotsu Ramen"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL Slug *
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="e.g., spicy-tonkotsu-ramen"
              />
              <p className="text-xs text-gray-500 mt-1">Auto-generated from title, but you can edit it</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Brief description of the recipe..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Difficulty *
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as RecipeDifficulty)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                >
                  {RECIPE_DIFFICULTIES.map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Servings *
                </label>
                <input
                  type="number"
                  value={servings}
                  onChange={(e) => setServings(e.target.value)}
                  required
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prep Time (minutes)
                </label>
                <input
                  type="number"
                  value={prepTime}
                  onChange={(e) => setPrepTime(e.target.value)}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cook Time (minutes)
                </label>
                <input
                  type="number"
                  value={cookTime}
                  onChange={(e) => setCookTime(e.target.value)}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
          </div>

          {/* Ingredients */}
          <div className="bg-gray-50 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Ingredients *</h2>
              <button
                type="button"
                onClick={addIngredient}
                className="px-4 py-2 bg-black text-white text-sm font-medium hover:bg-gray-800"
              >
                + Add Ingredient
              </button>
            </div>

            {ingredients.map((ingredient, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-start">
                <div className="col-span-4">
                  <input
                    type="text"
                    value={ingredient.name}
                    onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                    placeholder="Ingredient name"
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black text-sm"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="text"
                    value={ingredient.amount}
                    onChange={(e) => updateIngredient(index, 'amount', e.target.value)}
                    placeholder="Amount"
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black text-sm"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="text"
                    value={ingredient.unit || ''}
                    onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                    placeholder="Unit"
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black text-sm"
                  />
                </div>
                <div className="col-span-3">
                  <input
                    type="text"
                    value={ingredient.notes || ''}
                    onChange={(e) => updateIngredient(index, 'notes', e.target.value)}
                    placeholder="Notes (optional)"
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black text-sm"
                  />
                </div>
                <div className="col-span-1">
                  {ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="w-full px-2 py-2 text-red-600 hover:bg-red-50"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Instructions */}
          <div className="bg-gray-50 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Instructions *</h2>
              <button
                type="button"
                onClick={addInstruction}
                className="px-4 py-2 bg-black text-white text-sm font-medium hover:bg-gray-800"
              >
                + Add Step
              </button>
            </div>

            {instructions.map((instruction, index) => (
              <div key={index} className="flex gap-2 items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {instruction.step}
                </div>
                <div className="flex-1">
                  <textarea
                    value={instruction.instruction}
                    onChange={(e) => updateInstruction(index, 'instruction', e.target.value)}
                    placeholder="Describe this step..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black text-sm"
                  />
                </div>
                <div className="w-24">
                  <input
                    type="number"
                    value={instruction.duration || ''}
                    onChange={(e) => updateInstruction(index, 'duration', e.target.value ? parseInt(e.target.value) : '')}
                    placeholder="Min"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black text-sm"
                  />
                </div>
                <div className="flex-shrink-0">
                  {instructions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeInstruction(index)}
                      className="px-2 py-2 text-red-600 hover:bg-red-50"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Images */}
          <div className="bg-gray-50 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Images</h2>
              <button
                type="button"
                onClick={addImage}
                className="px-4 py-2 bg-black text-white text-sm font-medium hover:bg-gray-800"
              >
                + Add Image
              </button>
            </div>

            {images.map((image, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-start">
                <div className="col-span-6">
                  <input
                    type="url"
                    value={image.url}
                    onChange={(e) => updateImage(index, 'url', e.target.value)}
                    placeholder="Image URL"
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black text-sm"
                  />
                </div>
                <div className="col-span-4">
                  <input
                    type="text"
                    value={image.alt}
                    onChange={(e) => updateImage(index, 'alt', e.target.value)}
                    placeholder="Alt text"
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black text-sm"
                  />
                </div>
                <div className="col-span-1 flex items-center justify-center">
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="checkbox"
                      checked={image.isPrimary || false}
                      onChange={(e) => updateImage(index, 'isPrimary', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span>Primary</span>
                  </label>
                </div>
                <div className="col-span-1">
                  {images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="w-full px-2 py-2 text-red-600 hover:bg-red-50"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}
            <p className="text-xs text-gray-500">Use placeholder image URLs for now (e.g., https://via.placeholder.com/800x600)</p>
          </div>

          {/* Tips */}
          <div className="bg-gray-50 p-6 space-y-4">
            <h2 className="text-xl font-bold">Cooking Tips</h2>
            <textarea
              value={tips}
              onChange={(e) => setTips(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Share helpful tips, tricks, or substitutions..."
            />
          </div>

          {/* Settings */}
          <div className="bg-gray-50 p-6 space-y-4">
            <h2 className="text-xl font-bold">Settings</h2>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">Active (visible on website)</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">Featured</span>
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 bg-black text-white font-bold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Creating...' : 'Create Recipe'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-8 py-3 border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
