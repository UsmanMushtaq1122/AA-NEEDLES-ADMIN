"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Copy, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductForm } from "@/components/products/product-form";
import { useToast } from "@/components/ui/toast";
import type { Product } from "@/types";

const MOCK_PRODUCT: Product = {
  id: "prod-1",
  name: "Silk Embroidered Kurti",
  slug: "silk-embroidered-kurti",
  description:
    "Exquisite silk kurti featuring intricate hand embroidery. Crafted from premium mulberry silk with detailed thread work on the neckline and sleeves. A timeless piece for the modern woman who appreciates artisanal craftsmanship.",
  shortDescription: "Premium hand-embroidered silk kurti",
  price: 4500,
  compareAtPrice: 5000,
  costPrice: 2500,
  sku: "AA-0001",
  barcode: "629000000001",
  stock: 45,
  lowStockThreshold: 5,
  weight: 0.5,
  status: "active",
  isFeatured: true,
  isNewArrival: false,
  isBestSeller: true,
  images: [
    { id: "img-1", url: "/placeholder.jpg", alt: "Silk Kurti Front", sortOrder: 0 },
    { id: "img-2", url: "/placeholder.jpg", alt: "Silk Kurti Detail", sortOrder: 1 },
  ],
  categories: [
    { id: "1", name: "Kurtis", slug: "kurtis", sortOrder: 0, isActive: true, createdAt: "2026-01-01T00:00:00.000Z" },
    { id: "4", name: "Dupattas", slug: "dupattas", sortOrder: 3, isActive: true, createdAt: "2026-01-01T00:00:00.000Z" },
  ],
  tags: ["silk", "handmade", "premium", "bestseller"],
  seoTitle: "Silk Embroidered Kurti | AA Neddles",
  seoDescription:
    "Shop our premium hand-embroidered silk kurti. Exquisite craftsmanship meets modern elegance.",
  createdAt: "2026-01-15T00:00:00.000Z",
  updatedAt: "2026-07-10T00:00:00.000Z",
};

function fetchProduct(_id: string): Promise<Product> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(MOCK_PRODUCT), 600);
  });
}

function updateProduct(_id: string, _data: Record<string, unknown>): Promise<{ success: boolean }> {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ success: true }), 1000);
  });
}

function deleteProduct(_id: string): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 800);
  });
}

function duplicateProduct(_id: string): Promise<{ success: boolean; data: Product }> {
  return new Promise((resolve) => {
    setTimeout(
      () => resolve({ success: true, data: { ...MOCK_PRODUCT, id: "new-dup-id", name: "Silk Embroidered Kurti (Copy)" } }),
      800
    );
  });
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => fetchProduct(productId),
  });

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => updateProduct(productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast("success", "Product updated successfully");
      router.push("/admin/products");
    },
    onError: () => {
      toast("error", "Failed to update product");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast("success", "Product deleted");
      router.push("/admin/products");
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: () => duplicateProduct(productId),
    onSuccess: (data: { success: boolean; data: Product }) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast("success", "Product duplicated");
      router.push(`/admin/products/${data.data.id}/edit`);
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <Skeleton className="h-96 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-sm text-gray-500">Product not found.</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push("/admin/products")}
        >
          Back to Products
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-semibold tracking-tight text-[#1A1A1A]">
          Edit Product
        </h1>
      </motion.div>

      <ProductForm
        initialData={product}
        onSubmit={(data) => updateMutation.mutate(data)}
        isLoading={updateMutation.isPending}
      />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-[#1A1A1A]">
                  Duplicate this product
                </p>
                <p className="text-xs text-gray-500">
                  Create a copy of this product as a new draft.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                loading={duplicateMutation.isPending}
                onClick={() => duplicateMutation.mutate()}
              >
                <Copy className="h-4 w-4" />
                Duplicate Product
              </Button>
            </div>
            <div className="my-4 h-px bg-gray-100" />
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">
                  Delete this product
                </p>
                <p className="text-xs text-gray-500">
                  Permanently remove this product. This action cannot be undone.
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
                Delete Product
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogTitle>Delete Product</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &ldquo;{product.name}&rdquo;? This action
            cannot be undone.
          </DialogDescription>
          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              loading={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate()}
            >
              Delete Product
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
