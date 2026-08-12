"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
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
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();
  const [activeFilter, setActiveFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

  const fetchReviews = useCallback(() => {
    setLoading(true);
    api.get<any>("/reviews")
      .then((res) => {
        const mapped = (res.data || []).map((r: any) => ({
          ...r,
          customerName: r.customerName || r.customer?.name || "Unknown",
          customerEmail: r.customerEmail || r.customer?.email || "",
        }));
        setReviews(mapped);
      })
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

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

  const approveReview = async (id: string) => {
    setActionLoading(id);
    try {
      await api.put(`/reviews/${id}`, { isApproved: true });
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, isApproved: true } : r))
      );
      setSelectedIds((prev) => prev.filter((sid) => sid !== id));
      toast("success", "Review approved successfully");
    } catch (error: any) {
      toast("error", error?.message || "Failed to approve review");
    } finally {
      setActionLoading(null);
    }
  };

  const rejectReview = async (id: string) => {
    setActionLoading(id);
    try {
      await api.put(`/reviews/${id}`, { isApproved: false });
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, isApproved: false } : r))
      );
      toast("success", "Review rejected successfully");
    } catch (error: any) {
      toast("error", error?.message || "Failed to reject review");
    } finally {
      setActionLoading(null);
    }
  };

  const deleteReview = async (id: string) => {
    setActionLoading(id);
    try {
      await api.delete(`/reviews/${id}`);
      setReviews((prev) => prev.filter((r) => r.id !== id));
      setSelectedIds((prev) => prev.filter((sid) => sid !== id));
      toast("success", "Review deleted successfully");
    } catch (error: any) {
      toast("error", error?.message || "Failed to delete review");
    } finally {
      setActionLoading(null);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const bulkApprove = async () => {
    setActionLoading("bulk");
    try {
      await Promise.all(
        selectedIds.map((id) => api.put(`/reviews/${id}`, { isApproved: true }))
      );
      setReviews((prev) =>
        prev.map((r) =>
          selectedIds.includes(r.id) ? { ...r, isApproved: true } : r
        )
      );
      toast("success", `${selectedIds.length} review(s) approved successfully`);
      setSelectedIds([]);
    } catch (error: any) {
      toast("error", error?.message || "Failed to approve some reviews");
      fetchReviews();
    } finally {
      setActionLoading(null);
    }
  };

  const bulkDelete = async () => {
    setActionLoading("bulk");
    try {
      await Promise.all(
        selectedIds.map((id) => api.delete(`/reviews/${id}`))
      );
      setReviews((prev) => prev.filter((r) => !selectedIds.includes(r.id)));
      toast("success", `${selectedIds.length} review(s) deleted successfully`);
      setSelectedIds([]);
    } catch (error: any) {
      toast("error", error?.message || "Failed to delete some reviews");
      fetchReviews();
    } finally {
      setActionLoading(null);
    }
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
            <Button size="sm" variant="outline" className="gap-1.5" onClick={bulkApprove} disabled={actionLoading === "bulk"}>
              <CheckCircle2 className="h-3.5 w-3.5" />
              {actionLoading === "bulk" ? "Processing..." : "Approve"}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="gap-1.5"
              onClick={() => setBulkDeleteOpen(true)}
              disabled={actionLoading === "bulk"}
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
                    <DropdownMenuTrigger asChild>
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
