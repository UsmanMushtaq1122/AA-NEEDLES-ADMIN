"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  Image,
  Eye,
  Link as LinkIcon,
  GripVertical,
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { compressImage } from "@/lib/compress-image";

interface EditorialItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  link: string;
  category: string;
  active: boolean;
  order: number;
  date: string;
}

export default function EditorialPage() {
  const [editorials, setEditorials] = useState<EditorialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EditorialItem | null>(null);
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    description: "",
    imageUrl: "",
    link: "",
    category: "",
    active: true,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [titleError, setTitleError] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    api.get<any>("/editorial")
      .then((res) => setEditorials(res.data || []))
      .catch(() => setEditorials([]))
      .finally(() => setLoading(false));
  }, []);

  const openAdd = () => {
    setEditingItem(null);
    setForm({ title: "", subtitle: "", description: "", imageUrl: "", link: "", category: "", active: true });
    setSelectedFile(null);
    setImagePreview("");
    setDialogOpen(true);
  };

  const openEdit = (item: EditorialItem) => {
    setEditingItem(item);
    setForm({
      title: item.title,
      subtitle: item.subtitle,
      description: item.description,
      imageUrl: item.imageUrl,
      link: item.link,
      category: item.category,
      active: item.active,
    });
    setSelectedFile(null);
    setImagePreview(item.imageUrl || "");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const title = form.title.trim();
    if (!title) {
      setTitleError("Title is required.");
      toast("error", "Please enter an editorial title.");
      return;
    }

    setTitleError("");
    setActionLoading("save");
    try {
      const payload = new FormData();
      payload.append("title", title);
      payload.append("subtitle", form.subtitle.trim());
      payload.append("description", form.description.trim());
      payload.append("link", form.link.trim());
      payload.append("category", form.category.trim());
      payload.append("isActive", String(form.active));
      payload.append("sortOrder", String(editingItem ? editingItem.order : editorials.length));
      if (selectedFile) {
        payload.append("image", await compressImage(selectedFile, {
          maxWidth: 1400,
          maxHeight: 1400,
          quality: 0.78,
        }));
      } else if (form.imageUrl && !form.imageUrl.startsWith("blob:")) {
        payload.append("imageUrl", form.imageUrl);
      }
      if (editingItem) {
        await api.upload(
          `/editorial/${editingItem.id}?title=${encodeURIComponent(title)}`,
          payload,
          "PUT"
        );
        toast("success", "Editorial updated successfully");
      } else {
        await api.upload(
          `/editorial?title=${encodeURIComponent(title)}`,
          payload,
          "POST"
        );
        toast("success", "Editorial added successfully");
      }
      const res = await api.get<any>("/editorial");
      setEditorials(res.data || []);
      setDialogOpen(false);
    } catch (error: any) {
      toast("error", error?.message || "Failed to save editorial");
    } finally {
      setActionLoading(null);
    }
  };

  const toggleActive = async (id: string) => {
    const item = editorials.find((e) => e.id === id);
    if (!item) return;
    try {
      await api.put(`/editorial/${id}`, { isActive: !item.active });
      toast("success", "Status updated successfully");
      const res = await api.get<any>("/editorial");
      setEditorials(res.data || []);
    } catch (error: any) {
      toast("error", error?.message || "Failed to toggle status");
    }
  };

  const moveItem = async (id: string, direction: "up" | "down") => {
    const idx = editorials.findIndex((e) => e.id === id);
    const newIdx = direction === "up" ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= editorials.length) return;

    const currentItem = editorials[idx];
    const swapItem = editorials[newIdx];

    try {
      await Promise.all([
        api.put(`/editorial/${currentItem.id}`, { sortOrder: swapItem.order }),
        api.put(`/editorial/${swapItem.id}`, { sortOrder: currentItem.order }),
      ]);
      toast("success", "Order updated successfully");
      const res = await api.get<any>("/editorial");
      setEditorials(res.data || []);
    } catch (error: any) {
      toast("error", error?.message || "Failed to update order");
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await api.delete(`/editorial/${id}`);
      toast("success", "Editorial deleted successfully");
      setEditorials((prev) => prev.filter((e) => e.id !== id));
    } catch (error: any) {
      toast("error", error?.message || "Failed to delete editorial");
    }
  };

  const categoryColors: Record<string, string> = {
    Culture: "bg-[#8B1A1A]/10 text-[#8B1A1A] border-[#8B1A1A]/20",
    Styling: "bg-[#C9A96E]/10 text-[#7A6543] border-[#C9A96E]/20",
    "Behind the Scenes": "bg-blue-50 text-blue-600 border-blue-200",
    Craft: "bg-emerald-50 text-emerald-600 border-emerald-200",
    Sustainability: "bg-stone-100 text-stone-600 border-stone-200",
  };

  return (
    <div className="min-h-screen bg-[#F5F0EB]">
      <div className="p-8 max-w-[1400px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-light tracking-wide text-[#1A1A1A]">Editorial</h1>
              <p className="text-[#1A1A1A]/50 mt-1 font-light">
                {editorials.length} editorial articles
              </p>
            </div>
            <Button
              onClick={openAdd}
              className="bg-[#1A1A1A] text-white hover:bg-[#1A1A1A]/80 font-light tracking-wide"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Editorial
            </Button>
          </div>

          {editorials.length === 0 ? (
            <div className="text-center py-16 col-span-full">
              <Image className="w-14 h-14 mx-auto text-[#1A1A1A]/10 mb-4" />
              <h3 className="text-lg font-light text-[#1A1A1A]/40 mb-1">No editorial articles yet</h3>
              <p className="text-sm text-[#1A1A1A]/25 font-light">Create your first editorial article to showcase your brand story.</p>
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <AnimatePresence mode="popLayout">
              {editorials.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-white border-0 shadow-sm overflow-hidden h-full">
                    <CardContent className="p-0">
                      <div className="h-48 bg-gradient-to-br from-[#1A1A1A]/5 to-[#C9A96E]/10 flex items-center justify-center relative">
                        <Image className="w-14 h-14 text-[#1A1A1A]/10" />
                        {!item.active && (
                          <div className="absolute top-3 right-3">
                            <Badge className="text-[9px] uppercase tracking-wider bg-stone-100 text-stone-400 border-0">
                              Draft
                            </Badge>
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge
                                className={cn(
                                  "text-[9px] uppercase tracking-wider font-medium border",
                                  categoryColors[item.category] || "bg-stone-100 text-stone-500 border-stone-200"
                                )}
                              >
                                {item.category}
                              </Badge>
                            </div>
                            <h3 className="font-medium text-[#1A1A1A]">{item.title}</h3>
                            <p className="text-sm text-[#1A1A1A]/50 font-light mt-0.5">{item.subtitle}</p>
                          </div>
                        </div>
                        <p className="text-xs text-[#1A1A1A]/35 font-light line-clamp-2 mb-3">
                          {item.description}
                        </p>
                        <p className="text-xs text-[#7A6543] font-light flex items-center gap-1 mb-4">
                          <LinkIcon className="w-3 h-3" />
                          {item.link}
                        </p>
                        <div className="flex items-center justify-between pt-3 border-t border-stone-50">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-[#1A1A1A]/30 hover:text-[#1A1A1A]"
                              onClick={() => moveItem(item.id, "up")}
                              disabled={index === 0}
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-[#1A1A1A]/30 hover:text-[#1A1A1A]"
                              onClick={() => moveItem(item.id, "down")}
                              disabled={index === editorials.length - 1}
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </Button>
                            <GripVertical className="w-3.5 h-3.5 text-[#1A1A1A]/15" />
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={item.active}
                              onCheckedChange={() => toggleActive(item.id)}
                            />
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(item)}>
                              <Pencil className="w-3.5 h-3.5 text-[#1A1A1A]/40" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => deleteItem(item.id)}>
                              <Trash2 className="w-3.5 h-3.5 text-[#8B1A1A]/40 hover:text-[#8B1A1A]" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          )}
        </motion.div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-white border-0 max-w-lg md:max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-light tracking-wide text-[#1A1A1A]">
              {editingItem ? "Edit" : "Add"} Editorial
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 mt-2 max-h-[72vh] overflow-y-auto pr-3">
            <div>
              <label className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 font-medium mb-2 block">Title</label>
              <Input
                value={form.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setForm({ ...form, title });
                  if (title.trim()) setTitleError("");
                }}
                placeholder="Article title..."
                required
                aria-required="true"
                aria-invalid={!!titleError}
                error={titleError}
                className="border-stone-200 bg-[#F5F0EB]/50 font-light focus:border-[#C9A96E] focus:ring-[#C9A96E]/20"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 font-medium mb-2 block">Subtitle</label>
              <Input
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                placeholder="Subtitle..."
                className="border-stone-200 bg-[#F5F0EB]/50 font-light focus:border-[#C9A96E] focus:ring-[#C9A96E]/20"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 font-medium mb-2 block">Description</label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Article description..."
                className="border-stone-200 bg-[#F5F0EB]/50 font-light min-h-[100px] focus:border-[#C9A96E] focus:ring-[#C9A96E]/20"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 font-medium mb-2 block">Image</label>
              <label className="w-full bg-[#F5F0EB] rounded-lg border border-stone-200 flex items-center justify-center overflow-hidden cursor-pointer p-0">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setSelectedFile(file);
                    if (file) {
                      const url = URL.createObjectURL(file);
                      setImagePreview(url);
                      setForm({ ...form, imageUrl: url });
                    } else {
                      setImagePreview("");
                      setForm({ ...form, imageUrl: "" });
                    }
                  }}
                />
                {imagePreview ? (
                  <img src={imagePreview} alt="Editorial" className="w-full h-48 object-cover" />
                ) : form.imageUrl ? (
                  <img src={form.imageUrl} alt="Editorial" className="w-full h-48 object-cover" />
                ) : (
                  <div className="w-full h-48 flex items-center justify-center text-[#1A1A1A]/40">Click to upload image</div>
                )}
              </label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 font-medium mb-2 block">Link URL</label>
                <Input
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  placeholder="/editorial/..."
                  className="border-stone-200 bg-[#F5F0EB]/50 font-light focus:border-[#C9A96E] focus:ring-[#C9A96E]/20"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 font-medium mb-2 block">Category</label>
                <Input
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="Culture, Styling..."
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
              <Button onClick={handleSave} className="bg-[#1A1A1A] text-white hover:bg-[#1A1A1A]/80 font-light tracking-wide" disabled={actionLoading === "save"}>
                {actionLoading === "save" ? "Saving..." : editingItem ? "Save Changes" : "Add Editorial"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
