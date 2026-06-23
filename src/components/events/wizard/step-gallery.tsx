"use client";

import { useRef, useState } from "react";
import { Upload, X, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { formatFileSize } from "@/lib/utils";
import type { WizardData } from "@/app/(dashboard)/events/create/page";

interface StepGalleryProps {
  data: WizardData;
  onChange: (updates: Partial<WizardData>) => void;
}

export function StepGallery({ data, onChange }: StepGalleryProps) {
  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<{ url: string; name: string; size: number }[]>([]);

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    onChange({ cover_image: file });
    const url = URL.createObjectURL(file);
    setCoverPreview(url);
  }

  function handleGalleryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newFiles = [...data.gallery_files, ...files].slice(0, 10);
    onChange({ gallery_files: newFiles });
    const newPreviews = files.map((f) => ({
      url: URL.createObjectURL(f),
      name: f.name,
      size: f.size,
    }));
    setGalleryPreviews((prev) => [...prev, ...newPreviews].slice(0, 10));
  }

  function removeGalleryImage(index: number) {
    const newFiles = data.gallery_files.filter((_, i) => i !== index);
    onChange({ gallery_files: newFiles });
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Photos & Gallery</h2>
        <p className="text-muted-foreground mt-1">Add a cover image and gallery photos</p>
      </div>

      {/* Cover Image */}
      <div className="space-y-2">
        <Label>Cover Image</Label>
        <div
          onClick={() => coverInputRef.current?.click()}
          className="relative rounded-2xl border-2 border-dashed cursor-pointer hover:border-primary transition-colors overflow-hidden"
          style={{ minHeight: 200 }}
        >
          {coverPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverPreview} alt="Cover" className="w-full h-48 object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center h-48 gap-3 text-muted-foreground">
              <Upload className="w-10 h-10" />
              <div className="text-center">
                <p className="font-medium">Click to upload cover image</p>
                <p className="text-sm">JPG, PNG, WebP up to 5MB</p>
              </div>
            </div>
          )}
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleCoverChange}
          />
        </div>
        {data.cover_image && (
          <p className="text-xs text-muted-foreground">
            {data.cover_image.name} ({formatFileSize(data.cover_image.size)})
          </p>
        )}
      </div>

      {/* Gallery Images */}
      <div className="space-y-2">
        <Label>Gallery Photos (up to 10)</Label>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {galleryPreviews.map((preview, i) => (
            <div key={i} className="relative aspect-square rounded-xl overflow-hidden border group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview.url} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => removeGalleryImage(i)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {galleryPreviews.length < 10 && (
            <button
              onClick={() => galleryInputRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 hover:border-primary transition-colors text-muted-foreground"
            >
              <ImagePlus className="w-6 h-6" />
              <span className="text-xs">Add</span>
            </button>
          )}
        </div>
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleGalleryChange}
        />
        <p className="text-xs text-muted-foreground">
          {galleryPreviews.length}/10 photos added
        </p>
      </div>
    </div>
  );
}
