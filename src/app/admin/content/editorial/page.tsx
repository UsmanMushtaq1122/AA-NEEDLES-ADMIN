"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

const mockEditorials: EditorialItem[] = [
  {
    id: "e1",
    title: "The Heritage of Khaddar",
    subtitle: "Exploring Pakistan's handwoven textile legacy",
    description: "From the looms of Punjab to the runways of Paris, khaddar has evolved while maintaining its soul. This editorial explores the journey of this timeless fabric through generations of Pakistani artisans.",
    imageUrl: "/editorial/khaddar.jpg",
    link: "/editorial/khaddar-heritage",
    category: "Culture",
    active: true,
    order: 0,
    date: "2026-07-10",
  },
  {
    id: "e2",
    title: "Summer Styling Guide 2026",
    subtitle: "How to wear luxury linen this season",
    description: "Our creative director shares five essential looks for the modern Pakistani woman. From boardroom to brunch, discover how to layer, accessorize, and own the summer with effortless elegance.",
    imageUrl: "/editorial/summer-guide.jpg",
    link: "/editorial/summer-styling",
    category: "Styling",
    active: true,
    order: 1,
    date: "2026-07-05",
  },
  {
    id: "e3",
    title: "Behind the Atelier",
    subtitle: "A day in our Lahore design studio",
    description: "Step inside the creative heart of AA Neddles. From initial sketches to the final stitch, follow our design team through a day of inspiration, experimentation, and exquisite craftsmanship.",
    imageUrl: "/editorial/atelier.jpg",
    link: "/editorial/atelier-day",
    category: "Behind the Scenes",
    active: true,
    order: 2,
    date: "2026-06-28",
  },
  {
    id: "e4",
    title: "The Art of Mukaish",
    subtitle: "Reviving Lucknow's metallic embroidery for modern silhouettes",
    description: "Our collaboration with traditional mukaish artisans has resulted in a collection that bridges centuries of craft with contemporary design sensibilities.",
    imageUrl: "/editorial/mukaish.jpg",
    link: "/editorial/mukaish-art",
    category: "Craft",
    active: false,
    order: 3,
    date: "2026-06-15",
  },
  {
    id: "e5",
    title: "Sustainable Luxury",
    subtitle: "Our commitment to ethical fashion",
    description: "Luxury and sustainability are not mutually exclusive. Learn about our initiatives — from organic dyes to fair wages — that define our approach to responsible fashion.",
    imageUrl: "/editorial/sustainable.jpg",
    link: "/editorial/sustainability",
    category: "Sustainability",
    active: true,
    order: 4,
    date: "2026-06-01",
  },
];

export default function EditorialPage() {
  const [editorials, setEditorials] = useState(mockEditorials);
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

  const openAdd = () => {
    setEditingItem(null);
    setForm({ title: "", subtitle: "", description: "", imageUrl: "", link: "", category: "", active: true });
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
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (editingItem) {
      setEditorials((prev) =>
        prev.map((e) => (e.id === editingItem.id ? { ...e, ...form } : e))
      );
    } else {
      setEditorials((prev) => [
        ...prev,
        {
          id: `e${Date.now()}`,
          ...form,
          order: prev.length,
          date: new Date().toISOString().split("T")[0],
        },
      ]);
    }
    setDialogOpen(false);
  };

  const toggleActive = (id: string) => {
    setEditorials((prev) =>
      prev.map((e) => (e.id === id ? { ...e, active: !e.active } : e))
    );
  };

  const moveItem = (id: string, direction: "up" | "down") => {
    const idx = editorials.findIndex((e) => e.id === id);
    const newIdx = direction === "up" ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= editorials.length) return;
    const newList = [...editorials];
    [newList[idx], newList[newIdx]] = [newList[newIdx], newList[idx]];
    setEditorials(newList);
  };

  const deleteItem = (id: string) => {
    setEditorials((prev) => prev.filter((e) => e.id !== id));
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
        </motion.div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-white border-0 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-light tracking-wide text-[#1A1A1A]">
              {editingItem ? "Edit" : "Add"} Editorial
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 mt-2">
            <div>
              <label className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 font-medium mb-2 block">Title</label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Article title..."
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
              <label className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 font-medium mb-2 block">Image URL</label>
              <Input
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="/editorial/image.jpg"
                className="border-stone-200 bg-[#F5F0EB]/50 font-light focus:border-[#C9A96E] focus:ring-[#C9A96E]/20"
              />
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
              <Button onClick={handleSave} className="bg-[#1A1A1A] text-white hover:bg-[#1A1A1A]/80 font-light tracking-wide">
                {editingItem ? "Save Changes" : "Add Editorial"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
