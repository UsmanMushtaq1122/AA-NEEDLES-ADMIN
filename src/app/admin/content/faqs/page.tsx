"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/toast";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  GripVertical,
  HelpCircle,
  Search,
  Filter,
  X,
  FolderOpen,
} from "lucide-react";
import Link from "next/link";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  active: boolean;
  order: number;
}

interface FAQCategory {
  id: string;
  name: string;
  isActive: boolean;
  sortOrder: number;
}



const categoryConfig: Record<string, string> = {
  Shipping: "bg-blue-50 text-blue-600 border-blue-200",
  Returns: "bg-amber-50 text-amber-700 border-amber-200",
  Sizing: "bg-emerald-50 text-emerald-600 border-emerald-200",
  Orders: "bg-[#C9A96E]/10 text-[#7A6543] border-[#C9A96E]/20",
};

export default function FAQsPage() {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [dbCategories, setDbCategories] = useState<FAQCategory[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FAQ | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();
  const [form, setForm] = useState({
    question: "",
    answer: "",
    category: "",
    active: true,
  });

  const fetchFAQs = useCallback(async () => {
    try {
      const res = await api.get<any>("/faqs");
      setFaqs(res.data || []);
    } catch (error) {
      console.error("Failed to fetch FAQs", error);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get<any>("/faq-categories");
      setDbCategories(res.data || []);
    } catch (error) {
      console.error("Failed to fetch FAQ categories", error);
    }
  }, []);

  useEffect(() => {
    fetchFAQs();
    fetchCategories();
  }, [fetchFAQs, fetchCategories]);

  const defaultCategories: string[] = [
    "ORDER",
    "SHIPPING",
    "RETURN",
    "PAYMENTS",
    "ACCOUNT",
    "PRODUCTS",
  ];

  const categories: string[] = dbCategories.map((c) => c.name);

  const allCategoryNames: string[] = Array.from(
    new Set([
      ...categories,
      ...faqs.map((f: any) => f.category).filter(Boolean),
      "Uncategorized",
    ])
  );

  const filtered = faqs.filter((faq: any) => {
    const matchesCategory = filterCategory === "all" || faq.category === filterCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const groupedFAQs = allCategoryNames.reduce((acc: Record<string, any[]>, cat) => {
    acc[cat] = filtered.filter((f: any) => (f.category || "Uncategorized") === cat);
    return acc;
  }, {} as Record<string, any[]>);

  const openAdd = () => {
    setEditingItem(null);
    setForm({
      question: "",
      answer: "",
      category: categories[0] || defaultCategories[0] || "",
      active: true,
    });
    setDialogOpen(true);
  };

  const openEdit = (item: FAQ) => {
    setEditingItem(item);
    setForm({
      question: item.question,
      answer: item.answer,
      category: item.category,
      active: item.active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setActionLoading("save");
    try {
      if (editingItem) {
        await api.put<any>(`/faqs/${editingItem.id}`, form);
        toast("success", "FAQ updated successfully");
      } else {
        await api.post<any>("/faqs", {
          ...form,
          sortOrder: faqs.length,
        });
        toast("success", "FAQ added successfully");
      }
      fetchFAQs();
      setDialogOpen(false);
    } catch (error: any) {
      toast("error", error?.message || "Failed to save FAQ");
    } finally {
      setActionLoading(null);
    }
  };

  const toggleActive = async (id: string) => {
    const faq = faqs.find((f) => f.id === id);
    if (!faq) return;
    try {
      await api.patch<any>(`/faqs/${id}`, { active: !faq.active });
      toast("success", "Status updated successfully");
      fetchFAQs();
    } catch (error: any) {
      toast("error", error?.message || "Failed to toggle status");
    }
  };

  const moveItem = async (id: string, direction: "up" | "down") => {
    const idx = faqs.findIndex((f) => f.id === id);
    const newIdx = direction === "up" ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= faqs.length) return;

    const currentItem = faqs[idx];
    const swapItem = faqs[newIdx];

    try {
      await Promise.all([
        api.put(`/faqs/${currentItem.id}`, { sortOrder: swapItem.order }),
        api.put(`/faqs/${swapItem.id}`, { sortOrder: currentItem.order }),
      ]);
      toast("success", "Order updated successfully");
      fetchFAQs();
    } catch (error: any) {
      toast("error", error?.message || "Failed to update order");
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await api.delete(`/faqs/${id}`);
      toast("success", "FAQ deleted successfully");
      fetchFAQs();
    } catch (error: any) {
      toast("error", error?.message || "Failed to delete FAQ");
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F0EB]">
      <div className="p-8 max-w-[1000px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-light tracking-wide text-[#1A1A1A]">FAQs</h1>
              <p className="text-[#1A1A1A]/50 mt-1 font-light">{faqs.length} frequently asked questions</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={openAdd} className="bg-[#1A1A1A] text-white hover:bg-[#1A1A1A]/80 font-light tracking-wide">
                <Plus className="w-4 h-4 mr-2" />
                Add FAQ
              </Button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A1A1A]/30" />
              <Input
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-stone-200 bg-[#F5F0EB]/50 font-light focus:border-[#C9A96E] focus:ring-[#C9A96E]/20"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={filterCategory === "all" ? "default" : "outline"}
                className={cn(
                  "font-light text-xs uppercase tracking-wide",
                  filterCategory === "all"
                    ? "bg-[#1A1A1A] text-white"
                    : "border-stone-200 text-[#1A1A1A]/60"
                )}
                onClick={() => setFilterCategory("all")}
              >
                All
              </Button>
              {allCategoryNames.map((cat) => (
                <Button
                  key={cat}
                  variant={filterCategory === cat ? "default" : "outline"}
                  className={cn(
                    "font-light text-xs uppercase tracking-wide",
                    filterCategory === cat
                      ? "bg-[#1A1A1A] text-white"
                      : "border-stone-200 text-[#1A1A1A]/60"
                  )}
                  onClick={() => setFilterCategory(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            {Object.entries(groupedFAQs).map(([category, items]) => {
              if (items.length === 0) return null;
              return (
                <div key={category}>
                  <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-sm font-medium text-[#1A1A1A] uppercase tracking-widest">
                      {category}
                    </h2>
                    <Badge className={cn("text-[9px] uppercase tracking-wider font-medium border", categoryConfig[category] || "bg-stone-100 text-stone-500 border-stone-200")}>
                      {items.length}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {items.map((faq, index) => (
                      <motion.div
                        key={faq.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Card className="bg-white border-0 shadow-sm">
                          <CardContent className="p-0">
                            <div
                              role="button"
                              tabIndex={0}
                              className="w-full text-left p-4 flex items-center gap-4 hover:bg-[#F5F0EB]/30 transition-colors rounded-lg cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A1A]/20"
                              onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  setExpandedId(expandedId === faq.id ? null : faq.id);
                                }
                              }}
                            >
                              <div className="flex items-center gap-2 shrink-0">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-[#1A1A1A]/20 hover:text-[#1A1A1A]"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveItem(faq.id, "up");
                                  }}
                                  disabled={index === 0}
                                >
                                  <ChevronUp className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-[#1A1A1A]/20 hover:text-[#1A1A1A]"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveItem(faq.id, "down");
                                  }}
                                  disabled={index === items.length - 1}
                                >
                                  <ChevronDown className="w-3 h-3" />
                                </Button>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className={cn("font-medium text-sm", faq.active ? "text-[#1A1A1A]" : "text-[#1A1A1A]/40")}>
                                    {faq.question}
                                  </p>
                                  {!faq.active && (
                                    <Badge className="text-[8px] uppercase tracking-wider bg-stone-100 text-stone-400 border-0 shrink-0">
                                      Draft
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <ChevronRight
                                className={cn(
                                  "w-4 h-4 text-[#1A1A1A]/20 transition-transform shrink-0",
                                  expandedId === faq.id && "rotate-90"
                                )}
                              />
                            </div>
                            <AnimatePresence>
                              {expandedId === faq.id && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-4 pb-4 pl-14">
                                    <Separator className="bg-stone-100 mb-3" />
                                    <p className="text-sm text-[#1A1A1A]/50 font-light leading-relaxed mb-4">
                                      {faq.answer}
                                    </p>
                                    <div className="flex items-center gap-3">
                                      <Switch
                                        checked={faq.active}
                                        onCheckedChange={() => toggleActive(faq.id)}
                                      />
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 px-3 text-xs font-light"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          openEdit(faq);
                                        }}
                                      >
                                        <Pencil className="w-3 h-3 mr-1" />
                                        Edit
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 px-3 text-xs font-light text-[#8B1A1A]/50 hover:text-[#8B1A1A]"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          deleteItem(faq.id);
                                        }}
                                      >
                                        <Trash2 className="w-3 h-3 mr-1" />
                                        Delete
                                      </Button>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-white border-0 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-light tracking-wide text-[#1A1A1A]">
              {editingItem ? "Edit" : "Add"} FAQ
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 mt-2">
            <div>
              <label className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 font-medium mb-2 block">Question</label>
              <Input
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
                placeholder="Enter the question..."
                className="border-stone-200 bg-[#F5F0EB]/50 font-light focus:border-[#C9A96E] focus:ring-[#C9A96E]/20"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 font-medium mb-2 block">Answer</label>
              <Textarea
                value={form.answer}
                onChange={(e) => setForm({ ...form, answer: e.target.value })}
                placeholder="Enter the answer..."
                className="border-stone-200 bg-[#F5F0EB]/50 font-light min-h-[120px] focus:border-[#C9A96E] focus:ring-[#C9A96E]/20"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 font-medium mb-2 block">Category</label>
              <Select value={form.category} onValueChange={(val) => setForm({ ...form, category: val })}>
                <SelectTrigger className="border-stone-200 bg-[#F5F0EB]/50 font-light">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {defaultCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                  {categories
                    .filter((cat) => !defaultCategories.includes(cat) && cat !== "Other")
                    .map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 font-medium">Active</label>
              <Switch checked={form.active} onCheckedChange={(checked) => setForm({ ...form, active: checked })} />
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
                {actionLoading === "save" ? "Saving..." : editingItem ? "Save Changes" : "Add FAQ"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
