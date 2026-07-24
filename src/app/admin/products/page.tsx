"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Package,
  Download,
  Trash,
  Image as ImageIcon,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/ui/data-table";
import { Product, Category } from "@/types";
import { formatCurrency } from "@/lib/utils";

const MOCK_CATEGORIES: Category[] = [
  { id: "1", name: "Kurtis", slug: "kurtis", sortOrder: 0, isActive: true, createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "2", name: "Suits", slug: "suits", sortOrder: 1, isActive: true, createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "3", name: "Sarees", slug: "sarees", sortOrder: 2, isActive: true, createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "4", name: "Dupattas", slug: "dupattas", sortOrder: 3, isActive: true, createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "5", name: "Accessories", slug: "accessories", sortOrder: 4, isActive: true, createdAt: "2026-01-01T00:00:00.000Z" },
];

const MOCK_PRODUCTS: Product[] = Array.from({ length: 24 }, (_, i) => ({
  id: `prod-${i + 1}`,
  name: [
    "Silk Embroidered Kurti",
    "Chiffon Premium Suit",
    "Banarasi Silk Saree",
    "Organza Dupatta",
    "Pearl Set",
    "Velvet Jacket",
    "Linen Kurta",
    "Net Lehenga",
  ][i % 8],
  slug: `product-${i + 1}`,
  description: "Premium quality luxury wear from AA Neddles.",
  shortDescription: "Luxury wear",
  price: [4500, 8900, 12500, 3200, 6700, 9500, 5800, 15000][i % 8],
  compareAtPrice: [5000, 9900, 14000, 3800, 7500, 10000, 6500, 17000][i % 8],
  costPrice: [2500, 5000, 7000, 1800, 3500, 5500, 3200, 8500][i % 8],
  sku: `AA-${String(i + 1).padStart(4, "0")}`,
  barcode: `629${String(i + 1).padStart(9, "0")}`,
  stock: [45, 12, 0, 3, 28, 67, 8, 2][i % 8],
  lowStockThreshold: 5,
  weight: 0.5,
  status: (["active", "active", "draft", "active", "archived", "active", "draft", "active"] as const)[i % 8],
  isFeatured: i % 3 === 0,
  isNewArrival: i % 5 === 0,
  isBestSeller: i % 4 === 0,
  images: [
    { id: `img-${i}-1`, url: "/placeholder.jpg", alt: `Product ${i + 1}`, sortOrder: 0 },
  ],
  categories: [MOCK_CATEGORIES[i % 5]],
  tags: ["new", "premium"],
  createdAt: new Date(2026, 0, 15 + i).toISOString(),
  updatedAt: new Date(2026, 6, 10 + i).toISOString(),
}));

function fetchProducts(): Promise<{ data: Product[]; total: number }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: MOCK_PRODUCTS, total: MOCK_PRODUCTS.length });
    }, 800);
  });
}

function deleteProduct(_id: string): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 500);
  });
}

export default function ProductsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedRows, setSelectedRows] = useState<Product[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    },
  });

  const filteredProducts = useMemo(() => {
    if (!productsData?.data) return [];
    return productsData.data.filter((p) => {
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || p.status === statusFilter;
      const matchCategory =
        categoryFilter === "all" ||
        p.categories.some((c) => c.id === categoryFilter);
      return matchSearch && matchStatus && matchCategory;
    });
  }, [productsData, search, statusFilter, categoryFilter]);

  const handleExportCSV = () => {
    const headers = ["Name", "SKU", "Price", "Stock", "Status"];
    const rows = selectedRows.length > 0 ? selectedRows : filteredProducts;
    const csv = [
      headers.join(","),
      ...rows.map((p) =>
        [p.name, p.sku, p.price, p.stock, p.status].join(",")
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns: ColumnDef<Product, unknown>[] = [
    {
      id: "image",
      header: "",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="h-12 w-12 overflow-hidden rounded-lg border border-gray-100 bg-[#F5F0EB]">
            {product.images[0] ? (
              <div className="flex h-full w-full items-center justify-center bg-[#F5F0EB]">
                <ImageIcon className="h-5 w-5 text-gray-300" />
              </div>
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <ImageIcon className="h-5 w-5 text-gray-300" />
              </div>
            )}
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
      size: 56,
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="font-medium text-[#1A1A1A]">{row.original.name}</div>
      ),
    },
    {
      accessorKey: "sku",
      header: "SKU",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-gray-500">{row.original.sku}</span>
      ),
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => (
        <span className="font-medium">{formatCurrency(row.original.price)}</span>
      ),
    },
    {
      accessorKey: "stock",
      header: "Stock",
      cell: ({ row }) => {
        const stock = row.original.stock;
        const isLow = stock <= row.original.lowStockThreshold && stock > 0;
        const isOut = stock === 0;
        return (
          <span
            className={`font-medium ${
              isOut
                ? "text-red-600"
                : isLow
                ? "text-red-500"
                : "text-[#1A1A1A]"
            }`}
          >
            {stock}
            {isLow && !isOut && (
              <span className="ml-1.5 text-xs text-red-400">Low</span>
            )}
            {isOut && (
              <span className="ml-1.5 text-xs text-red-400">Out</span>
            )}
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        const variants: Record<string, "default" | "secondary" | "destructive"> = {
          active: "default",
          draft: "secondary",
          archived: "destructive",
        };
        return (
          <Badge variant={variants[status] || "secondary"}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger className="text-gray-400 hover:text-[#1A1A1A]">
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() =>
                  router.push(`/admin/products/${product.id}/edit`)
                }
              >
                <Pencil className="h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                destructive
                onClick={() => {
                  setProductToDelete(product);
                  setDeleteDialogOpen(true);
                }}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      enableSorting: false,
      enableHiding: false,
      size: 48,
    },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between"
      >
        <h1 className="text-2xl font-semibold tracking-tight text-[#1A1A1A]">
          Products
        </h1>
        <Button onClick={() => router.push("/admin/products/new")}>
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card>
          <CardContent className="p-6">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex h-10 w-full max-w-sm rounded-lg border border-gray-200 bg-[#F5F0EB]/50 px-3 py-2 text-sm text-[#1A1A1A] transition-colors placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A96E]/30 focus:border-[#C9A96E]"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex h-10 appearance-none rounded-lg border border-gray-200 bg-[#F5F0EB]/50 px-3 py-2 pr-8 text-sm text-[#1A1A1A] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9A96E]/30 focus:border-[#C9A96E]"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="flex h-10 appearance-none rounded-lg border border-gray-200 bg-[#F5F0EB]/50 px-3 py-2 pr-8 text-sm text-[#1A1A1A] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9A96E]/30 focus:border-[#C9A96E]"
              >
                <option value="all">All Categories</option>
                {MOCK_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <AnimatePresence>
              {selectedRows.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 overflow-hidden"
                >
                  <div className="flex items-center gap-3 rounded-lg border border-[#C9A96E]/20 bg-[#C9A96E]/5 px-4 py-3">
                    <span className="text-sm font-medium text-[#1A1A1A]">
                      {selectedRows.length} selected
                    </span>
                    <div className="ml-auto flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExportCSV}
                      >
                        <Download className="h-3.5 w-3.5" />
                        Export CSV
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          selectedRows.forEach((p) =>
                            deleteMutation.mutate(p.id)
                          );
                          setSelectedRows([]);
                        }}
                      >
                        <Trash className="h-3.5 w-3.5" />
                        Delete Selected
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 px-4 py-3">
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-lg ml-auto" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <EmptyState
                icon={<Package className="h-8 w-8" />}
                title="No products found"
                description="Create your first product to start selling."
                action={{
                  label: "Add Product",
                  onClick: () => router.push("/admin/products/new"),
                }}
              />
            ) : (
              <DataTable
                columns={columns}
                data={filteredProducts}
                searchKey="name"
                searchPlaceholder="Search products..."
                bulkSelect
                onRowSelectionChange={setSelectedRows}
                pageSize={10}
              />
            )}
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogTitle>Delete Product</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &ldquo;{productToDelete?.name}&rdquo;? This action
            cannot be undone.
          </DialogDescription>
          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setProductToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              loading={deleteMutation.isPending}
              onClick={() => {
                if (productToDelete) {
                  deleteMutation.mutate(productToDelete.id);
                }
              }}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
