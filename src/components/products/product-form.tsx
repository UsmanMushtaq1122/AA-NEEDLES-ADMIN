"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
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
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { productSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import type { z } from "zod";
import type { Product } from "@/types";

type ProductFormData = z.infer<typeof productSchema>;

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const STANDARD_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"];
const CARE_SUGGESTIONS = [
  "Dry clean recommended",
  "Hand wash separately",
  "Do not bleach",
  "Iron at low temperature",
  "Store in a cool, dry place",
];

interface ProductFormProps {
  initialData?: Product;
  onSubmit: (data: ProductFormData) => void;
  isLoading?: boolean;
}

function ProductForm({ initialData, onSubmit, isLoading }: ProductFormProps) {
  const { toast } = useToast();
  const formDefaults = useMemo<ProductFormData>(() => {
    if (!initialData) {
      return {
        name: "",
        slug: "",
        description: "",
        shortDescription: "",
        price: 0,
        compareAtPrice: undefined,
        costPrice: undefined,
        sku: "",
        barcode: "",
        stock: 0,
        lowStockThreshold: 5,
        weight: undefined,
        status: "draft",
        isFeatured: false,
        isNewArrival: false,
        isBestSeller: false,
        categoryIds: [],
        tags: [],
        descriptionSections: { color: "", sections: [], note: "" },
        fabric: "",
        sizes: [],
        careInstructions: [],
        seoTitle: "",
        seoDescription: "",
      };
    }
    return {
      name: initialData.name || "",
      slug: initialData.slug || "",
      description: initialData.description || "",
      shortDescription: initialData.shortDescription || "",
      price: initialData.price || 0,
      compareAtPrice: initialData.compareAtPrice || undefined,
      costPrice: initialData.costPrice || undefined,
      sku: initialData.sku || "",
      barcode: initialData.barcode || "",
      stock: initialData.stock || 0,
      lowStockThreshold: initialData.lowStockThreshold || 5,
      weight: initialData.weight || undefined,
      status: (initialData.status || "draft").toLowerCase() as
        | "active"
        | "draft"
        | "archived",
      isFeatured: !!initialData.isFeatured,
      isNewArrival: !!initialData.isNewArrival,
      isBestSeller: !!initialData.isBestSeller,
      categoryIds: initialData.categoryId
        ? [initialData.categoryId]
        : (initialData.categories || []).map((c) => c.id),
      tags: Array.isArray(initialData.tags) ? initialData.tags : [],
      descriptionSections: initialData.descriptionSections || {
        color: "",
        sections: [],
        note: "",
      },
      fabric: initialData.fabric || "",
      sizes: Array.isArray(initialData.sizes) ? initialData.sizes : [],
      careInstructions: Array.isArray(initialData.careInstructions)
        ? initialData.careInstructions
        : [],
      seoTitle: initialData.seoTitle || "",
      seoDescription: initialData.seoDescription || "",
    };
  }, [initialData]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<ProductFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(productSchema) as any,
    defaultValues: formDefaults,
    mode: "onTouched",
  });

  const nameValue = watch("name");
  const tagsValue = watch("tags");
  const categoryIdsValue = watch("categoryIds");
  const statusValue = watch("status");
  const isFeaturedValue = watch("isFeatured");
  const isNewArrivalValue = watch("isNewArrival");
  const isBestSellerValue = watch("isBestSeller");
  const descriptionSectionsValue = watch("descriptionSections");
  const sizesValue = watch("sizes");
  const careInstructionsValue = watch("careInstructions");

  const [tagInput, setTagInput] = useState("");
  const [customSizeInput, setCustomSizeInput] = useState("");
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [imageError, setImageError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const isSubmitting = submitting || isLoading;

  const initialImages = useMemo(
    () =>
      (initialData?.images || []).map((img) => {
        if (typeof img === "string") {
          return { url: img, alt: initialData?.name || "" };
        }
        return { url: img.url, alt: img.alt || "" };
      }),
    [initialData]
  );

  const [images, setImages] = useState<{ url: string; alt: string; file?: File }[]>(
    initialImages
  );

  useEffect(() => {
    api
      .get<{ data: { categories?: { id: string; name: string }[] } }>("/categories")
      .then((res) => {
        const cats: { id: string; name: string }[] =
          (Array.isArray(res.data) ? res.data : res.data?.categories) || [];
        setCategories(cats);
      })
      .catch(() => {});
  }, []);

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

  const addSection = useCallback(() => {
    setValue("descriptionSections", {
      ...descriptionSectionsValue,
      sections: [...descriptionSectionsValue.sections, { title: "", items: [""] }],
    });
  }, [descriptionSectionsValue, setValue]);

  const removeSection = useCallback(
    (sectionIndex: number) => {
      setValue("descriptionSections", {
        ...descriptionSectionsValue,
        sections: descriptionSectionsValue.sections.filter(
          (_, i) => i !== sectionIndex
        ),
      });
    },
    [descriptionSectionsValue, setValue]
  );

  const updateSectionTitle = useCallback(
    (sectionIndex: number, title: string) => {
      setValue("descriptionSections", {
        ...descriptionSectionsValue,
        sections: descriptionSectionsValue.sections.map((s, i) =>
          i === sectionIndex ? { ...s, title } : s
        ),
      });
    },
    [descriptionSectionsValue, setValue]
  );

  const addSectionItem = useCallback(
    (sectionIndex: number) => {
      setValue("descriptionSections", {
        ...descriptionSectionsValue,
        sections: descriptionSectionsValue.sections.map((s, i) =>
          i === sectionIndex ? { ...s, items: [...s.items, ""] } : s
        ),
      });
    },
    [descriptionSectionsValue, setValue]
  );

  const removeSectionItem = useCallback(
    (sectionIndex: number, itemIndex: number) => {
      setValue("descriptionSections", {
        ...descriptionSectionsValue,
        sections: descriptionSectionsValue.sections.map((s, i) =>
          i === sectionIndex
            ? { ...s, items: s.items.filter((_, j) => j !== itemIndex) }
            : s
        ),
      });
    },
    [descriptionSectionsValue, setValue]
  );

  const updateSectionItem = useCallback(
    (sectionIndex: number, itemIndex: number, text: string) => {
      setValue("descriptionSections", {
        ...descriptionSectionsValue,
        sections: descriptionSectionsValue.sections.map((s, i) =>
          i === sectionIndex
            ? {
                ...s,
                items: s.items.map((item, j) => (j === itemIndex ? text : item)),
              }
            : s
        ),
      });
    },
    [descriptionSectionsValue, setValue]
  );

  const addCustomSize = useCallback(() => {
    const enteredSize = customSizeInput.trim();
    const size =
      STANDARD_SIZES.find(
        (standardSize) =>
          standardSize.toLowerCase() === enteredSize.toLowerCase()
      ) || enteredSize;
    if (
      size &&
      !sizesValue.some((existingSize) => existingSize.toLowerCase() === size.toLowerCase())
    ) {
      setValue("sizes", [...sizesValue, size], {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
    setCustomSizeInput("");
  }, [customSizeInput, setValue, sizesValue]);

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
      const list = Array.from(files);
      const oversized = list.filter((f) => f.size > MAX_FILE_SIZE);
      if (oversized.length > 0) {
        setImageError(
          `${oversized.length} file(s) skipped — maximum file size is 10MB.`
        );
      } else {
        setImageError("");
      }
      list
        .filter((f) => f.size <= MAX_FILE_SIZE)
        .slice(0, 8 - images.length)
        .forEach((file) => {
          const url = URL.createObjectURL(file);
          setImages((prev) => [...prev, { url, alt: file.name, file }]);
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
      const files = Array.from(e.dataTransfer.files)
        .filter((f) => f.type.startsWith("image/"));
      const oversized = files.filter((f) => f.size > MAX_FILE_SIZE);
      if (oversized.length > 0) {
        setImageError(
          `${oversized.length} file(s) skipped — maximum file size is 10MB.`
        );
      } else {
        setImageError("");
      }
      files
        .filter((f) => f.size <= MAX_FILE_SIZE)
        .slice(0, 8 - images.length)
        .forEach((file) => {
          const url = URL.createObjectURL(file);
          setImages((prev) => [...prev, { url, alt: file.name, file }]);
        });
    },
    [images.length]
  );

  const handleFormSubmit = async (data: ProductFormData) => {
    setSubmitError("");
    setImageError("");
    setSubmitting(true);

    try {
      if (images.length === 0) {
        const message = "Product image is required.";
        setImageError(message);
        toast("error", message);
        setSubmitting(false);
        return;
      }

      const dupRes = await api
        .post<{ success: boolean; data: { duplicates: Partial<Record<"name" | "sku" | "slug", string>> } }>(
          "/products/check-duplicates",
          {
            name: data.name,
            sku: data.sku,
            slug: data.slug,
            excludeId: initialData?.id,
          }
        )
        .catch(() => null);

      const duplicates = dupRes?.data?.duplicates || {};
      if (duplicates.name || duplicates.sku || duplicates.slug) {
        if (duplicates.name) setError("name", { type: "duplicate", message: duplicates.name });
        if (duplicates.sku) setError("sku", { type: "duplicate", message: duplicates.sku });
        if (duplicates.slug) setError("slug", { type: "duplicate", message: duplicates.slug });
        toast("error", "This product already exists.");
        setSubmitting(false);
        return;
      }

      let finalImages = images.map((img) => ({ url: img.url, alt: img.alt }));
      const pending = images.filter((img) => img.file);

      if (pending.length > 0) {
        const uploadedUrls: string[] = [];
        for (let i = 0; i < pending.length; i += 5) {
          const formData = new FormData();
          for (const img of pending.slice(i, i + 5)) {
            if (img.file) formData.append("images", img.file);
          }
          const res = await api.upload<{ success: boolean; data: { url: string; publicId: string }[] }>(
            "/products/bulk-upload",
            formData
          );
          const uploaded = res.data || [];
          uploaded.forEach((u) => uploadedUrls.push(u.url));
        }
        if (uploadedUrls.length < pending.length) {
          throw new Error("Some images could not be uploaded. Please try again.");
        }
        let idx = 0;
        finalImages = images.map((img) =>
          img.file
            ? { url: uploadedUrls[idx++], alt: img.alt }
            : { url: img.url, alt: img.alt }
        );
      }

      onSubmit({ ...data, images: finalImages } as ProductFormData);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to save product. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
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
                  error={errors.slug?.message}
                />
                <Textarea
                  label="Short Description"
                  placeholder="Brief description for product cards..."
                  rows={2}
                  {...register("shortDescription")}
                  error={errors.shortDescription?.message}
                />
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
                    error={errors.compareAtPrice?.message}
                  />
                  <Input
                    label="Cost Price (PKR)"
                    type="number"
                    placeholder="0"
                    {...register("costPrice", { valueAsNumber: true })}
                    error={errors.costPrice?.message}
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
                    label="Barcode (optional)"
                    placeholder="629..."
                    {...register("barcode")}
                    error={errors.barcode?.message}
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
                    error={errors.lowStockThreshold?.message}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.08 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Product Sizes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <fieldset>
                  <legend className="mb-2 text-sm font-medium text-[#1A1A1A]">
                    Select available sizes
                  </legend>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      ...STANDARD_SIZES,
                      ...sizesValue.filter(
                        (size) =>
                          !STANDARD_SIZES.some(
                            (standardSize) =>
                              standardSize.toLowerCase() === size.toLowerCase()
                          )
                      ),
                    ].map((size) => (
                      <label
                        key={size}
                        className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-[#F5F0EB]/50 px-3 py-2 text-sm text-[#1A1A1A]"
                      >
                        <input
                          type="checkbox"
                          checked={sizesValue.includes(size)}
                          onChange={(event) =>
                            setValue(
                              "sizes",
                              event.target.checked
                                ? [...sizesValue, size]
                                : sizesValue.filter((selected) => selected !== size),
                              { shouldDirty: true, shouldValidate: true }
                            )
                          }
                          className="h-4 w-4 accent-[#C9A96E]"
                        />
                        {size}
                      </label>
                    ))}
                  </div>
                  {errors.sizes?.message && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.sizes.message}
                    </p>
                  )}
                </fieldset>
                <div className="flex items-end gap-2">
                  <Input
                    label="Custom size"
                    placeholder="e.g. 3XL"
                    value={customSizeInput}
                    onChange={(event) => setCustomSizeInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addCustomSize();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={addCustomSize}>
                    <Plus className="h-4 w-4" /> Add Size
                  </Button>
                </div>
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
                <CardTitle>Detailed Description</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    label="Color"
                    placeholder="e.g. Navy & Coffee"
                    {...register("descriptionSections.color")}
                  />
                  <Input
                    label="Note"
                    placeholder="e.g. Dry Clean Only"
                    {...register("descriptionSections.note")}
                  />
                </div>

                {descriptionSectionsValue.sections.length > 0 && (
                  <div className="space-y-4">
                    {descriptionSectionsValue.sections.map(
                      (section, sectionIndex) => (
                        <div
                          key={sectionIndex}
                          className="space-y-3 rounded-xl border border-gray-200 p-4"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                              Section {sectionIndex + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeSection(sectionIndex)}
                              className="rounded-full p-1.5 text-red-500 hover:bg-red-50"
                              title="Remove section"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <Input
                            placeholder="Section title (e.g. Shirt)"
                            value={section.title}
                            onChange={(e) =>
                              updateSectionTitle(sectionIndex, e.target.value)
                            }
                          />
                          {section.items.length > 0 && (
                            <div className="space-y-2">
                              {section.items.map((item, itemIndex) => (
                                <div
                                  key={itemIndex}
                                  className="flex items-center gap-2"
                                >
                                  <span className="text-sm text-gray-300">•</span>
                                  <Input
                                    placeholder={`Item ${itemIndex + 1}`}
                                    value={item}
                                    onChange={(e) =>
                                      updateSectionItem(
                                        sectionIndex,
                                        itemIndex,
                                        e.target.value
                                      )
                                    }
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeSectionItem(sectionIndex, itemIndex)
                                    }
                                    className="shrink-0 rounded-full p-1.5 text-red-500 hover:bg-red-50"
                                    title="Remove item"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addSectionItem(sectionIndex)}
                          >
                            <Plus className="h-4 w-4" /> Add Item
                          </Button>
                        </div>
                      )
                    )}
                  </div>
                )}

                <Button type="button" variant="outline" onClick={addSection}>
                  <Plus className="h-4 w-4" /> Add Section
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.12 }}
          >
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#C9A96E]/10 text-[#9A763A]">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle>Product Care</CardTitle>
                    <p className="mt-1.5 text-sm leading-relaxed text-gray-500">
                      Give customers clear guidance to help them care for this
                      piece and preserve its quality.
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <Input
                  label="Fabric"
                  placeholder="e.g. Cotton & Silk Blend"
                  {...register("fabric")}
                />

                <div className="rounded-xl border border-[#E9E2D8] bg-[#FBF9F6] p-4 sm:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-[#1A1A1A]">
                        Care instructions
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-gray-500">
                        Add one instruction per line. These appear in the
                        Product Care section.
                      </p>
                    </div>
                    <span className="rounded-full border border-[#E9E2D8] bg-white px-2.5 py-1 text-[11px] font-medium text-gray-500">
                      {careInstructionsValue.length}{" "}
                      {careInstructionsValue.length === 1
                        ? "instruction"
                        : "instructions"}
                    </span>
                  </div>

                  <Textarea
                    aria-label="Care instructions, one per line"
                    placeholder={
                      "e.g. Dry clean recommended\nStore in a cool, dry place"
                    }
                    rows={4}
                    className="mt-4 resize-y bg-white"
                    value={careInstructionsValue.join("\n")}
                    onChange={(event) =>
                      setValue(
                        "careInstructions",
                        event.target.value
                          .split(/\r?\n/)
                          .map((instruction) => instruction.trim())
                          .filter(Boolean),
                        { shouldDirty: true, shouldValidate: true }
                      )
                    }
                    error={errors.careInstructions?.message}
                  />

                  <div className="mt-4">
                    <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                      <Sparkles className="h-3.5 w-3.5 text-[#A8844A]" />
                      Quick add
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {CARE_SUGGESTIONS.map((instruction) => {
                        const isAdded = careInstructionsValue.includes(instruction);
                        return (
                          <button
                            key={instruction}
                            type="button"
                            disabled={isAdded}
                            onClick={() =>
                              setValue(
                                "careInstructions",
                                [...careInstructionsValue, instruction],
                                { shouldDirty: true, shouldValidate: true }
                              )
                            }
                            className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                              isAdded
                                ? "cursor-default border-[#C9A96E]/40 bg-[#C9A96E]/10 text-[#80602E]"
                                : "border-gray-200 bg-white text-gray-600 hover:border-[#C9A96E] hover:text-[#80602E]"
                            }`}
                          >
                            {isAdded ? "Added · " : "+ "}
                            {instruction}
                          </button>
                        );
                      })}
                    </div>
                  </div>
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
                {imageError && (
                  <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                    {imageError}
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
                {categories.map((cat) => (
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

      {submitError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {submitError}
        </div>
      )}
      <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-6">
        <Button
          type="button"
          variant="ghost"
          disabled={isSubmitting}
          onClick={() => {
            setSubmitError("");
            setImageError("");
          }}
        >
          Discard
        </Button>
        <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
          {initialData ? "Save Changes" : "Create Product"}
        </Button>
      </div>
    </form>
  );
}

export { ProductForm };
