"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import {
  Upload,
  ArrowUp,
  ArrowDown,
  Trash2,
  CheckCircle,
  Copy,
  ArrowLeft,
  ImagePlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/api";

interface UploadedImage {
  url: string;
  publicId: string;
}

function bulkUploadImages(
  files: File[]
): Promise<{ success: boolean; data: UploadedImage[] }> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("images", file);
  });
  return api.upload("/products/bulk-upload", formData);
}

const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function BulkUploadPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [results, setResults] = useState<UploadedImage[] | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const addFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const remaining = MAX_IMAGES - files.length;
      const imageFiles = Array.from(newFiles).filter((f) =>
        f.type.startsWith("image/")
      );
      const oversized = imageFiles.filter((f) => f.size > MAX_FILE_SIZE);
      if (oversized.length > 0) {
        toast(
          "error",
          `${oversized.length} file(s) skipped — maximum file size is 10MB.`
        );
      }
      const valid = imageFiles
        .filter((f) => f.size <= MAX_FILE_SIZE)
        .slice(0, remaining);
      if (valid.length === 0) return;

      const newPreviews = valid.map((f) => URL.createObjectURL(f));
      setPreviews((prev) => [...prev, ...newPreviews]);
      setFiles((prev) => [...prev, ...valid]);
    },
    [files.length, toast]
  );

  const removeFile = useCallback(
    (index: number) => {
      URL.revokeObjectURL(previews[index]);
      setFiles((prev) => prev.filter((_, i) => i !== index));
      setPreviews((prev) => prev.filter((_, i) => i !== index));
    },
    [previews]
  );

  const moveFile = useCallback(
    (index: number, direction: "up" | "down") => {
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= files.length) return;
      setFiles((prev) => {
        const updated = [...prev];
        [updated[index], updated[target]] = [updated[target], updated[index]];
        return updated;
      });
      setPreviews((prev) => {
        const updated = [...prev];
        [updated[index], updated[target]] = [updated[target], updated[index]];
        return updated;
      });
    },
    [files.length]
  );

  const uploadMutation = useMutation({
    mutationFn: bulkUploadImages,
    onSuccess: (res) => {
      setResults(res.data || []);
      toast("success", `Uploaded ${(res.data || []).length} images successfully`);
    },
    onError: () => {
      toast("error", "Failed to upload images. Please try again.");
    },
  });

  const handleUpload = () => {
    if (files.length === 0) return;
    uploadMutation.mutate(files);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast("success", "URL copied to clipboard");
  };

  const isUploading = uploadMutation.isPending;

  if (results) {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setResults(null);
                setFiles([]);
                setPreviews([]);
              }}
            >
              <ArrowLeft className="h-4 w-4" />
              Upload More
            </Button>
            <h1 className="text-2xl font-semibold tracking-tight text-[#1A1A1A]">
              Upload Results
            </h1>
          </div>
          <Button onClick={() => router.push("/admin/products")}>
            Back to Products
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="border-0 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="font-['Playfair_Display'] text-lg">
                Uploaded Images ({results.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {results.map((img, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 rounded-lg border border-green-100 bg-green-50/50 p-4"
                  >
                    <CheckCircle className="h-5 w-5 shrink-0 text-green-500" />
                    <img
                      src={img.url}
                      alt={`Uploaded ${idx + 1}`}
                      className="h-16 w-16 rounded-lg border border-gray-100 object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1A1A1A] truncate">
                        {img.publicId}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500 truncate">
                        {img.url}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(img.url)}
                      className="shrink-0"
                    >
                      <Copy className="h-4 w-4" />
                      Copy URL
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#1A1A1A]">
            Bulk Upload Images
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Upload up to {MAX_IMAGES} product images at once
          </p>
        </div>
        <Button variant="ghost" onClick={() => router.push("/admin/products")}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="border-0 bg-white shadow-sm">
          <CardContent className="p-6">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() =>
                document.getElementById("bulk-upload-input")?.click()
              }
              className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-all ${
                dragActive
                  ? "border-[#C9A96E] bg-[#C9A96E]/5"
                  : "border-gray-200 hover:border-[#C9A96E]/50 hover:bg-[#C9A96E]/5"
              }`}
            >
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#C9A96E]/10">
                <ImagePlus className="h-6 w-6 text-[#7A6543]" />
              </div>
              <p className="text-sm font-medium text-[#1A1A1A]">
                Drop images here or click to browse
              </p>
              <p className="mt-1 text-xs text-gray-400">
                JPG, PNG, WebP, GIF, AVIF - Max 10MB each
              </p>
              <p className="mt-2 text-xs text-[#7A6543]">
                {files.length} of {MAX_IMAGES} selected
              </p>
              <input
                id="bulk-upload-input"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  if (e.target.files) addFiles(e.target.files);
                  e.target.value = "";
                }}
                className="hidden"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-0 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="font-['Playfair_Display'] text-lg">
                  Selected Images
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  {files.map((file, idx) => (
                    <div
                      key={idx}
                      className="group relative overflow-hidden rounded-xl border border-gray-100 bg-[#F5F0EB]"
                    >
                      <div className="aspect-square flex items-center justify-center overflow-hidden">
                        <img
                          src={previews[idx]}
                          alt={file.name}
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
                            onClick={() => moveFile(idx, "up")}
                            disabled={idx === 0}
                            className="rounded bg-white/90 p-1 text-[#1A1A1A] transition-colors hover:bg-white disabled:opacity-30"
                          >
                            <ArrowUp className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveFile(idx, "down")}
                            disabled={idx === files.length - 1}
                            className="rounded bg-white/90 p-1 text-[#1A1A1A] transition-colors hover:bg-white disabled:opacity-30"
                          >
                            <ArrowDown className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeFile(idx)}
                            className="rounded bg-white/90 p-1 text-red-600 transition-colors hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      <div className="p-2">
                        <p className="text-[11px] text-gray-500 truncate">
                          {file.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFiles([]);
                      setPreviews([]);
                    }}
                    disabled={isUploading}
                  >
                    Clear All
                  </Button>
                  <Button
                    onClick={handleUpload}
                    loading={isUploading}
                    disabled={files.length === 0}
                  >
                    <Upload className="h-4 w-4" />
                    Upload {files.length} Image{files.length !== 1 ? "s" : ""}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
