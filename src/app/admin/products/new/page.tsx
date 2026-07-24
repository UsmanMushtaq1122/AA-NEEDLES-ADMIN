"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { ProductForm } from "@/components/products/product-form";
import { useToast } from "@/components/ui/toast";

function createProduct(data: Record<string, unknown>): Promise<{ success: boolean; data: { id: string } }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, data: { id: "new-prod-1", ...data } });
    }, 1000);
  });
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
    onError: () => {
      toast("error", "Failed to create product");
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
        onSubmit={(data) => mutation.mutate(data as Record<string, unknown>)}
        isLoading={mutation.isPending}
      />
    </div>
  );
}
