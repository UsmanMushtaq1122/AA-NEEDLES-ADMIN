"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/toast";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  Search,
  FolderOpen,
  ShieldCheck,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

interface FAQCategory {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  isDefault: boolean;
  sortOrder: number;
  usageCount: number;
  createdAt: string;
}

const PAGE_SIZE = 10;

export default function FAQCategoriesPage() {
  const [categories, setCategories] = useState<FAQCategory[]>([]);
  const [allCategories, setAllCategories] = useState<FAQCategory[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "disabled">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FAQCategory | null>(null);
  const [form, setForm] = useState({ name: "", isActive: true });
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchCategories = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: String(currentPage), limit: String(PAGE_SIZE) });
      if (searchQuery) params.set("q", searchQuery);
      if (statusFilter !== "all") params.set("active", statusFilter === "active" ? "true" : "false");
      const [pageRes, allRes] = await Promise.all([
        api.get<any>(`/faq-categories/admin?${params.toString()}`),
        api.get<any>("/faq-categories/admin?page=1&limit=1000"),
      ]);
      setCategories(pageRes.data || []);
      setTotal(pageRes.meta?.total || 0);
      setAllCategories(allRes.data || []);
    } catch (error) {
      console.error("Failed to fetch FAQ categories", error);
    }
  }, [currentPage, searchQuery, statusFilter]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const openAdd = () => {
    setEditingItem(null);
    setForm({ name: "", isActive: true });
    setDialogOpen(true);
  };

  const openEdit = (item: FAQCategory) => {
    setEditingItem(item);
    setForm({ name: item.name, isActive: item.isActive });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast("error", "Category name is required");
      return;
    }
    setActionLoading("save");
    try {
      if (editingItem) {
        await api.put<any>(`/faq-categories/${editingItem.id}`, form);
        toast("success", "Category updated successfully");
      } else {
        await api.post<any>("/faq-categories", form);
        toast("success", "Category added successfully");
      }
      fetchCategories();
      setDialogOpen(false);
    } catch (error: any) {
      toast("error", error?.message || "Failed to save category");
    } finally {
      setActionLoading(null);
    }
  };

  const toggleActive = async (item: FAQCategory) => {
    setActionLoading(item.id);
    try {
      await api.put<any>(`/faq-categories/${item.id}`, { isActive: !item.isActive });
      toast("success", item.isActive ? "Category disabled" : "Category enabled");
      fetchCategories();
    } catch (error: any) {
      toast("error", error?.message || "Failed to toggle status");
    } finally {
      setActionLoading(null);
    }
  };

  const moveItem = async (item: FAQCategory, direction: "up" | "down") => {
    const list = allCategories.length ? allCategories : categories;
    const idx = list.findIndex((c) => c.id === item.id);
    const newIdx = direction === "up" ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= list.length) return;
    const current = list[idx];
    const swap = list[newIdx];
    setActionLoading(item.id);
    try {
      await api.post<any>("/faq-categories/reorder", {
        order: list.map((c) => {
          if (c.id === current.id) return swap.id;
          if (c.id === swap.id) return current.id;
          return c.id;
        }),
      });
      toast("success", "Order updated successfully");
      fetchCategories();
    } catch (error: any) {
      toast("error", error?.message || "Failed to update order");
    } finally {
      setActionLoading(null);
    }
  };

  const deleteItem = async (item: FAQCategory) => {
    if (!window.confirm(`Delete category "${item.name}"?`)) return;
    setActionLoading(item.id);
    try {
      await api.delete(`/faq-categories/${item.id}`);
      toast("success", "Category deleted successfully");
      fetchCategories();
    } catch (error: any) {
      toast("error", error?.message || "Failed to delete category");
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className="min-h-screen bg-[#F5F0EB]">
      <div className="p-8 max-w-[1000px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-light tracking-wide text-[#1A1A1A]">FAQ Categories</h1>
              <p className="text-[#1A1A1A]/50 mt-1 font-light">
                {total} categories — organize FAQs under groups
              </p>
            </div>
            <Button onClick={openAdd} className="bg-[#1A1A1A] text-white hover:bg-[#1A1A1A]/80 font-light tracking-wide">
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A1A1A]/30" />
              <Input
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 border-stone-200 bg-[#F5F0EB]/50 font-light focus:border-[#C9A96E] focus:ring-[#C9A96E]/20"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {(["all", "active", "disabled"] as const).map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? "default" : "outline"}
                  className={cn(
                    "font-light text-xs uppercase tracking-wide",
                    statusFilter === status
                      ? "bg-[#1A1A1A] text-white"
                      : "border-stone-200 text-[#1A1A1A]/60"
                  )}
                  onClick={() => {
                    setStatusFilter(status);
                    setCurrentPage(1);
                  }}
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-stone-100">
                      <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-[#1A1A1A]/40 font-medium w-[10%]">Order</th>
                      <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-[#1A1A1A]/40 font-medium">Name</th>
                      <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-[#1A1A1A]/40 font-medium">Status</th>
                      <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-[#1A1A1A]/40 font-medium">FAQs</th>
                      <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-[#1A1A1A]/40 font-medium">Created</th>
                      <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-[#1A1A1A]/40 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <FolderOpen className="w-10 h-10 mx-auto text-[#1A1A1A]/15 mb-3" />
                          <p className="text-sm text-[#1A1A1A]/40 font-light">No categories found</p>
                        </td>
                      </tr>
                    ) : (
                      categories.map((item, index) => (
                        <tr key={item.id} className="border-b border-stone-50 hover:bg-[#F5F0EB]/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <button
                                onClick={() => moveItem(item, "up")}
                                disabled={index === 0 || actionLoading === item.id}
                                className="text-[#1A1A1A]/20 hover:text-[#1A1A1A] disabled:opacity-30 transition-colors"
                                aria-label={`Move ${item.name} up`}
                              >
                                <ChevronUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => moveItem(item, "down")}
                                disabled={index === categories.length - 1 || actionLoading === item.id}
                                className="text-[#1A1A1A]/20 hover:text-[#1A1A1A] disabled:opacity-30 transition-colors"
                                aria-label={`Move ${item.name} down`}
                              >
                                <ChevronDown className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm text-[#1A1A1A]">{item.name}</span>
                              {item.isDefault && (
                                <Badge className="text-[8px] uppercase tracking-wider bg-[#C9A96E]/15 text-[#7A6543] border-[#C9A96E]/20 shrink-0">
                                  <ShieldCheck className="w-2.5 h-2.5 mr-1" />
                                  Default
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Switch
                              checked={item.isActive}
                              onCheckedChange={() => toggleActive(item)}
                              disabled={actionLoading === item.id}
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5">
                              <Layers className="w-3 h-3 text-[#1A1A1A]/30" />
                              <span className="text-sm text-[#1A1A1A]/60 font-light">{item.usageCount ?? 0}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-[#1A1A1A]/50 font-light whitespace-nowrap">
                            {formatDate(item.createdAt)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2.5 text-xs font-light"
                                onClick={() => openEdit(item)}
                              >
                                <Pencil className="w-3 h-3 mr-1" />
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2.5 text-xs font-light text-[#8B1A1A]/50 hover:text-[#8B1A1A]"
                                onClick={() => deleteItem(item)}
                                disabled={item.isDefault || actionLoading === item.id}
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-stone-100">
                  <p className="text-sm text-[#1A1A1A]/40 font-light">
                    Showing {(currentPage - 1) * PAGE_SIZE + 1} to {Math.min(currentPage * PAGE_SIZE, total)} of {total} categories
                  </p>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="w-8 h-8 border-[#E5DDCF] bg-white text-gray-600 hover:bg-[#F5F0EB] disabled:opacity-40"
                    >
                      <ChevronUp className="w-4 h-4 rotate-180" />
                    </Button>
                    {[...Array(totalPages)].map((_, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(i + 1)}
                        className={cn(
                          "w-8 h-8 text-xs p-0 border-[#E5DDCF]",
                          currentPage === i + 1
                            ? "bg-[#7A6543] text-white border-[#7A6543] font-semibold"
                            : "bg-white text-gray-700 hover:bg-[#F5F0EB]"
                        )}
                      >
                        {i + 1}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="w-8 h-8 border-[#E5DDCF] bg-white text-gray-600 hover:bg-[#F5F0EB] disabled:opacity-40"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-white border-0 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-light tracking-wide text-[#1A1A1A]">
              {editingItem ? "Edit" : "Add"} Category
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 mt-2">
            <div>
              <label className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 font-medium mb-2 block">
                Category Name
              </label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. GIFT CARDS"
                className="border-stone-200 bg-[#F5F0EB]/50 font-light focus:border-[#C9A96E] focus:ring-[#C9A96E]/20"
                disabled={editingItem?.isDefault}
              />
              {editingItem?.isDefault && (
                <p className="text-xs text-[#1A1A1A]/40 font-light mt-1.5">
                  Default categories are protected from deletion.
                </p>
              )}
            </div>
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 font-medium">
                Active
              </label>
              <Switch
                checked={form.isActive}
                onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-stone-200 text-[#1A1A1A]/60 font-light">
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="bg-[#1A1A1A] text-white hover:bg-[#1A1A1A]/80 font-light tracking-wide"
                disabled={actionLoading === "save"}
              >
                {actionLoading === "save" ? "Saving..." : editingItem ? "Save Changes" : "Add Category"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
