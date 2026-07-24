"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  active: boolean;
  order: number;
}

const mockFAQs: FAQ[] = [
  {
    id: "f1",
    question: "What are your shipping charges?",
    answer: "We offer free shipping on all orders above PKR 25,000 within Pakistan. For orders below this threshold, a flat rate of PKR 500 applies. International shipping rates vary by destination and are calculated at checkout. Express delivery is available for an additional PKR 1,000.",
    category: "Shipping",
    active: true,
    order: 0,
  },
  {
    id: "f2",
    question: "How long does delivery take?",
    answer: "Standard delivery within Pakistan takes 3-5 business days. Express delivery is available in major cities (Lahore, Karachi, Islamabad) and takes 1-2 business days. International orders typically arrive within 7-14 business days depending on the destination country.",
    category: "Shipping",
    active: true,
    order: 1,
  },
  {
    id: "f3",
    question: "Do you ship internationally?",
    answer: "Yes, we ship to over 40 countries worldwide. International orders are shipped via DHL Express and include tracking. Please note that customs duties and import taxes are the responsibility of the customer and vary by country.",
    category: "Shipping",
    active: true,
    order: 2,
  },
  {
    id: "f4",
    question: "What is your return policy?",
    answer: "We accept returns within 14 days of delivery for unworn items in their original packaging with tags attached. Sale items are final sale and cannot be returned. To initiate a return, please contact our customer service team with your order number.",
    category: "Returns",
    active: true,
    order: 3,
  },
  {
    id: "f5",
    question: "How do I exchange an item?",
    answer: "Exchanges are available for a different size or color of the same item, subject to stock availability. Please contact us within 14 days of delivery. The item must be unworn, unwashed, and in its original packaging. We will arrange a pickup and send the replacement once we receive the original item.",
    category: "Returns",
    active: true,
    order: 4,
  },
  {
    id: "f6",
    question: "When will I receive my refund?",
    answer: "Refunds are processed within 5-7 business days after we receive and inspect the returned item. The refund will be credited to your original payment method. For cash on delivery orders, refunds are made via bank transfer — please provide your account details to our customer service team.",
    category: "Returns",
    active: true,
    order: 5,
  },
  {
    id: "f7",
    question: "How do I find my size?",
    answer: "Each product page includes a detailed size guide with measurements in both inches and centimeters. We recommend measuring yourself and comparing with our chart. If you're between sizes, we suggest sizing up for a more comfortable fit. Our customer service team is also available to help with sizing questions via WhatsApp at +92 321 1234567.",
    category: "Sizing",
    active: true,
    order: 6,
  },
  {
    id: "f8",
    question: "Are your clothes true to size?",
    answer: "Our clothing is designed to fit true to size according to our size chart. However, fit may vary slightly depending on the style and fabric. Each product page includes specific fit information (e.g., 'relaxed fit', 'tailored fit') to help you choose. When in doubt, our customer service team can provide personalized recommendations.",
    category: "Sizing",
    active: true,
    order: 7,
  },
  {
    id: "f9",
    question: "Can I modify or cancel my order?",
    answer: "Orders can be modified or cancelled within 2 hours of placement. After this window, our team begins processing and packing. Please contact us immediately via WhatsApp or email at support@aanneddles.com with your order number if you need to make changes.",
    category: "Orders",
    active: true,
    order: 8,
  },
  {
    id: "f10",
    question: "What payment methods do you accept?",
    answer: "We accept all major credit and debit cards (Visa, Mastercard), bank transfers, JazzCash, EasyPaisa, and cash on delivery (COD). For orders above PKR 100,000, we also offer installment plans through our banking partners. All online transactions are secured with 256-bit SSL encryption.",
    category: "Orders",
    active: true,
    order: 9,
  },
  {
    id: "f11",
    question: "How do I track my order?",
    answer: "Once your order is dispatched, you'll receive an SMS and email with a tracking number and link. You can also track your order by logging into your account and visiting the 'My Orders' section. For any delivery concerns, our team is available Monday to Saturday, 10 AM to 7 PM.",
    category: "Orders",
    active: false,
    order: 10,
  },
];

const categoryConfig: Record<string, string> = {
  Shipping: "bg-blue-50 text-blue-600 border-blue-200",
  Returns: "bg-amber-50 text-amber-700 border-amber-200",
  Sizing: "bg-emerald-50 text-emerald-600 border-emerald-200",
  Orders: "bg-[#C9A96E]/10 text-[#7A6543] border-[#C9A96E]/20",
};

export default function FAQsPage() {
  const [faqs, setFaqs] = useState(mockFAQs);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FAQ | null>(null);
  const [form, setForm] = useState({
    question: "",
    answer: "",
    category: "Shipping",
    active: true,
  });

  const categories = [...new Set(faqs.map((f) => f.category))];

  const filtered = faqs.filter((faq) => {
    const matchesCategory = filterCategory === "all" || faq.category === filterCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const groupedFAQs = categories.reduce((acc, cat) => {
    acc[cat] = filtered.filter((f) => f.category === cat);
    return acc;
  }, {} as Record<string, FAQ[]>);

  const openAdd = () => {
    setEditingItem(null);
    setForm({ question: "", answer: "", category: "Shipping", active: true });
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

  const handleSave = () => {
    if (editingItem) {
      setFaqs((prev) =>
        prev.map((f) => (f.id === editingItem.id ? { ...f, ...form } : f))
      );
    } else {
      setFaqs((prev) => [
        ...prev,
        {
          id: `f${Date.now()}`,
          ...form,
          order: prev.length,
        },
      ]);
    }
    setDialogOpen(false);
  };

  const toggleActive = (id: string) => {
    setFaqs((prev) =>
      prev.map((f) => (f.id === id ? { ...f, active: !f.active } : f))
    );
  };

  const moveItem = (id: string, direction: "up" | "down") => {
    const idx = faqs.findIndex((f) => f.id === id);
    const newIdx = direction === "up" ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= faqs.length) return;
    const newList = [...faqs];
    [newList[idx], newList[newIdx]] = [newList[newIdx], newList[idx]];
    setFaqs(newList);
  };

  const deleteItem = (id: string) => {
    setFaqs((prev) => prev.filter((f) => f.id !== id));
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
            <Button onClick={openAdd} className="bg-[#1A1A1A] text-white hover:bg-[#1A1A1A]/80 font-light tracking-wide">
              <Plus className="w-4 h-4 mr-2" />
              Add FAQ
            </Button>
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
              {categories.map((cat) => (
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
                            <button
                              className="w-full text-left p-4 flex items-center gap-4 hover:bg-[#F5F0EB]/30 transition-colors rounded-lg"
                              onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
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
                            </button>
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
                  {categories.map((cat) => (
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
              <Button onClick={handleSave} className="bg-[#1A1A1A] text-white hover:bg-[#1A1A1A]/80 font-light tracking-wide">
                {editingItem ? "Save Changes" : "Add FAQ"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
