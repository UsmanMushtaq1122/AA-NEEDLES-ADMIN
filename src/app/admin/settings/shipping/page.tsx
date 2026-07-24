"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Save, Truck, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { shippingSchema } from "@/lib/validations";
import { useToast } from "@/components/ui/toast";

type ShippingForm = {
  shippingCost: number;
  expressShippingCost: number;
  freeShippingThreshold: number;
  codFee: number;
  codEnabled: boolean;
};

const MOCK_SHIPPING: ShippingForm = {
  shippingCost: 200,
  expressShippingCost: 500,
  freeShippingThreshold: 5000,
  codFee: 50,
  codEnabled: true,
};

function saveShipping(_data: ShippingForm): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 800));
}

export default function ShippingSettingsPage() {
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ShippingForm>({
    resolver: zodResolver(shippingSchema) as any,
    defaultValues: MOCK_SHIPPING,
  });

  const codEnabled = watch("codEnabled");

  const saveMutation = useMutation({
    mutationFn: saveShipping,
    onSuccess: () => {
      toast("success", "Shipping settings saved successfully");
    },
    onError: () => {
      toast("error", "Failed to save shipping settings");
    },
  });

  const onSubmit = (data: ShippingForm) => {
    saveMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-semibold tracking-tight text-[#1A1A1A]">
          Shipping Settings
        </h1>
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#C9A96E]/10">
                  <Truck className="h-5 w-5 text-[#7A6543]" />
                </div>
                <div>
                  <CardTitle>Shipping Rates</CardTitle>
                  <CardDescription>
                    Configure standard and express delivery pricing
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Input
                  label="Standard Shipping (PKR)"
                  type="number"
                  {...register("shippingCost", { valueAsNumber: true })}
                  error={errors.shippingCost?.message}
                />
                <Input
                  label="Express Shipping (PKR)"
                  type="number"
                  {...register("expressShippingCost", { valueAsNumber: true })}
                  error={errors.expressShippingCost?.message}
                />
              </div>
              <div>
                <Input
                  label="Free Shipping Threshold (PKR)"
                  type="number"
                  {...register("freeShippingThreshold", { valueAsNumber: true })}
                  error={errors.freeShippingThreshold?.message}
                />
                <p className="mt-1.5 text-xs text-gray-400">
                  Orders above this amount qualify for free standard shipping. Set
                  to 0 to disable.
                </p>
              </div>
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
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#C9A96E]/10">
                  <CreditCard className="h-5 w-5 text-[#7A6543]" />
                </div>
                <div>
                  <CardTitle>Cash on Delivery</CardTitle>
                  <CardDescription>
                    Manage COD availability and associated fees
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-[#F5F0EB]/30 px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-[#1A1A1A]">
                    Enable Cash on Delivery
                  </p>
                  <p className="text-xs text-gray-500">
                    Allow customers to pay upon delivery
                  </p>
                </div>
                <Switch
                  checked={codEnabled}
                  onCheckedChange={(checked) => setValue("codEnabled", checked)}
                />
              </div>
              <Input
                label="COD Fee (PKR)"
                type="number"
                {...register("codFee", { valueAsNumber: true })}
                error={errors.codFee?.message}
              />
            </CardContent>
          </Card>
        </motion.div>

        <div className="flex justify-end">
          <Button type="submit" loading={saveMutation.isPending}>
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
