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
import { api, ApiError } from "@/lib/api";
import type { Product } from "@/types";

function toProductPayload(data: Record<string, unknown>) {
  const { categoryIds, ...rest } = data;
  const selectedCategoryIds = Array.isArray(categoryIds) ? categoryIds : [];

  return {
    ...rest,
    categoryId: selectedCategoryIds[0],
  };
}

async function fetchProduct(id: string): Promise<Product> {
  const res = await api.get<any>(`/products/${id}`);
  return res.data;
}

async function updateProduct(id: string, data: Record<string, unknown>): Promise<{ success: boolean }> {
  await api.put(`/products/${id}`, data);
  return { success: true };
}

async function deleteProduct(id: string): Promise<void> {
  await api.delete(`/products/${id}`);
}

async function duplicateProduct(id: string): Promise<{ success: boolean; data: Product }> {
  const res = await api.get<any>(`/products/${id}`);
  const product = res.data;
  const duplicated = await api.post<any>(
    "/products",
    toProductPayload({
      ...product,
      name: `${product.name} (Copy)`,
    })
  );
  return { success: true, data: duplicated.data };
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
    onError: (err) => {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          toast("error", "This product already exists.");
        } else if (err.status === 400) {
          toast("error", err.message || "Please fill in all required fields.");
        } else {
          toast("error", "Something went wrong. Please try again.");
        }
      } else {
        toast("error", "Something went wrong. Please try again.");
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast("success", "Product deleted");
      router.push("/admin/products");
    },
    onError: (error) => {
      toast(
        "error",
        error?.message ||
          "Product could not be deleted. Archive it instead if it has order history."
      );
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
        onSubmit={(data) => updateMutation.mutate(toProductPayload(data as Record<string, unknown>))}
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
