"use client";

import { useCallback, useState } from "react";
import { Upload, ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ImageUploadProps {
  images: { url: string; alt: string }[];
  onChange: (images: { url: string; alt: string }[]) => void;
  maxImages?: number;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;

function ImageUpload({
  images,
  onChange,
  maxImages = 8,
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");

  const addImages = useCallback(
    (files: FileList | File[]) => {
      const remaining = maxImages - images.length;
      const oversized = Array.from(files).filter(
        (f) => f.size > MAX_FILE_SIZE
      );
      if (oversized.length > 0) {
        setError(
          `${oversized.length} file(s) skipped — maximum file size is 10MB.`
        );
      } else {
        setError("");
      }
      const newImages = Array.from(files)
        .filter((f) => f.size <= MAX_FILE_SIZE)
        .slice(0, remaining)
        .map((file) => ({
          url: URL.createObjectURL(file),
          alt: file.name.replace(/\.[^/.]+$/, ""),
        }));
      if (newImages.length > 0) {
        onChange([...images, ...newImages]);
      }
    },
    [images, onChange, maxImages]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) addImages(e.target.files);
    },
    [addImages]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const files = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith("image/")
      );
      addImages(files);
    },
    [addImages]
  );

  const moveImage = useCallback(
    (index: number, direction: "up" | "down") => {
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= images.length) return;
      const updated = [...images];
      [updated[index], updated[targetIndex]] = [
        updated[targetIndex],
        updated[index],
      ];
      onChange(updated);
    },
    [images, onChange]
  );

  const removeImage = useCallback(
    (index: number) => {
      onChange(images.filter((_, i) => i !== index));
    },
    [images, onChange]
  );

  const updateAlt = useCallback(
    (index: number, alt: string) => {
      const updated = [...images];
      updated[index] = { ...updated[index], alt };
      onChange(updated);
    },
    [images, onChange]
  );

  return (
    <div className="space-y-4">
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {images.map((img, idx) => (
            <div
              key={idx}
              className="group relative overflow-hidden rounded-xl border border-gray-100 bg-[#F5F0EB]"
            >
              <div className="aspect-square flex items-center justify-center overflow-hidden">
                <img
                  src={img.url}
                  alt={img.alt}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/40 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                <span className="text-xs font-medium text-white/90">
                  #{idx + 1}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveImage(idx, "up")}
                    disabled={idx === 0}
                    className="rounded bg-white/90 p-1 text-[#1A1A1A] transition-colors hover:bg-white disabled:opacity-30"
                  >
                    <ArrowUp className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveImage(idx, "down")}
                    disabled={idx === images.length - 1}
                    className="rounded bg-white/90 p-1 text-[#1A1A1A] transition-colors hover:bg-white disabled:opacity-30"
                  >
                    <ArrowDown className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="rounded bg-white/90 p-1 text-red-600 transition-colors hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
              <div className="p-2">
                <Input
                  value={img.alt}
                  onChange={(e) => updateAlt(idx, e.target.value)}
                  placeholder="Alt text"
                  className="h-8 text-xs"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length < maxImages && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById("image-upload-zone")?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all ${
            dragActive
              ? "border-[#C9A96E] bg-[#C9A96E]/5"
              : "border-gray-200 hover:border-[#C9A96E]/50 hover:bg-[#C9A96E]/5"
          }`}
        >
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#C9A96E]/10">
            <Upload className="h-5 w-5 text-[#7A6543]" />
          </div>
          <p className="text-sm font-medium text-[#1A1A1A]">
            Drop images here or click to upload
          </p>
          <p className="mt-1 text-xs text-gray-400">
            {maxImages - images.length} of {maxImages} slots remaining
          </p>
          <input
            id="image-upload-zone"
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}

      {error && (
        <p className="text-xs font-medium text-amber-600">{error}</p>
      )}
    </div>
  );
}

export { ImageUpload };
