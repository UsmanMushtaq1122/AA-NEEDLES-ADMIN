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
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const MAX_TESTIMONIAL_VIDEO_SIZE = 10 * 1024 * 1024;
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
  customerName: string | null;
  content: string | null;
  rating: number;
  type: "gallery" | "video" | "instagram" | "story";
  image: string | null;
  videoUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}



const typeConfig: Record<Testimonial["type"], { label: string; icon: LucideIcon; color: string }> = {
  gallery: { label: "Gallery", icon: Image, color: "bg-[#C9A96E]/10 text-[#7A6543] border-[#C9A96E]/20" },
  video: { label: "Video", icon: Video, color: "bg-[#8B1A1A]/10 text-[#8B1A1A] border-[#8B1A1A]/20" },
  instagram: { label: "Instagram", icon: Instagram, color: "bg-pink-50 text-pink-600 border-pink-200" },
  story: { label: "Story", icon: MessageCircle, color: "bg-blue-50 text-blue-600 border-blue-200" },
};

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    api.get<{ data: Testimonial[] }>("/testimonials/admin")
      .then((res) => setTestimonials(res.data || []))
      .catch((error: unknown) => toast("error", error instanceof Error ? error.message : "Failed to load testimonials"))
      .finally(() => setLoading(false));
  }, [toast]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
  const [form, setForm] = useState({
    customerName: "",
    content: "",
    rating: 5,
    type: "gallery" as Testimonial["type"],
    image: "",
    videoUrl: "",
    isActive: true,
  });

  const filtered = filterType === "all" ? testimonials : testimonials.filter((t) => t.type === filterType);

  const openAdd = () => {
    setEditingItem(null);
    setForm({ customerName: "", content: "", rating: 5, type: "gallery", image: "", videoUrl: "", isActive: true });
    setPhotoFile(null);
    setVideoFile(null);
    setFileInputKey((key) => key + 1);
    setDialogOpen(true);
  };

  const openEdit = (item: Testimonial) => {
    setEditingItem(item);
    setForm({
      customerName: item.customerName || "",
      content: item.content || "",
      rating: item.rating,
      type: item.type,
      image: item.image || "",
      videoUrl: item.videoUrl || "",
      isActive: item.isActive,
    });
    setPhotoFile(null);
    setVideoFile(null);
    setFileInputKey((key) => key + 1);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setActionLoading("save");
    try {
      const payload = new FormData();
      payload.append("customerName", form.customerName);
      payload.append("content", form.content);
      payload.append("rating", String(form.rating));
      payload.append("type", form.type);
      payload.append("isActive", String(form.isActive));
      if (editingItem) payload.append("sortOrder", String(editingItem.sortOrder));
      if (form.type === "video" && form.videoUrl && !videoFile) payload.append("videoUrl", form.videoUrl);
      if (form.type !== "video") {
        if (photoFile) payload.append("image", photoFile);
        else payload.append("image", form.image);
      }

      if (editingItem) {
        const endpoint = videoFile
          ? `/testimonials/${editingItem.id}/video`
          : `/testimonials/${editingItem.id}`;
        if (videoFile) payload.append("video", videoFile);
        await api.upload(endpoint, payload, "PUT");
        toast("success", "Testimonial updated successfully");
      } else {
        const endpoint = videoFile ? "/testimonials/video" : "/testimonials";
        if (videoFile) payload.append("video", videoFile);
        await api.upload(endpoint, payload);
        toast("success", "Testimonial added successfully");
      }
      const res = await api.get<{ data: Testimonial[] }>("/testimonials/admin");
      setTestimonials(res.data || []);
      setDialogOpen(false);
      setPhotoFile(null);
      setVideoFile(null);
      setFileInputKey((key) => key + 1);
    } catch (error: unknown) {
      toast("error", error instanceof Error ? error.message : "Failed to save testimonial");
    } finally {
      setActionLoading(null);
    }
  };

  const toggleActive = async (id: string) => {
    const testimonial = testimonials.find((t) => t.id === id);
    if (!testimonial) return;
    try {
      await api.put(`/testimonials/${id}`, { isActive: !testimonial.isActive });
      toast("success", "Status updated successfully");
      const res = await api.get<{ data: Testimonial[] }>("/testimonials/admin");
      setTestimonials(res.data || []);
    } catch (error: unknown) {
      toast("error", error instanceof Error ? error.message : "Failed to toggle status");
    }
  };

  const moveItem = async (id: string, direction: "up" | "down") => {
    const idx = testimonials.findIndex((t) => t.id === id);
    const newIdx = direction === "up" ? idx - 1 : idx + 1;
    if (idx < 0 || newIdx < 0 || newIdx >= testimonials.length) return;

    const reordered = [...testimonials];
    [reordered[idx], reordered[newIdx]] = [reordered[newIdx], reordered[idx]];

    try {
      await Promise.all(reordered.map((item, sortOrder) =>
        api.put(`/testimonials/${item.id}`, { sortOrder })
      ));
      toast("success", "Order updated successfully");
      const res = await api.get<{ data: Testimonial[] }>("/testimonials/admin");
      setTestimonials(res.data || []);
    } catch (error: unknown) {
      toast("error", error instanceof Error ? error.message : "Failed to update order");
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await api.delete(`/testimonials/${id}`);
      toast("success", "Testimonial deleted successfully");
      setTestimonials((prev) => prev.filter((t) => t.id !== id));
    } catch (error: unknown) {
      toast("error", error instanceof Error ? error.message : "Failed to delete testimonial");
    }
  };

  return (
    <div className="-mx-4 min-h-screen bg-[#F5F0EB] sm:-mx-6">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#7A6543]">Content management</p>
              <h1 className="text-2xl font-light tracking-wide text-[#1A1A1A] sm:text-3xl">Testimonials</h1>
              <p className="mt-1 text-sm font-light text-[#1A1A1A]/50">
                {testimonials.length} {testimonials.length === 1 ? "testimonial" : "testimonials"}
              </p>
            </div>
            <Button onClick={openAdd} className="w-full bg-[#1A1A1A] font-light tracking-wide text-white hover:bg-[#1A1A1A]/80 sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add Testimonial
            </Button>
          </div>

          <div className="-mx-4 mb-6 overflow-x-auto px-4 pb-2 sm:mx-0 sm:mb-8 sm:px-0">
            <div className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
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
                  "h-9 shrink-0 gap-2 px-3 text-[10px] font-medium uppercase tracking-wide sm:px-4 sm:text-xs",
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
          </div>

          {loading ? (
            <p className="text-sm text-[#1A1A1A]/50">Loading testimonials...</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((testimonial) => {
                const index = testimonials.findIndex((item) => item.id === testimonial.id);
                const config = typeConfig[testimonial.type] || typeConfig.gallery;
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
                    <Card className="flex h-full flex-col overflow-hidden rounded-2xl border border-stone-100 bg-white shadow-sm transition-shadow hover:shadow-md">
                      <CardContent className="flex flex-1 flex-col p-4 sm:p-5">
                        <div className="mb-4 flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            {testimonial.image ? (
                              <div
                                role="img"
                                aria-label={`${testimonial.customerName || "Customer"} photo`}
                                className="w-10 h-10 rounded-full bg-cover bg-center bg-stone-100"
                                style={{ backgroundImage: `url("${testimonial.image}")` }}
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-[#1A1A1A] flex items-center justify-center text-white text-xs font-light tracking-wider">
                                {(testimonial.customerName || "C").slice(0, 1).toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-[#1A1A1A]">{testimonial.customerName || "Customer"}</p>
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
                          <Badge className={cn("shrink-0 border text-[9px] font-medium uppercase tracking-wider", config.color)}>
                            <TypeIcon className="w-3 h-3 mr-1" />
                            {config.label}
                          </Badge>
                        </div>

                        <Quote className="w-6 h-6 text-[#7A6543]/20 mb-2" />
                        <p className="line-clamp-4 flex-1 break-words text-sm font-light leading-relaxed text-[#1A1A1A]/60">
                          {testimonial.content || "No testimonial text provided."}
                        </p>

                        {!testimonial.isActive && (
                          <Badge className="text-[9px] uppercase tracking-wider bg-stone-100 text-stone-400 border-0 mt-3 w-fit">
                            Draft
                          </Badge>
                        )}

                        <div className="mt-4 flex items-center justify-between gap-2 border-t border-stone-100 pt-3">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label={`Move ${testimonial.customerName || "testimonial"} up`}
                              className="h-9 w-9 p-0 text-[#1A1A1A]/45 hover:text-[#1A1A1A] sm:h-8 sm:w-8"
                              onClick={() => moveItem(testimonial.id, "up")}
                              disabled={index === 0}
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label={`Move ${testimonial.customerName || "testimonial"} down`}
                              className="h-9 w-9 p-0 text-[#1A1A1A]/45 hover:text-[#1A1A1A] sm:h-8 sm:w-8"
                              onClick={() => moveItem(testimonial.id, "down")}
                              disabled={index === testimonials.length - 1}
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </Button>
                            <GripVertical className="w-3.5 h-3.5 text-[#1A1A1A]/15" />
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={testimonial.isActive}
                              onCheckedChange={() => toggleActive(testimonial.id)}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label={`Edit ${testimonial.customerName || "testimonial"}`}
                              className="h-9 w-9 p-0 sm:h-8 sm:w-8"
                              onClick={() => openEdit(testimonial)}
                            >
                              <Pencil className="w-3.5 h-3.5 text-[#1A1A1A]/40" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label={`Delete ${testimonial.customerName || "testimonial"}`}
                              className="h-9 w-9 p-0 sm:h-8 sm:w-8"
                              onClick={() => deleteItem(testimonial.id)}
                            >
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
              {filtered.length === 0 && (
                <p className="col-span-full text-sm text-[#1A1A1A]/50">No testimonials found.</p>
              )}
            </div>
          )}
        </motion.div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] max-w-2xl overflow-y-auto overscroll-contain rounded-2xl border-0 bg-white p-4 shadow-2xl sm:p-6">
          <DialogHeader className="mb-5 border-b border-stone-100 pb-4 text-left">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7A6543]">
              {editingItem ? "Manage customer story" : "Customer stories"}
            </p>
            <DialogTitle className="text-xl font-medium tracking-wide text-[#1A1A1A] sm:text-2xl">
              {editingItem ? "Edit" : "Add"} Testimonial
            </DialogTitle>
            <p className="text-sm text-stone-500">Share customer feedback with your store visitors.</p>
          </DialogHeader>
          <div className="mt-2 space-y-5 sm:space-y-6">
            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.15em] text-[#1A1A1A]/55">Customer Name</label>
              <Input
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                placeholder="Customer name..."
                className="h-11 border-stone-200 bg-[#F8F6F3] font-light focus:border-[#C9A96E] focus:ring-[#C9A96E]/20"
              />
            </div>
            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.15em] text-[#1A1A1A]/55">Testimonial Content</label>
              <Textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="What did the customer say..."
                className="min-h-28 resize-y border-stone-200 bg-[#F8F6F3] font-light focus:border-[#C9A96E] focus:ring-[#C9A96E]/20"
              />
            </div>
            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.15em] text-[#1A1A1A]/55">Rating</label>
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.15em] text-[#1A1A1A]/55">Type</label>
                <Select
                  value={form.type}
                  onValueChange={(val) => {
                    setForm({ ...form, type: val as Testimonial["type"] });
                    setPhotoFile(null);
                    setVideoFile(null);
                    setFileInputKey((key) => key + 1);
                  }}
                >
                  <SelectTrigger className="h-11 border-stone-200 bg-[#F8F6F3] font-light">
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
              {form.type === "video" ? (
              <div className="min-w-0 space-y-3">
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.15em] text-[#1A1A1A]/55">Video URL</label>
                <Input
                  value={form.videoUrl}
                  onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                  placeholder="https://..."
                  className="h-11 border-stone-200 bg-[#F8F6F3] font-light focus:border-[#C9A96E] focus:ring-[#C9A96E]/20"
                />
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.15em] text-[#1A1A1A]/55">Or Choose Video</label>
                <Input
                  key={`video-${fileInputKey}`}
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime,video/x-m4v"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    if (file && file.size > MAX_TESTIMONIAL_VIDEO_SIZE) {
                      toast("error", "Video must be 10 MB or smaller");
                      e.target.value = "";
                      setVideoFile(null);
                      return;
                    }
                    setVideoFile(file);
                  }}
                  className="h-auto min-h-11 border-stone-200 bg-[#F8F6F3] py-2 font-light file:mr-3 file:rounded-md file:bg-[#EDE6DC] file:px-3 file:py-1 file:text-xs"
                />
                {videoFile && <p className="text-xs text-[#1A1A1A]/50">Selected: {videoFile.name}</p>}
                {!videoFile && form.videoUrl && (
                  <video
                    key={form.videoUrl}
                    src={form.videoUrl}
                    controls
                    playsInline
                    className="max-h-48 w-full rounded-xl bg-black sm:max-h-56"
                  />
                )}
              </div>
              ) : null}
            </div>
            {form.type !== "video" && (
              <div className="min-w-0 space-y-4 rounded-xl border border-stone-100 bg-[#FCFBF9] p-3 sm:col-span-2 sm:p-4">
                <div>
                  <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.15em] text-[#1A1A1A]/55">Customer Photo</label>
                  <Input
                    key={fileInputKey}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp,image/avif"
                    onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                    className="h-auto min-h-11 border-stone-200 bg-white py-2 font-light file:mr-3 file:rounded-md file:bg-[#EDE6DC] file:px-3 file:py-1 file:text-xs"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.15em] text-[#1A1A1A]/55">Or Photo URL</label>
                  <Input
                    value={form.image}
                    onChange={(e) => {
                      setForm({ ...form, image: e.target.value });
                      setPhotoFile(null);
                      setFileInputKey((key) => key + 1);
                    }}
                    placeholder="https://..."
                    className="h-11 border-stone-200 bg-white font-light focus:border-[#C9A96E] focus:ring-[#C9A96E]/20"
                  />
                </div>
                {photoFile && <p className="break-all text-xs text-[#1A1A1A]/50">Selected: {photoFile.name}</p>}
              </div>
            )}
            <div className="flex items-center justify-between rounded-xl border border-stone-100 bg-[#FCFBF9] px-4 py-3">
              <div>
                <p className="text-sm font-medium text-[#1A1A1A]">Publish testimonial</p>
                <p className="text-xs text-stone-500">Visible to customers when active</p>
              </div>
              <Switch checked={form.isActive} onCheckedChange={(checked) => setForm({ ...form, isActive: checked })} />
            </div>
            <div className="flex flex-col-reverse gap-2 border-t border-stone-100 pt-4 sm:flex-row sm:justify-end sm:gap-3">
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="w-full border-stone-200 font-light text-[#1A1A1A]/70 sm:w-auto">
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="w-full bg-[#1A1A1A] font-light tracking-wide text-white hover:bg-[#1A1A1A]/80 sm:w-auto"
                disabled={actionLoading === "save" || !form.customerName.trim() || !form.content.trim()}
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
