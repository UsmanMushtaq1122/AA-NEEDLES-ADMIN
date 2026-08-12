"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { format, subDays } from "date-fns";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Crown,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { OrdersChart } from "@/components/charts/orders-chart";
import { CustomerChart } from "@/components/charts/customer-chart";
import { cn, formatCurrency, formatDate, formatNumber } from "@/lib/utils";
import { api } from "@/lib/api";
import type { DashboardAnalytics, Order, DashboardStats } from "@/types";

function useDashboardData() {
  return useQuery<DashboardAnalytics>({
    queryKey: ["dashboard-analytics"],
    queryFn: async () => {
      const [statsRes, recentOrdersRes, salesRes, customerGrowthRes] = await Promise.all([
        api.get<{ success: boolean; data: DashboardStats }>("/dashboard/stats"),
        api.get<{ success: boolean; data: Order[] }>("/dashboard/recent-orders"),
        api.get<{ success: boolean; data: { date: string; orderCount: number; revenue: number }[] }>("/dashboard/sales"),
        api.get<{ success: boolean; data: { date: string; customers: number }[] }>("/dashboard/customer-growth"),
      ]);

      const stats = statsRes.data || {};
      const recentOrders = recentOrdersRes.data || [];
      const salesData = salesRes.data || [];
      const customerGrowthData = customerGrowthRes.data || [];

      const salesMap = new Map<string, { revenue: number; orders: number }>();
      for (const entry of salesData) {
        salesMap.set(entry.date, { revenue: entry.revenue, orders: entry.orderCount });
      }

      const customerMap = new Map<string, number>();
      for (const entry of customerGrowthData) {
        customerMap.set(entry.date, entry.customers);
      }

      const dates = Array.from({ length: 30 }, (_, i) => {
        const date = subDays(new Date(), 29 - i);
        return format(date, "yyyy-MM-dd");
      });

      const revenueChart = dates.map((date) => ({
        date,
        revenue: salesMap.get(date)?.revenue ?? 0,
      }));

      const ordersChart = dates.map((date) => ({
        date,
        orders: salesMap.get(date)?.orders ?? 0,
      }));

      const customerData = dates.map((date) => ({
        date,
        customers: customerMap.get(date) ?? 0,
      }));

      return {
        totalRevenue: stats.totalRevenue || 0,
        totalOrders: stats.totalOrders || 0,
        totalCustomers: stats.totalCustomers || 0,
        activeProducts: stats.activeProducts || 0,
        averageOrderValue: stats.averageOrderValue || 0,
        conversionRate: stats.conversionRate || 0,
        pendingOrders: stats.pendingOrders || 0,
        revenueChart,
        ordersChart,
        customerGrowth: customerData,
        topProducts: stats.topProducts || [],
        categoryPerformance: stats.categoryPerformance || [],
        recentOrders,
        lowStockProducts: stats.lowStockProducts || [],
      };
    },
    refetchInterval: 60000,
  });
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
} as const;

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
} as const;

export default function AdminDashboardPage() {
  const { data, isLoading, isError, error } = useDashboardData();

  const kpiCards = useMemo(() => {
    if (!data) return [];
    return [
      {
        label: "Total Revenue",
        value: formatCurrency(data.totalRevenue),
        change: null,
        icon: DollarSign,
        accent: "bg-[#C9A96E]/10 text-[#7A6543]",
        ring: "ring-[#C9A96E]/20",
      },
      {
        label: "Total Orders",
        value: formatNumber(data.totalOrders),
        change: null,
        icon: ShoppingCart,
        accent: "bg-blue-50 text-blue-600",
        ring: "ring-blue-200",
      },
      {
        label: "Total Customers",
        value: formatNumber(data.totalCustomers),
        change: null,
        icon: Users,
        accent: "bg-emerald-50 text-emerald-600",
        ring: "ring-emerald-200",
      },
      {
        label: "Active Products",
        value: formatNumber(data.activeProducts),
        change: null,
        icon: Package,
        accent: "bg-purple-50 text-purple-600",
        ring: "ring-purple-200",
      },
    ];
  }, [data]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 rounded-lg bg-gray-200 animate-pulse" />
            <div className="mt-2 h-4 w-32 rounded bg-gray-200 animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-gray-200 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-96 rounded-xl bg-gray-200 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertTriangle className="h-12 w-12 text-red-400 mb-4" />
        <h2 className="font-['Playfair_Display'] text-xl font-semibold text-[#1A1A1A] mb-2">Failed to load dashboard</h2>
        <p className="text-sm text-gray-500 mb-6">{(error as Error)?.message || 'An unexpected error occurred'}</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2.5 bg-[#1A1A1A] text-white text-sm font-semibold hover:bg-[#333] transition-colors">
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="font-['Playfair_Display'] text-3xl font-bold tracking-tight text-[#1A1A1A]">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-[#7A6543]" />
          <span className="text-sm font-medium text-[#1A1A1A]">Admin</span>
        </div>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.label} className="relative overflow-hidden border-0 bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl ring-1", kpi.accent, kpi.ring)}>
                  <kpi.icon className="h-5 w-5" />
                </div>
                {kpi.change !== null && (
                  <div className={cn("flex items-center gap-1 text-xs font-semibold", kpi.change >= 0 ? "text-emerald-600" : "text-red-500")}>
                    {kpi.change >= 0 ? (
                      <TrendingUp className="h-3.5 w-3.5" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5" />
                    )}
                    {kpi.change >= 0 ? "+" : ""}{kpi.change}%
                  </div>
                )}
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold tracking-tight text-[#1A1A1A]">{kpi.value}</p>
                <p className="mt-1 text-sm text-gray-500">{kpi.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="border-0 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="font-['Playfair_Display'] text-lg">Revenue Trend</CardTitle>
            <p className="text-sm text-gray-500">Last 30 days</p>
          </CardHeader>
          <CardContent>
            <RevenueChart data={data.revenueChart} />
          </CardContent>
        </Card>
        <Card className="border-0 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="font-['Playfair_Display'] text-lg">Orders Trend</CardTitle>
            <p className="text-sm text-gray-500">Last 30 days</p>
          </CardHeader>
          <CardContent>
            <OrdersChart data={data.ordersChart} />
          </CardContent>
        </Card>
        <Card className="border-0 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="font-['Playfair_Display'] text-lg">Customer Growth</CardTitle>
            <p className="text-sm text-gray-500">Last 30 days</p>
          </CardHeader>
          <CardContent>
            <CustomerChart data={data.customerGrowth} />
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card className="border-0 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="font-['Playfair_Display'] text-lg">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              {data.recentOrders.map((order, index) => (
                <div key={order.id}>
                  {index > 0 && <Separator className="my-3" />}
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <p className="text-sm font-semibold text-[#1A1A1A] truncate">{order.orderNumber}</p>
                        <StatusBadge status={order.status} type="order" />
                      </div>
                      <p className="mt-1 text-sm text-gray-500 truncate">{order.customer.name}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm font-semibold text-[#1A1A1A]">{formatCurrency(order.total)}</p>
                      <p className="mt-0.5 text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="font-['Playfair_Display'] text-lg">Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              {data.topProducts.map((product, index) => (
                <div key={product.name}>
                  {index > 0 && <Separator className="my-3" />}
                  <div className="flex items-center gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#C9A96E]/10 text-sm font-bold text-[#7A6543]">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1A1A1A] truncate">{product.name}</p>
                      <p className="mt-0.5 text-xs text-gray-500">{formatNumber(product.sold)} units sold</p>
                    </div>
                    <p className="text-sm font-semibold text-[#1A1A1A]">{formatCurrency(product.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card className="border-0 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <CardTitle className="font-['Playfair_Display'] text-lg">Low Stock Alerts</CardTitle>
            </div>
            <Badge variant="destructive">{data.lowStockProducts.length} items</Badge>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {data.lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="relative rounded-xl border border-red-100 bg-red-50/50 p-4 transition-colors hover:bg-red-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1A1A1A] truncate">{product.name}</p>
                      <p className="mt-1 text-xs text-gray-500">SKU: {product.sku}</p>
                    </div>
                    <Badge variant="destructive" className="shrink-0 ml-2">
                      {product.stock} left
                    </Badge>
                  </div>
                  <div className="mt-3">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-red-100">
                      <div
                        className="h-full rounded-full bg-red-500 transition-all"
                        style={{
                          width: `${Math.max(5, (product.stock / product.lowStockThreshold) * 100)}%`,
                        }}
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-gray-400">
                      Threshold: {product.lowStockThreshold}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
