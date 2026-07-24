"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Star,
  CheckCircle2,
  XCircle,
  Trash2,
  MoreHorizontal,
  ShieldCheck,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { formatDate, cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { Review } from "@/types";

const mockReviews: Review[] = [
  {
    id: "1",
    customerName: "Aisha Malik",
    customerEmail: "aisha.malik@gmail.com",
    productId: "p1",
    product: { id: "p1", name: "Midnight Velvet Anarkali", slug: "midnight-velvet-anarkali", description: "", price: 18500, sku: "AA-VA-001", stock: 10, lowStockThreshold: 5, status: "active", isFeatured: false, isNewArrival: false, isBestSeller: false, images: [], categories: [], tags: [], createdAt: "", updatedAt: "" },
    rating: 5,
    title: "Absolutely Stunning!",
    comment: "The craftsmanship on this Anarkali is breathtaking. The velvet fabric feels incredibly luxurious and the embroidery detail is even more beautiful in person. Received so many compliments at my cousin's wedding. Worth every rupee!",
    isVerified: true,
    isApproved: true,
    createdAt: "2026-07-15T10:30:00Z",
  },
  {
    id: "2",
    customerName: "Fatima Qureshi",
    customerEmail: "fatima.q@yahoo.com",
    productId: "p2",
    product: { id: "p2", name: "Pearl Embellished Clutch", slug: "pearl-embellished-clutch", description: "", price: 6500, sku: "AA-PC-002", stock: 25, lowStockThreshold: 5, status: "active", isFeatured: false, isNewArrival: true, isBestSeller: false, images: [], categories: [], tags: [], createdAt: "", updatedAt: "" },
    rating: 4,
    title: "Elegant but Small",
    comment: "Beautiful clutch with delicate pearl work. It fits my phone, keys, and a small wallet perfectly. The only reason I'm giving 4 stars is that I wish it came with a chain strap option. Overall very happy with the purchase.",
    isVerified: true,
    isApproved: true,
    createdAt: "2026-07-14T15:20:00Z",
  },
  {
    id: "3",
    customerName: "Sana Raza",
    customerEmail: "sana.raza@hotmail.com",
    productId: "p3",
    product: { id: "p3", name: "Silk Formal Sharara Set", slug: "silk-formal-sharara", description: "", price: 24000, sku: "AA-SS-003", stock: 8, lowStockThreshold: 3, status: "active", isFeatured: true, isNewArrival: false, isBestSeller: true, images: [], categories: [], tags: [], createdAt: "", updatedAt: "" },
    rating: 5,
    title: "Perfect for Eidi",
    comment: "Ordered this for Eid and it exceeded all expectations. The silk is pure quality, the stitching is impeccable, and the color is exactly as shown. My whole family loved it. Will definitely order again!",
    isVerified: true,
    isApproved: true,
    createdAt: "2026-07-12T09:45:00Z",
  },
  {
    id: "4",
    customerName: "Nadia Aslam",
    customerEmail: "nadia.aslam@gmail.com",
    productId: "p4",
    product: { id: "p4", name: "Embroidered Organza Dupatta", slug: "embroidered-organza-dupatta", description: "", price: 4200, sku: "AA-OD-004", stock: 30, lowStockThreshold: 10, status: "active", isFeatured: false, isNewArrival: false, isBestSeller: false, images: [], categories: [], tags: [], createdAt: "", updatedAt: "" },
    rating: 3,
    title: "Nice but arrived wrinkled",
    comment: "The dupatta design is gorgeous but it arrived quite wrinkled. I had to get it professionally steamed before wearing. The embroidery is lovely and the fabric quality is good. Packaging could be improved for such a premium brand.",
    isVerified: false,
    isApproved: false,
    createdAt: "2026-07-11T12:00:00Z",
  },
  {
    id: "5",
    customerName: "Hina Javed",
    customerEmail: "hina.javed@outlook.com",
    productId: "p5",
    product: { id: "p5", name: "Rose Gold Choker Set", slug: "rose-gold-choker-set", description: "", price: 12800, sku: "AA-RC-005", stock: 15, lowStockThreshold: 5, status: "active", isFeatured: true, isNewArrival: true, isBestSeller: false, images: [], categories: [], tags: [], createdAt: "", updatedAt: "" },
    rating: 5,
    title: "Jewelry that speaks elegance",
    comment: "This choker set is a masterpiece. The rose gold tone is warm and flattering, and the stone work is delicate yet eye-catching. I wore it to a mehendi and everyone asked where I got it from. Highly recommend for special occasions!",
    isVerified: true,
    isApproved: false,
    createdAt: "2026-07-10T14:30:00Z",
  },
  {
    id: "6",
    customerName: "Mehreen Tariq",
    customerEmail: "mehreen.t@gmail.com",
    productId: "p6",
    product: { id: "p6", name: "Cashmere Pashmina Shawl", slug: "cashmere-pashmina-shawl", description: "", price: 9500, sku: "AA-PS-006", stock: 20, lowStockThreshold: 5, status: "active", isFeatured: false, isNewArrival: false, isBestSeller: true, images: [], categories: [], tags: [], createdAt: "", updatedAt: "" },
    rating: 2,
    title: "Expected better quality",
    comment: "For the price point, I expected heavier cashmere. The shawl is quite thin and the color is slightly different from the website photos. It's not bad, but doesn't match the luxury feel of other AA Neddles products I've purchased. Disappointed.",
    isVerified: true,
    isApproved: true,
    createdAt: "2026-07-09T11:15:00Z",
  },
  {
    id: "7",
    customerName: "Zara Hussain",
    customerEmail: "zara.hussain@gmail.com",
    productId: "p1",
    product: { id: "p1", name: "Midnight Velvet Anarkali", slug: "midnight-velvet-anarkali", description: "", price: 18500, sku: "AA-VA-001", stock: 10, lowStockThreshold: 5, status: "active", isFeatured: false, isNewArrival: false, isBestSeller: false, images: [], categories: [], tags: [], createdAt: "", updatedAt: "" },
    rating: 5,
    title: "My go-to formal wear",
    comment: "This is my third purchase from AA Neddles and they never disappoint. The Anarkali fits like a dream and the color is perfect for evening events. The packaging was also very premium - felt like unwrapping a gift to myself.",
    isVerified: true,
    isApproved: true,
    createdAt: "2026-07-08T16:00:00Z",
  },
  {
    id: "8",
    customerName: "Rabia Naveed",
    customerEmail: "rabia.n@yahoo.com",
    productId: "p7",
    product: { id: "p7", name: "Jacquard Formal Suit", slug: "jacquard-formal-suit", description: "", price: 21000, sku: "AA-JS-007", stock: 12, lowStockThreshold: 4, status: "active", isFeatured: false, isNewArrival: true, isBestSeller: false, images: [], categories: [], tags: [], createdAt: "", updatedAt: "" },
    rating: 4,
    title: "Beautiful fabric, runs large",
    comment: "The jacquard fabric is premium and the design is unique. However, the suit runs about half a size large. I'd recommend sizing down. The color palette is perfect for formal events. Customer service was helpful with my size exchange query.",
    isVerified: false,
    isApproved: false,
    createdAt: "2026-07-07T13:45:00Z",
  },
];

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const sizeClass = size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5";
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            sizeClass,
            i < rating
              ? "fill-[#C9A96E] text-[#7A6543]"
              : "fill-gray-200 text-gray-200"
          )}
        />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [activeFilter, setActiveFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const filtered = useMemo(() => {
    return reviews.filter((r) => {
      const matchFilter =
        activeFilter === "all" ||
        (activeFilter === "pending" && !r.isApproved) ||
        (activeFilter === "approved" && r.isApproved) ||
        (activeFilter === "rejected" && r.isApproved === false && reviews.some((rev) => rev.id === r.id && !rev.isApproved));
      const matchRating = ratingFilter === null || r.rating === ratingFilter;
      const statusMatch =
        activeFilter === "rejected"
          ? !r.isApproved && reviews.some((rev) => rev.id === r.id && !rev.isApproved)
          : matchFilter;
      return (activeFilter === "all" || matchFilter) && matchRating;
    });
  }, [reviews, activeFilter, ratingFilter]);

  const averageRating = reviews.length
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  const approveReview = (id: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isApproved: true } : r))
    );
    setSelectedIds((prev) => prev.filter((sid) => sid !== id));
  };

  const rejectReview = (id: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isApproved: false } : r))
    );
  };

  const deleteReview = (id: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
    setSelectedIds((prev) => prev.filter((sid) => sid !== id));
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const bulkApprove = () => {
    setReviews((prev) =>
      prev.map((r) =>
        selectedIds.includes(r.id) ? { ...r, isApproved: true } : r
      )
    );
    setSelectedIds([]);
  };

  const bulkDelete = () => {
    setReviews((prev) => prev.filter((r) => !selectedIds.includes(r.id)));
    setSelectedIds([]);
  };

  const pendingCount = reviews.filter((r) => !r.isApproved).length;

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-[#1A1A1A]">
              Reviews
            </h1>
            <div className="flex items-center gap-1.5 rounded-full bg-[#C9A96E]/10 px-3 py-1">
              <Star className="h-4 w-4 fill-[#C9A96E] text-[#7A6543]" />
              <span className="text-sm font-bold text-[#7A6543]">{averageRating}</span>
              <span className="text-xs text-gray-500">/ 5.0</span>
            </div>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {reviews.length} total reviews &middot; {pendingCount} pending
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
          {(["all", "pending", "approved", "rejected"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={cn(
                "rounded-md px-4 py-1.5 text-xs font-medium capitalize transition-all",
                activeFilter === f
                  ? "bg-white text-[#7A6543] shadow-sm"
                  : "text-gray-500 hover:text-[#1A1A1A]"
              )}
            >
              {f === "pending" ? "Pending Approval" : f}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500">Rating:</span>
          {[null, 5, 4, 3, 2, 1].map((r) => (
            <button
              key={r === null ? "all" : r}
              onClick={() => setRatingFilter(r)}
              className={cn(
                "flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-all",
                ratingFilter === r
                  ? "bg-[#C9A96E]/15 text-[#7A6543]"
                  : "text-gray-400 hover:text-[#1A1A1A]"
              )}
            >
              {r === null ? (
                "All"
              ) : (
                <>
                  {r}
                  <Star className="h-3 w-3 fill-current" />
                </>
              )}
            </button>
          ))}
        </div>

        {selectedIds.length > 0 && (
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-gray-500">
              {selectedIds.length} selected
            </span>
            <Button size="sm" variant="outline" className="gap-1.5" onClick={bulkApprove}>
              <CheckCircle2 className="h-3.5 w-3.5" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="gap-1.5"
              onClick={() => setBulkDeleteOpen(true)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((review, i) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="border-gray-100 transition-shadow hover:shadow-md">
              <CardContent className="p-5">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(review.id)}
                      onChange={() => toggleSelect(review.id)}
                      className="h-4 w-4 rounded border-gray-300 accent-[#C9A96E]"
                    />
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#C9A96E]/10 text-sm font-bold text-[#7A6543]">
                      {review.customerName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1A1A1A]">
                        {review.customerName}
                      </p>
                      <p className="text-[11px] text-gray-400">
                        {formatDate(review.createdAt)}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <button className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#1A1A1A]">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {!review.isApproved && (
                        <DropdownMenuItem onClick={() => approveReview(review.id)}>
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          Approve
                        </DropdownMenuItem>
                      )}
                      {review.isApproved && (
                        <DropdownMenuItem onClick={() => rejectReview(review.id)}>
                          <XCircle className="h-4 w-4 text-orange-600" />
                          Reject
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem destructive onClick={() => deleteReview(review.id)}>
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <p className="mb-1 text-xs font-medium text-gray-500">
                  {review.product.name}
                </p>

                <div className="mb-2 flex items-center gap-2">
                  <StarRating rating={review.rating} />
                  {review.title && (
                    <span className="text-sm font-semibold text-[#1A1A1A]">
                      {review.title}
                    </span>
                  )}
                </div>

                <p className="mb-3 line-clamp-3 text-sm leading-relaxed text-[#1A1A1A]/70">
                  {review.comment}
                </p>

                <div className="flex items-center gap-2">
                  {review.isVerified && (
                    <Badge className="gap-1 bg-emerald-50 text-emerald-700 border-emerald-200">
                      <ShieldCheck className="h-3 w-3" />
                      Verified
                    </Badge>
                  )}
                  <Badge
                    variant={review.isApproved ? "default" : "secondary"}
                    className={cn(
                      !review.isApproved && "bg-orange-50 text-orange-700 border-orange-200"
                    )}
                  >
                    {review.isApproved ? "Approved" : "Pending"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#C9A96E]/10">
            <MessageSquare className="h-7 w-7 text-[#7A6543]" />
          </div>
          <p className="text-base font-semibold text-[#1A1A1A]">No reviews found</p>
          <p className="mt-1 text-sm text-gray-500">
            No reviews match your current filters
          </p>
        </div>
      )}

      <ConfirmDialog
        open={bulkDeleteOpen}
        title="Delete Reviews"
        description={`Are you sure you want to permanently delete ${selectedIds.length} selected review(s)? This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          bulkDelete();
          setBulkDeleteOpen(false);
        }}
        onCancel={() => setBulkDeleteOpen(false)}
      />
    </div>
  );
}
