"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import {
  Plus,
  Pencil,
  Trash2,
  Star,
  ChevronUp,
  ChevronDown,
  GripVertical,
  Image,
  Video,
  Instagram,
  MessageCircle,
  Quote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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
import { cn } from "@/lib/utils";

interface Testimonial {
  id: string;
  customerName: string;
  customerPhoto: string;
  content: string;
  rating: number;
  type: "gallery" | "video" | "instagram" | "story";
  mediaUrl: string;
  active: boolean;
  order: number;
  date: string;
}



const typeConfig: Record<string, { label: string; icon: any; color: string }> = {
  gallery: { label: "Gallery", icon: Image, color: "bg-[#C9A96E]/10 text-[#7A6543] border-[#C9A96E]/20" },
  video: { label: "Video", icon: Video, color: "bg-[#8B1A1A]/10 text-[#8B1A1A] border-[#8B1A1A]/20" },
  instagram: { label: "Instagram", icon: Instagram, color: "bg-pink-50 text-pink-600 border-pink-200" },
  story: { label: "Story", icon: MessageCircle, color: "bg-blue-50 text-blue-600 border-blue-200" },
};

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    api.get<any>("/testimonials")
      .then((res) => setTestimonials(res.data || []))
      .catch(() => setTestimonials([]))
      .finally(() => setLoading(false));
  }, []);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
  const [form, setForm] = useState({
    customerName: "",
    content: "",
    rating: 5,
    type: "gallery" as Testimonial["type"],
    mediaUrl: "",
    active: true,
  });

  const filtered = filterType === "all" ? testimonials : testimonials.filter((t) => t.type === filterType);

  const openAdd = () => {
    setEditingItem(null);
    setForm({ customerName: "", content: "", rating: 5, type: "gallery", mediaUrl: "", active: true });
    setDialogOpen(true);
  };

  const openEdit = (item: Testimonial) => {
    setEditingItem(item);
    setForm({
      customerName: item.customerName,
      content: item.content,
      rating: item.rating,
      type: item.type,
      mediaUrl: item.mediaUrl,
      active: item.active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setActionLoading("save");
    try {
      const payload = {
        customerName: form.customerName,
        content: form.content,
        rating: form.rating,
        type: form.type,
        mediaUrl: form.mediaUrl,
        isActive: form.active,
        sortOrder: editingItem ? editingItem.order : testimonials.length,
      };
      if (editingItem) {
        await api.put(`/testimonials/${editingItem.id}`, payload);
        toast("success", "Testimonial updated successfully");
      } else {
        await api.post("/testimonials", payload);
        toast("success", "Testimonial added successfully");
      }
      const res = await api.get<any>("/testimonials");
      setTestimonials(res.data || []);
      setDialogOpen(false);
    } catch (error: any) {
      toast("error", error?.message || "Failed to save testimonial");
    } finally {
      setActionLoading(null);
    }
  };

  const toggleActive = async (id: string) => {
    const testimonial = testimonials.find((t) => t.id === id);
    if (!testimonial) return;
    try {
      await api.put(`/testimonials/${id}`, { isActive: !testimonial.active });
      toast("success", "Status updated successfully");
      const res = await api.get<any>("/testimonials");
      setTestimonials(res.data || []);
    } catch (error: any) {
      toast("error", error?.message || "Failed to toggle status");
    }
  };

  const moveItem = async (id: string, direction: "up" | "down") => {
    const idx = testimonials.findIndex((t) => t.id === id);
    const newIdx = direction === "up" ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= testimonials.length) return;

    const currentItem = testimonials[idx];
    const swapItem = testimonials[newIdx];

    try {
      await Promise.all([
        api.put(`/testimonials/${currentItem.id}`, { sortOrder: swapItem.order }),
        api.put(`/testimonials/${swapItem.id}`, { sortOrder: currentItem.order }),
      ]);
      toast("success", "Order updated successfully");
      const res = await api.get<any>("/testimonials");
      setTestimonials(res.data || []);
    } catch (error: any) {
      toast("error", error?.message || "Failed to update order");
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await api.delete(`/testimonials/${id}`);
      toast("success", "Testimonial deleted successfully");
      setTestimonials((prev) => prev.filter((t) => t.id !== id));
    } catch (error: any) {
      toast("error", error?.message || "Failed to delete testimonial");
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F0EB]">
      <div className="p-8 max-w-[1400px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-light tracking-wide text-[#1A1A1A]">Testimonials</h1>
              <p className="text-[#1A1A1A]/50 mt-1 font-light">{testimonials.length} testimonials</p>
            </div>
            <Button onClick={openAdd} className="bg-[#1A1A1A] text-white hover:bg-[#1A1A1A]/80 font-light tracking-wide">
              <Plus className="w-4 h-4 mr-2" />
              Add Testimonial
            </Button>
          </div>

          <div className="flex gap-2 mb-8">
            {[
              { value: "all", label: "All", icon: Quote },
              { value: "gallery", label: "Gallery", icon: Image },
              { value: "video", label: "Video", icon: Video },
              { value: "instagram", label: "Instagram", icon: Instagram },
              { value: "story", label: "Story", icon: MessageCircle },
            ].map(({ value, label, icon: Icon }) => (
              <Button
                key={value}
                variant={filterType === value ? "default" : "outline"}
                className={cn(
                  "font-light text-xs uppercase tracking-wide gap-2",
                  filterType === value
                    ? "bg-[#1A1A1A] text-white"
                    : "border-stone-200 text-[#1A1A1A]/60 hover:border-[#C9A96E] hover:text-[#7A6543]"
                )}
                onClick={() => setFilterType(value)}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence mode="popLayout">
              {filtered.map((testimonial, index) => {
                const config = typeConfig[testimonial.type];
                const TypeIcon = config.icon;
                return (
                  <motion.div
                    key={testimonial.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="bg-white border-0 shadow-sm h-full flex flex-col">
                      <CardContent className="p-5 flex flex-col flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#1A1A1A] flex items-center justify-center text-white text-xs font-light tracking-wider">
                              {testimonial.customerPhoto}
                            </div>
                            <div>
                              <p className="font-medium text-[#1A1A1A] text-sm">{testimonial.customerName}</p>
                              <div className="flex gap-0.5 mt-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={cn(
                                      "w-3 h-3",
                                      i < testimonial.rating
                                        ? "fill-[#C9A96E] text-[#7A6543]"
                                        : "text-stone-200"
                                    )}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <Badge className={cn("text-[9px] uppercase tracking-wider font-medium border", config.color)}>
                            <TypeIcon className="w-3 h-3 mr-1" />
                            {config.label}
                          </Badge>
                        </div>

                        <Quote className="w-6 h-6 text-[#7A6543]/20 mb-2" />
                        <p className="text-sm text-[#1A1A1A]/60 font-light leading-relaxed flex-1">
                          {testimonial.content}
                        </p>

                        {!testimonial.active && (
                          <Badge className="text-[9px] uppercase tracking-wider bg-stone-100 text-stone-400 border-0 mt-3 w-fit">
                            Draft
                          </Badge>
                        )}

                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-stone-50">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-[#1A1A1A]/30 hover:text-[#1A1A1A]"
                              onClick={() => moveItem(testimonial.id, "up")}
                              disabled={index === 0}
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-[#1A1A1A]/30 hover:text-[#1A1A1A]"
                              onClick={() => moveItem(testimonial.id, "down")}
                              disabled={index === filtered.length - 1}
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </Button>
                            <GripVertical className="w-3.5 h-3.5 text-[#1A1A1A]/15" />
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={testimonial.active}
                              onCheckedChange={() => toggleActive(testimonial.id)}
                            />
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(testimonial)}>
                              <Pencil className="w-3.5 h-3.5 text-[#1A1A1A]/40" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => deleteItem(testimonial.id)}>
                              <Trash2 className="w-3.5 h-3.5 text-[#8B1A1A]/40 hover:text-[#8B1A1A]" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-white border-0 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-light tracking-wide text-[#1A1A1A]">
              {editingItem ? "Edit" : "Add"} Testimonial
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 mt-2">
            <div>
              <label className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 font-medium mb-2 block">Customer Name</label>
              <Input
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                placeholder="Customer name..."
                className="border-stone-200 bg-[#F5F0EB]/50 font-light focus:border-[#C9A96E] focus:ring-[#C9A96E]/20"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 font-medium mb-2 block">Testimonial Content</label>
              <Textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="What did the customer say..."
                className="border-stone-200 bg-[#F5F0EB]/50 font-light min-h-[100px] focus:border-[#C9A96E] focus:ring-[#C9A96E]/20"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 font-medium mb-2 block">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setForm({ ...form, rating: star })}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={cn(
                        "w-7 h-7 cursor-pointer transition-colors",
                        star <= form.rating
                          ? "fill-[#C9A96E] text-[#7A6543]"
                          : "text-stone-200 hover:text-[#7A6543]/50"
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 font-medium mb-2 block">Type</label>
                <Select value={form.type} onValueChange={(val) => setForm({ ...form, type: val as Testimonial["type"] })}>
                  <SelectTrigger className="border-stone-200 bg-[#F5F0EB]/50 font-light">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gallery">Gallery</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="story">Story</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 font-medium mb-2 block">Media URL</label>
                <Input
                  value={form.mediaUrl}
                  onChange={(e) => setForm({ ...form, mediaUrl: e.target.value })}
                  placeholder="/testimonials/..."
                  className="border-stone-200 bg-[#F5F0EB]/50 font-light focus:border-[#C9A96E] focus:ring-[#C9A96E]/20"
                />
              </div>
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
                {actionLoading === "save" ? "Saving..." : editingItem ? "Save Changes" : "Add Testimonial"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
