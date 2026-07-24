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
import { cn, formatCurrency, formatDate, formatNumber } from "@/lib/utils";
import type { DashboardAnalytics } from "@/types";

function generateDateArray(days: number) {
  return Array.from({ length: days }, (_, i) => {
    const date = subDays(new Date(), days - 1 - i);
    return format(date, "yyyy-MM-dd");
  });
}

function useDashboardData() {
  return useQuery<DashboardAnalytics>({
    queryKey: ["dashboard-analytics"],
    queryFn: async () => {
      const dates = generateDateArray(30);

      const revenueData = dates.map((date) => ({
        date,
        revenue: Math.floor(120000 + Math.random() * 280000),
      }));

      const ordersData = dates.map((date) => ({
        date,
        orders: Math.floor(15 + Math.random() * 60),
      }));

      const customerData = dates.map((date) => ({
        date,
        customers: Math.floor(5 + Math.random() * 25),
      }));

      const recentOrders = [
        {
          id: "1",
          orderNumber: "AA-2026-1847",
          customer: { name: "Ayesha Khan", id: "c1", email: "ayesha@email.com", isActive: true, totalOrders: 12, totalSpent: 89500, addresses: [], createdAt: "", lastOrderAt: "" },
          customerId: "c1",
          items: [],
          subtotal: 24500,
          shippingCost: 200,
          discount: 0,
          codFee: 0,
          total: 24700,
          status: "delivered" as const,
          paymentStatus: "paid" as const,
          paymentMethod: "cod",
          shippingAddress: { label: "Home", fullName: "Ayesha Khan", phone: "0321-1234567", addressLine1: "House 12, Street 5", city: "Lahore", province: "Punjab", country: "Pakistan" },
          statusHistory: [],
          createdAt: subDays(new Date(), 0).toISOString(),
          updatedAt: subDays(new Date(), 0).toISOString(),
        },
        {
          id: "2",
          orderNumber: "AA-2026-1846",
          customer: { name: "Fatima Malik", id: "c2", email: "fatima@email.com", isActive: true, totalOrders: 8, totalSpent: 56200, addresses: [], createdAt: "", lastOrderAt: "" },
          customerId: "c2",
          items: [],
          subtotal: 18900,
          shippingCost: 200,
          discount: 500,
          codFee: 0,
          total: 18600,
          status: "shipped" as const,
          paymentStatus: "paid" as const,
          paymentMethod: "cod",
          shippingAddress: { label: "Home", fullName: "Fatima Malik", phone: "0300-9876543", addressLine1: "Flat 4B, Clifton Towers", city: "Karachi", province: "Sindh", country: "Pakistan" },
          statusHistory: [],
          createdAt: subDays(new Date(), 1).toISOString(),
          updatedAt: subDays(new Date(), 1).toISOString(),
        },
        {
          id: "3",
          orderNumber: "AA-2026-1845",
          customer: { name: "Sana Riaz", id: "c3", email: "sana@email.com", isActive: true, totalOrders: 5, totalSpent: 34100, addresses: [], createdAt: "", lastOrderAt: "" },
          customerId: "c3",
          items: [],
          subtotal: 32400,
          shippingCost: 0,
          discount: 1000,
          codFee: 0,
          total: 31400,
          status: "processing" as const,
          paymentStatus: "paid" as const,
          paymentMethod: "bank_transfer",
          shippingAddress: { label: "Home", fullName: "Sana Riaz", phone: "0311-5551234", addressLine1: "23-A, DHA Phase 5", city: "Lahore", province: "Punjab", country: "Pakistan" },
          statusHistory: [],
          createdAt: subDays(new Date(), 1).toISOString(),
          updatedAt: subDays(new Date(), 1).toISOString(),
        },
        {
          id: "4",
          orderNumber: "AA-2026-1844",
          customer: { name: "Hira Ahmed", id: "c4", email: "hira@email.com", isActive: true, totalOrders: 3, totalSpent: 21800, addresses: [], createdAt: "", lastOrderAt: "" },
          customerId: "c4",
          items: [],
          subtotal: 15600,
          shippingCost: 200,
          discount: 0,
          codFee: 0,
          total: 15800,
          status: "pending" as const,
          paymentStatus: "pending" as const,
          paymentMethod: "cod",
          shippingAddress: { label: "Home", fullName: "Hira Ahmed", phone: "0333-2223344", addressLine1: "House 7, F-8/2", city: "Islamabad", province: "Islamabad", country: "Pakistan" },
          statusHistory: [],
          createdAt: subDays(new Date(), 2).toISOString(),
          updatedAt: subDays(new Date(), 2).toISOString(),
        },
        {
          id: "5",
          orderNumber: "AA-2026-1843",
          customer: { name: "Zainab Hussain", id: "c5", email: "zainab@email.com", isActive: true, totalOrders: 15, totalSpent: 112400, addresses: [], createdAt: "", lastOrderAt: "" },
          customerId: "c5",
          items: [],
          subtotal: 42100,
          shippingCost: 0,
          discount: 2000,
          codFee: 0,
          total: 40100,
          status: "delivered" as const,
          paymentStatus: "paid" as const,
          paymentMethod: "card",
          shippingAddress: { label: "Home", fullName: "Zainab Hussain", phone: "0345-6667788", addressLine1: "15, Cavalry Ground", city: "Lahore", province: "Punjab", country: "Pakistan" },
          statusHistory: [],
          createdAt: subDays(new Date(), 3).toISOString(),
          updatedAt: subDays(new Date(), 3).toISOString(),
        },
      ];

      const lowStockProducts = [
        {
          id: "p1",
          name: "Noir Velvet Maxi - Emerald",
          slug: "noir-velvet-maxi-emerald",
          description: "",
          price: 12500,
          sku: "NV-EM-001",
          stock: 3,
          lowStockThreshold: 10,
          status: "active" as const,
          isFeatured: true,
          isNewArrival: false,
          isBestSeller: true,
          images: [],
          categories: [],
          tags: [],
          createdAt: "",
          updatedAt: "",
        },
        {
          id: "p2",
          name: "Gold Zari Bridal Lehnga",
          slug: "gold-zari-bridal-lehnga",
          description: "",
          price: 45000,
          sku: "GZ-BL-012",
          stock: 2,
          lowStockThreshold: 5,
          status: "active" as const,
          isFeatured: true,
          isNewArrival: false,
          isBestSeller: true,
          images: [],
          categories: [],
          tags: [],
          createdAt: "",
          updatedAt: "",
        },
        {
          id: "p3",
          name: "Chiffon Palace Suit - Ivory",
          slug: "chiffon-palace-suit-ivory",
          description: "",
          price: 8900,
          sku: "CP-IV-034",
          stock: 4,
          lowStockThreshold: 8,
          status: "active" as const,
          isFeatured: false,
          isNewArrival: true,
          isBestSeller: false,
          images: [],
          categories: [],
          tags: [],
          createdAt: "",
          updatedAt: "",
        },
        {
          id: "p4",
          name: "Raw Silk Kurti - Maroon",
          slug: "raw-silk-kurti-maroon",
          description: "",
          price: 5200,
          sku: "RS-KM-019",
          stock: 1,
          lowStockThreshold: 10,
          status: "active" as const,
          isFeatured: false,
          isNewArrival: false,
          isBestSeller: true,
          images: [],
          categories: [],
          tags: [],
          createdAt: "",
          updatedAt: "",
        },
      ];

      return {
        totalRevenue: 7845200,
        totalOrders: 1247,
        totalCustomers: 3892,
        activeProducts: 186,
        averageOrderValue: 6291,
        conversionRate: 3.8,
        pendingOrders: 23,
        revenueChart: revenueData,
        ordersChart: ordersData,
        customerGrowth: customerData,
        topProducts: [
          { name: "Noir Velvet Maxi Collection", sold: 342, revenue: 4275000 },
          { name: "Gold Zari Bridal Series", sold: 128, revenue: 5760000 },
          { name: "Chiffon Palace Suits", sold: 276, revenue: 2456400 },
          { name: "Raw Silk Pret Line", sold: 198, revenue: 1029600 },
          { name: "Embroidered Lawn Vol.3", sold: 445, revenue: 3115000 },
        ],
        categoryPerformance: [
          { name: "Bridal", products: 24, revenue: 3200000 },
          { name: "Pret", products: 48, revenue: 2100000 },
          { name: "Formal", products: 36, revenue: 1800000 },
          { name: "Luxury Lawn", products: 42, revenue: 1400000 },
          { name: "Accessories", products: 36, revenue: 600000 },
        ],
        recentOrders,
        lowStockProducts,
      };
    },
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
  const { data, isLoading } = useDashboardData();

  const kpiCards = useMemo(() => {
    if (!data) return [];
    return [
      {
        label: "Total Revenue",
        value: formatCurrency(data.totalRevenue),
        change: 12.5,
        icon: DollarSign,
        accent: "bg-[#C9A96E]/10 text-[#7A6543]",
        ring: "ring-[#C9A96E]/20",
      },
      {
        label: "Total Orders",
        value: formatNumber(data.totalOrders),
        change: 8.2,
        icon: ShoppingCart,
        accent: "bg-blue-50 text-blue-600",
        ring: "ring-blue-200",
      },
      {
        label: "Total Customers",
        value: formatNumber(data.totalCustomers),
        change: 15.3,
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

      <motion.div variants={item} className="grid grid-cols-1 gap-5 lg:grid-cols-2">
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
