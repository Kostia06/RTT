'use client';

import { useState } from 'react';
import ImageUpload from './ImageUpload';

export interface UploadedImage {
  url: string;
  alt: string;
  isPrimary: boolean;
}

interface MultiImageUploadProps {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  folder?: string;
  maxImages?: number;
}

export default function MultiImageUpload({
  images,
  onChange,
  folder = 'products',
  maxImages = 10
}: MultiImageUploadProps) {
  const [editingAlt, setEditingAlt] = useState<number | null>(null);

  const handleImageUpload = (index: number, url: string) => {
    const updated = [...images];
    updated[index] = { ...updated[index], url };
    onChange(updated);
  };

  const handleAltChange = (index: number, alt: string) => {
    const updated = [...images];
    updated[index] = { ...updated[index], alt };
    onChange(updated);
  };

  const handlePrimaryChange = (index: number) => {
    const updated = images.map((img, i) => ({
      ...img,
      isPrimary: i === index
    }));
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    // If we removed the primary image, make the first one primary
    if (images[index].isPrimary && updated.length > 0) {
      updated[0].isPrimary = true;
    }
    onChange(updated);
  };

  const handleAddImage = () => {
    if (images.length < maxImages) {
      onChange([...images, { url: '', alt: '', isPrimary: images.length === 0 }]);
    }
  };

  return (
    <div className="space-y-6">
      {images.map((image, index) => (
        <div key={index} className="bg-white border-2 border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-gray-900">
              Image {index + 1}
              {image.isPrimary && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 text-xs font-medium bg-black text-white">
                  PRIMARY
                </span>
              )}
            </h3>
            {images.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Remove
              </button>
            )}
          </div>

          <ImageUpload
            currentImage={image.url}
            onUploadComplete={(url) => handleImageUpload(index, url)}
            folder={folder}
          />

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alt Text (for accessibility)
              </label>
              <input
                type="text"
                value={image.alt}
                onChange={(e) => handleAltChange(index, e.target.value)}
                placeholder="Describe this image..."
                className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black text-sm"
              />
            </div>

            {images.length > 1 && (
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="primaryImage"
                    checked={image.isPrimary}
                    onChange={() => handlePrimaryChange(index)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Set as primary image
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-6">
                  Primary image will be shown in listings and previews
                </p>
              </div>
            )}
          </div>
        </div>
      ))}

      {images.length < maxImages && (
        <button
          type="button"
          onClick={handleAddImage}
          className="w-full py-4 border-2 border-dashed border-gray-300 hover:border-black transition-colors text-sm font-medium text-gray-600 hover:text-black"
        >
          + Add Another Image
        </button>
      )}

      <p className="text-xs text-gray-500">
        You can upload up to {maxImages} images. {maxImages - images.length} remaining.
      </p>
    </div>
  );
}
