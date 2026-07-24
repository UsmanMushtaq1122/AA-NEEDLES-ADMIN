"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
  Tag,
  X,
  Upload,
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { productSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";
import type { z } from "zod";
import type { Product } from "@/types";

type ProductFormData = z.infer<typeof productSchema>;

const MOCK_CATEGORIES = [
  { id: "1", name: "Kurtis" },
  { id: "2", name: "Suits" },
  { id: "3", name: "Sarees" },
  { id: "4", name: "Dupattas" },
  { id: "5", name: "Accessories" },
];

interface ProductFormProps {
  initialData?: Product;
  onSubmit: (data: ProductFormData) => void;
  isLoading?: boolean;
}

function ProductForm({ initialData, onSubmit, isLoading }: ProductFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      name: initialData?.name || "",
      slug: initialData?.slug || "",
      description: initialData?.description || "",
      shortDescription: initialData?.shortDescription || "",
      price: initialData?.price || 0,
      compareAtPrice: initialData?.compareAtPrice || undefined,
      costPrice: initialData?.costPrice || undefined,
      sku: initialData?.sku || "",
      barcode: initialData?.barcode || "",
      stock: initialData?.stock || 0,
      lowStockThreshold: initialData?.lowStockThreshold || 5,
      weight: initialData?.weight || undefined,
      status: initialData?.status || "draft",
      isFeatured: initialData?.isFeatured || false,
      isNewArrival: initialData?.isNewArrival || false,
      isBestSeller: initialData?.isBestSeller || false,
      categoryIds: initialData?.categories?.map((c) => c.id) || [],
      tags: initialData?.tags || [],
      seoTitle: initialData?.seoTitle || "",
      seoDescription: initialData?.seoDescription || "",
    },
  });

  const nameValue = watch("name");
  const tagsValue = watch("tags");
  const categoryIdsValue = watch("categoryIds");
  const statusValue = watch("status");
  const isFeaturedValue = watch("isFeatured");
  const isNewArrivalValue = watch("isNewArrival");
  const isBestSellerValue = watch("isBestSeller");

  const [tagInput, setTagInput] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [images, setImages] = useState<{ url: string; alt: string }[]>(
    initialData?.images?.map((img) => ({ url: img.url, alt: img.alt })) || []
  );

  useEffect(() => {
    if (nameValue && !initialData) {
      setValue("slug", slugify(nameValue));
    }
  }, [nameValue, initialData, setValue]);

  const handleAddTag = useCallback(() => {
    const tag = tagInput.trim();
    if (tag && !tagsValue.includes(tag)) {
      setValue("tags", [...tagsValue, tag]);
      setTagInput("");
    }
  }, [tagInput, tagsValue, setValue]);

  const handleRemoveTag = useCallback(
    (tag: string) => {
      setValue(
        "tags",
        tagsValue.filter((t) => t !== tag)
      );
    },
    [tagsValue, setValue]
  );

  const toggleCategory = useCallback(
    (catId: string) => {
      const current = categoryIdsValue;
      if (current.includes(catId)) {
        setValue(
          "categoryIds",
          current.filter((id) => id !== catId)
        );
      } else {
        setValue("categoryIds", [...current, catId]);
      }
    },
    [categoryIdsValue, setValue]
  );

  const moveImage = useCallback(
    (index: number, direction: "up" | "down") => {
      const newImages = [...images];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newImages.length) return;
      [newImages[index], newImages[targetIndex]] = [
        newImages[targetIndex],
        newImages[index],
      ];
      setImages(newImages);
    },
    [images]
  );

  const removeImage = useCallback(
    (index: number) => {
      setImages(images.filter((_, i) => i !== index));
    },
    [images]
  );

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;
      Array.from(files)
        .slice(0, 8 - images.length)
        .forEach((file) => {
          const url = URL.createObjectURL(file);
          setImages((prev) => [...prev, { url, alt: file.name }]);
        });
    },
    [images.length]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragActive(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const files = e.dataTransfer.files;
      Array.from(files)
        .filter((f) => f.type.startsWith("image/"))
        .slice(0, 8 - images.length)
        .forEach((file) => {
          const url = URL.createObjectURL(file);
          setImages((prev) => [...prev, { url, alt: file.name }]);
        });
    },
    [images.length]
  );

  return (
    <form onSubmit={handleSubmit((data) => onSubmit(data as ProductFormData))} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <Input
                  label="Product Name"
                  placeholder="e.g. Silk Embroidered Kurti"
                  {...register("name")}
                  error={errors.name?.message}
                />
                <Input
                  label="Slug"
                  placeholder="auto-generated-from-name"
                  {...register("slug")}
                />
                <Textarea
                  label="Short Description"
                  placeholder="Brief description for product cards..."
                  rows={2}
                  {...register("shortDescription")}
                  error={errors.shortDescription?.message}
                />
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#1A1A1A]">
                    Full Description
                  </label>
                  <Textarea
                    placeholder="Detailed product description..."
                    rows={6}
                    {...register("description")}
                    error={errors.description?.message}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    label="Price (PKR)"
                    type="number"
                    placeholder="0"
                    {...register("price", { valueAsNumber: true })}
                    error={errors.price?.message}
                  />
                  <Input
                    label="Compare At Price (PKR)"
                    type="number"
                    placeholder="0"
                    {...register("compareAtPrice", { valueAsNumber: true })}
                  />
                  <Input
                    label="Cost Price (PKR)"
                    type="number"
                    placeholder="0"
                    {...register("costPrice", { valueAsNumber: true })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="SKU"
                    placeholder="AA-0001"
                    {...register("sku")}
                    error={errors.sku?.message}
                  />
                  <Input
                    label="Barcode"
                    placeholder="629..."
                    {...register("barcode")}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Stock Quantity"
                    type="number"
                    placeholder="0"
                    {...register("stock", { valueAsNumber: true })}
                    error={errors.stock?.message}
                  />
                  <Input
                    label="Low Stock Threshold"
                    type="number"
                    placeholder="5"
                    {...register("lowStockThreshold", { valueAsNumber: true })}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Media</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {images.length > 0 && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {images.map((img, idx) => (
                      <div
                        key={idx}
                        className="group relative overflow-hidden rounded-lg border border-gray-100 bg-[#F5F0EB]"
                      >
                        <div className="aspect-square flex items-center justify-center">
                          <img
                            src={img.url}
                            alt={img.alt}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-gradient-to-t from-black/50 to-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={() => moveImage(idx, "up")}
                            disabled={idx === 0}
                            className="rounded bg-white/90 p-1 text-[#1A1A1A] disabled:opacity-30"
                          >
                            <ArrowUp className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveImage(idx, "down")}
                            disabled={idx === images.length - 1}
                            className="rounded bg-white/90 p-1 text-[#1A1A1A] disabled:opacity-30"
                          >
                            <ArrowDown className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="rounded bg-white/90 p-1 text-red-600"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={img.alt}
                          onChange={(e) => {
                            const newImages = [...images];
                            newImages[idx] = { ...newImages[idx], alt: e.target.value };
                            setImages(newImages);
                          }}
                          placeholder="Alt text"
                          className="w-full border-t border-gray-100 bg-white px-2 py-1.5 text-xs text-[#1A1A1A] placeholder:text-gray-400 focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                )}
                {images.length < 8 && (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors ${
                      dragActive
                        ? "border-[#C9A96E] bg-[#C9A96E]/5"
                        : "border-gray-200 hover:border-[#C9A96E]/50 hover:bg-[#C9A96E]/5"
                    }`}
                  >
                    <Upload className="mb-2 h-8 w-8 text-gray-300" />
                    <p className="text-sm font-medium text-[#1A1A1A]">
                      Drop images or click to upload
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      {8 - images.length} slots remaining (max 8)
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() =>
                        document.getElementById("image-upload")?.click()
                      }
                    >
                      Choose Files
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>SEO</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="SEO Title"
                  placeholder="Custom title for search engines..."
                  {...register("seoTitle")}
                />
                <Textarea
                  label="SEO Description"
                  placeholder="Meta description for search results..."
                  rows={3}
                  {...register("seoDescription")}
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  label="Product Status"
                  value={statusValue}
                  onChange={(e) =>
                    setValue("status", e.target.value as "active" | "draft" | "archived")
                  }
                >
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </Select>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Organization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {MOCK_CATEGORIES.map((cat) => (
                  <label
                    key={cat.id}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 accent-[#C9A96E]"
                      checked={categoryIdsValue.includes(cat.id)}
                      onChange={() => toggleCategory(cat.id)}
                    />
                    <span className="text-sm text-[#1A1A1A]">{cat.name}</span>
                  </label>
                ))}
                {errors.categoryIds && (
                  <p className="text-xs text-red-500">
                    {errors.categoryIds.message}
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleAddTag}
                    disabled={!tagInput.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {tagsValue.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tagsValue.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-full border border-[#C9A96E]/20 bg-[#C9A96E]/10 px-2.5 py-1 text-xs font-medium text-[#7A6543]"
                      >
                        <Tag className="h-3 w-3" />
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-0.5 rounded-full p-0.5 hover:bg-[#C9A96E]/20"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Visibility</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#1A1A1A]">Featured</p>
                    <p className="text-xs text-gray-500">Show on homepage</p>
                  </div>
                  <Switch
                    checked={isFeaturedValue}
                    onCheckedChange={(checked) => setValue("isFeatured", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#1A1A1A]">New Arrival</p>
                    <p className="text-xs text-gray-500">Mark as new collection</p>
                  </div>
                  <Switch
                    checked={isNewArrivalValue}
                    onCheckedChange={(checked) => setValue("isNewArrival", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#1A1A1A]">Best Seller</p>
                    <p className="text-xs text-gray-500">Highlight top products</p>
                  </div>
                  <Switch
                    checked={isBestSellerValue}
                    onCheckedChange={(checked) =>
                      setValue("isBestSeller", checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-6">
        <Button type="button" variant="ghost">
          Discard
        </Button>
        <Button type="submit" loading={isLoading}>
          {initialData ? "Save Changes" : "Create Product"}
        </Button>
      </div>
    </form>
  );
}

export { ProductForm };
