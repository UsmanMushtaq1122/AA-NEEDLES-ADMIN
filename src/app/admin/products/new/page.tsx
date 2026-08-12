"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { ProductForm } from "@/components/products/product-form";
import { useToast } from "@/components/ui/toast";
import { api, ApiError } from "@/lib/api";

function toCreateProductPayload(data: Record<string, unknown>) {
  const { categoryIds, ...rest } = data;
  const selectedCategoryIds = Array.isArray(categoryIds) ? categoryIds : [];

  return {
    ...rest,
    categoryId: selectedCategoryIds[0],
  };
}

async function createProduct(data: Record<string, unknown>): Promise<{ success: boolean; data: { id: string } }> {
  const res = await api.post<any>("/products", data);
  return res;
}

export default function NewProductPage() {
  const router = useRouter();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      toast("success", "Product created successfully");
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

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-semibold tracking-tight text-[#1A1A1A]">
          New Product
        </h1>
      </motion.div>

      <ProductForm
        onSubmit={(data) => mutation.mutate(toCreateProductPayload(data as Record<string, unknown>))}
        isLoading={mutation.isPending}
      />
    </div>
  );
}
