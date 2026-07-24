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
  EyeOff,
  GripVertical,
  X,
  Link as LinkIcon,
  Type,
  AlignLeft,
  Palette,
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface HeroBanner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  link: string;
  buttonText: string;
  active: boolean;
  order: number;
}

interface EditorialBanner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  link: string;
  active: boolean;
  order: number;
}

interface AnnouncementBar {
  id: string;
  text: string;
  link: string;
  active: boolean;
  bgColor: string;
  textColor: string;
}

const mockHeroBanners: HeroBanner[] = [
  {
    id: "hb1",
    title: "Eid Ul Adha Collection",
    subtitle: "Luxurious pieces crafted for the celebration",
    imageUrl: "/banners/eid-collection.jpg",
    link: "/collections/eid",
    buttonText: "Shop Now",
    active: true,
    order: 0,
  },
  {
    id: "hb2",
    title: "Summer Solstice",
    subtitle: "Light fabrics, bold statements for the modern woman",
    imageUrl: "/banners/summer.jpg",
    link: "/collections/summer",
    buttonText: "Explore",
    active: true,
    order: 1,
  },
  {
    id: "hb3",
    title: "Bridal Couture 2026",
    subtitle: "Where tradition meets contemporary elegance",
    imageUrl: "/banners/bridal.jpg",
    link: "/collections/bridal",
    buttonText: "View Collection",
    active: false,
    order: 2,
  },
  {
    id: "hb4",
    title: "The Monsoon Edit",
    subtitle: "Rainy day essentials in rich jewel tones",
    imageUrl: "/banners/monsoon.jpg",
    link: "/collections/monsoon",
    buttonText: "Discover",
    active: true,
    order: 3,
  },
];

const mockEditorialBanners: EditorialBanner[] = [
  {
    id: "eb1",
    title: "Behind the Seams",
    subtitle: "Meet our master artisans who bring each piece to life",
    imageUrl: "/editorial/artisans.jpg",
    link: "/editorial/artisans",
    active: true,
    order: 0,
  },
  {
    id: "eb2",
    title: "The Art of Hand Embroidery",
    subtitle: "A centuries-old craft preserved in modern luxury",
    imageUrl: "/editorial/embroidery.jpg",
    link: "/editorial/embroidery",
    active: true,
    order: 1,
  },
  {
    id: "eb3",
    title: "Sustainability Report",
    subtitle: "Our commitment to ethical fashion practices",
    imageUrl: "/editorial/sustainability.jpg",
    link: "/editorial/sustainability",
    active: false,
    order: 2,
  },
];

const mockAnnouncements: AnnouncementBar[] = [
  {
    id: "ab1",
    text: "Free delivery on orders above PKR 25,000",
    link: "/shipping-info",
    active: true,
    bgColor: "#1A1A1A",
    textColor: "#F5F0EB",
  },
  {
    id: "ab2",
    text: "Eid Sale — Up to 30% off select styles | Use code EID30",
    link: "/sale",
    active: true,
    bgColor: "#8B1A1A",
    textColor: "#F5F0EB",
  },
  {
    id: "ab3",
    text: "New arrivals just dropped — Explore the Summer 2026 collection",
    link: "/collections/summer",
    active: false,
    bgColor: "#C9A96E",
    textColor: "#1A1A1A",
  },
];

export default function BannersPage() {
  const [heroBanners, setHeroBanners] = useState(mockHeroBanners);
  const [editorialBanners, setEditorialBanners] = useState(mockEditorialBanners);
  const [announcements, setAnnouncements] = useState(mockAnnouncements);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any>(null);
  const [dialogType, setDialogType] = useState<"hero" | "editorial" | "announcement">("hero");
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    imageUrl: "",
    link: "",
    buttonText: "",
    active: true,
    text: "",
    bgColor: "#1A1A1A",
    textColor: "#F5F0EB",
  });

  const openAdd = (type: typeof dialogType) => {
    setEditingBanner(null);
    setDialogType(type);
    setForm({
      title: "",
      subtitle: "",
      imageUrl: "",
      link: "",
      buttonText: "",
      active: true,
      text: "",
      bgColor: "#1A1A1A",
      textColor: "#F5F0EB",
    });
    setDialogOpen(true);
  };

  const openEdit = (banner: any, type: typeof dialogType) => {
    setEditingBanner(banner);
    setDialogType(type);
    if (type === "announcement") {
      setForm({
        ...form,
        text: banner.text,
        link: banner.link,
        active: banner.active,
        bgColor: banner.bgColor,
        textColor: banner.textColor,
      });
    } else {
      setForm({
        ...form,
        title: banner.title,
        subtitle: banner.subtitle || "",
        imageUrl: banner.imageUrl,
        link: banner.link,
        buttonText: banner.buttonText || "",
        active: banner.active,
      });
    }
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (dialogType === "hero") {
      if (editingBanner) {
        setHeroBanners((prev) =>
          prev.map((b) =>
            b.id === editingBanner.id ? { ...b, ...form } : b
          )
        );
      } else {
        setHeroBanners((prev) => [
          ...prev,
          {
            id: `hb${Date.now()}`,
            ...form,
            order: prev.length,
          },
        ]);
      }
    } else if (dialogType === "editorial") {
      if (editingBanner) {
        setEditorialBanners((prev) =>
          prev.map((b) =>
            b.id === editingBanner.id ? { ...b, ...form } : b
          )
        );
      } else {
        setEditorialBanners((prev) => [
          ...prev,
          {
            id: `eb${Date.now()}`,
            ...form,
            order: prev.length,
          },
        ]);
      }
    } else {
      if (editingBanner) {
        setAnnouncements((prev) =>
          prev.map((b) =>
            b.id === editingBanner.id
              ? { ...b, text: form.text, link: form.link, active: form.active, bgColor: form.bgColor, textColor: form.textColor }
              : b
          )
        );
      } else {
        setAnnouncements((prev) => [
          ...prev,
          {
            id: `ab${Date.now()}`,
            text: form.text,
            link: form.link,
            active: form.active,
            bgColor: form.bgColor,
            textColor: form.textColor,
          },
        ]);
      }
    }
    setDialogOpen(false);
  };

  const toggleActive = (id: string, type: "hero" | "editorial" | "announcement") => {
    if (type === "hero") {
      setHeroBanners((prev) =>
        prev.map((b) => (b.id === id ? { ...b, active: !b.active } : b))
      );
    } else if (type === "editorial") {
      setEditorialBanners((prev) =>
        prev.map((b) => (b.id === id ? { ...b, active: !b.active } : b))
      );
    } else {
      setAnnouncements((prev) =>
        prev.map((b) => (b.id === id ? { ...b, active: !b.active } : b))
      );
    }
  };

  const moveItem = (
    id: string,
    direction: "up" | "down",
    type: "hero" | "editorial"
  ) => {
    const list = type === "hero" ? heroBanners : editorialBanners;
    const idx = list.findIndex((b) => b.id === id);
    if (idx === -1) return;
    const newIdx = direction === "up" ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= list.length) return;
    const newList = [...list];
    [newList[idx], newList[newIdx]] = [newList[newIdx], newList[idx]];
    if (type === "hero") setHeroBanners(newList as HeroBanner[]);
    else setEditorialBanners(newList as EditorialBanner[]);
  };

  const deleteItem = (id: string, type: "hero" | "editorial" | "announcement") => {
    if (type === "hero") setHeroBanners((prev) => prev.filter((b) => b.id !== id));
    else if (type === "editorial") setEditorialBanners((prev) => prev.filter((b) => b.id !== id));
    else setAnnouncements((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#F5F0EB]">
      <div className="p-8 max-w-[1400px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-light tracking-wide text-[#1A1A1A]">Banners</h1>
              <p className="text-[#1A1A1A]/50 mt-1 font-light">Manage homepage banners and announcements</p>
            </div>
          </div>

          <Tabs defaultValue="hero" className="space-y-6">
            <TabsList className="bg-white border border-stone-100 p-1">
              <TabsTrigger value="hero" className="font-light text-sm tracking-wide data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-white">
                Hero Banners
              </TabsTrigger>
              <TabsTrigger value="editorial" className="font-light text-sm tracking-wide data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-white">
                Editorial Banners
              </TabsTrigger>
              <TabsTrigger value="announcement" className="font-light text-sm tracking-wide data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-white">
                Announcement Bar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="hero" className="space-y-4">
              <div className="flex justify-end">
                <Button
                  onClick={() => openAdd("hero")}
                  className="bg-[#1A1A1A] text-white hover:bg-[#1A1A1A]/80 font-light tracking-wide"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Hero Banner
                </Button>
              </div>
              <AnimatePresence mode="popLayout">
                {heroBanners.map((banner, index) => (
                  <motion.div
                    key={banner.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="bg-white border-0 shadow-sm overflow-hidden">
                      <CardContent className="p-0">
                        <div className="flex">
                          <div className="w-64 h-40 bg-[#F5F0EB] flex items-center justify-center shrink-0 overflow-hidden">
                            <div className="w-full h-full bg-gradient-to-br from-[#1A1A1A]/10 to-[#C9A96E]/10 flex items-center justify-center">
                              <Image className="w-10 h-10 text-[#1A1A1A]/20" />
                            </div>
                          </div>
                          <div className="flex-1 p-5 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium text-[#1A1A1A]">{banner.title}</h3>
                                {!banner.active && (
                                  <Badge className="text-[9px] uppercase tracking-wider bg-stone-100 text-stone-400 border-0">
                                    Draft
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-[#1A1A1A]/50 font-light">{banner.subtitle}</p>
                              <p className="text-xs text-[#7A6543] mt-1 font-light flex items-center gap-1">
                                <LinkIcon className="w-3 h-3" />
                                {banner.link}
                              </p>
                            </div>
                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-[#1A1A1A]/30 hover:text-[#1A1A1A]"
                                  onClick={() => moveItem(banner.id, "up", "hero")}
                                  disabled={index === 0}
                                >
                                  <ChevronUp className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-[#1A1A1A]/30 hover:text-[#1A1A1A]"
                                  onClick={() => moveItem(banner.id, "down", "hero")}
                                  disabled={index === heroBanners.length - 1}
                                >
                                  <ChevronDown className="w-4 h-4" />
                                </Button>
                                <GripVertical className="w-4 h-4 text-[#1A1A1A]/15" />
                              </div>
                              <div className="flex items-center gap-3">
                                <Switch
                                  checked={banner.active}
                                  onCheckedChange={() => toggleActive(banner.id, "hero")}
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => openEdit(banner, "hero")}
                                >
                                  <Pencil className="w-4 h-4 text-[#1A1A1A]/40" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => deleteItem(banner.id, "hero")}
                                >
                                  <Trash2 className="w-4 h-4 text-[#8B1A1A]/40 hover:text-[#8B1A1A]" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </TabsContent>

            <TabsContent value="editorial" className="space-y-4">
              <div className="flex justify-end">
                <Button
                  onClick={() => openAdd("editorial")}
                  className="bg-[#1A1A1A] text-white hover:bg-[#1A1A1A]/80 font-light tracking-wide"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Editorial Banner
                </Button>
              </div>
              <AnimatePresence mode="popLayout">
                {editorialBanners.map((banner, index) => (
                  <motion.div
                    key={banner.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="bg-white border-0 shadow-sm overflow-hidden">
                      <CardContent className="p-0">
                        <div className="flex">
                          <div className="w-80 h-48 bg-[#F5F0EB] flex items-center justify-center shrink-0 overflow-hidden">
                            <div className="w-full h-full bg-gradient-to-br from-[#8B1A1A]/10 to-[#C9A96E]/10 flex items-center justify-center">
                              <Image className="w-12 h-12 text-[#1A1A1A]/15" />
                            </div>
                          </div>
                          <div className="flex-1 p-6 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium text-[#1A1A1A]">{banner.title}</h3>
                                {!banner.active && (
                                  <Badge className="text-[9px] uppercase tracking-wider bg-stone-100 text-stone-400 border-0">
                                    Draft
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-[#1A1A1A]/50 font-light">{banner.subtitle}</p>
                              <p className="text-xs text-[#7A6543] mt-2 font-light flex items-center gap-1">
                                <LinkIcon className="w-3 h-3" />
                                {banner.link}
                              </p>
                            </div>
                            <div className="flex items-center justify-between mt-4">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-[#1A1A1A]/30 hover:text-[#1A1A1A]"
                                  onClick={() => moveItem(banner.id, "up", "editorial")}
                                  disabled={index === 0}
                                >
                                  <ChevronUp className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-[#1A1A1A]/30 hover:text-[#1A1A1A]"
                                  onClick={() => moveItem(banner.id, "down", "editorial")}
                                  disabled={index === editorialBanners.length - 1}
                                >
                                  <ChevronDown className="w-4 h-4" />
                                </Button>
                                <GripVertical className="w-4 h-4 text-[#1A1A1A]/15" />
                              </div>
                              <div className="flex items-center gap-3">
                                <Switch
                                  checked={banner.active}
                                  onCheckedChange={() => toggleActive(banner.id, "editorial")}
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => openEdit(banner, "editorial")}
                                >
                                  <Pencil className="w-4 h-4 text-[#1A1A1A]/40" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => deleteItem(banner.id, "editorial")}
                                >
                                  <Trash2 className="w-4 h-4 text-[#8B1A1A]/40 hover:text-[#8B1A1A]" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </TabsContent>

            <TabsContent value="announcement" className="space-y-4">
              <div className="flex justify-end">
                <Button
                  onClick={() => openAdd("announcement")}
                  className="bg-[#1A1A1A] text-white hover:bg-[#1A1A1A]/80 font-light tracking-wide"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Announcement
                </Button>
              </div>
              <div className="space-y-3">
                {announcements.map((ann) => (
                  <Card key={ann.id} className="bg-white border-0 shadow-sm">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div
                            className="w-48 h-10 rounded flex items-center justify-center text-xs font-light tracking-wide px-3"
                            style={{ backgroundColor: ann.bgColor, color: ann.textColor }}
                          >
                            {ann.text}
                          </div>
                          <div>
                            <p className="text-xs text-[#7A6543] font-light flex items-center gap-1">
                              <LinkIcon className="w-3 h-3" />
                              {ann.link}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={ann.active}
                            onCheckedChange={() => toggleActive(ann.id, "announcement")}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => openEdit(ann, "announcement")}
                          >
                            <Pencil className="w-4 h-4 text-[#1A1A1A]/40" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => deleteItem(ann.id, "announcement")}
                          >
                            <Trash2 className="w-4 h-4 text-[#8B1A1A]/40 hover:text-[#8B1A1A]" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-white border-0 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-light tracking-wide text-[#1A1A1A]">
              {editingBanner ? "Edit" : "Add"} {dialogType === "hero" ? "Hero Banner" : dialogType === "editorial" ? "Editorial Banner" : "Announcement"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 mt-2">
            {dialogType === "announcement" ? (
              <>
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 font-medium mb-2 block">
                    Announcement Text
                  </label>
                  <Input
                    value={form.text}
                    onChange={(e) => setForm({ ...form, text: e.target.value })}
                    placeholder="Enter announcement text..."
                    className="border-stone-200 bg-[#F5F0EB]/50 font-light focus:border-[#C9A96E] focus:ring-[#C9A96E]/20"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 font-medium mb-2 block">
                    Link URL
                  </label>
                  <Input
                    value={form.link}
                    onChange={(e) => setForm({ ...form, link: e.target.value })}
                    placeholder="/collections/sale"
                    className="border-stone-200 bg-[#F5F0EB]/50 font-light focus:border-[#C9A96E] focus:ring-[#C9A96E]/20"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 font-medium mb-2 block">
                      Background Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={form.bgColor}
                        onChange={(e) => setForm({ ...form, bgColor: e.target.value })}
                        className="w-10 h-10 rounded border-0 cursor-pointer"
                      />
                      <Input
                        value={form.bgColor}
                        onChange={(e) => setForm({ ...form, bgColor: e.target.value })}
                        className="border-stone-200 bg-[#F5F0EB]/50 font-light text-sm font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 font-medium mb-2 block">
                      Text Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={form.textColor}
                        onChange={(e) => setForm({ ...form, textColor: e.target.value })}
                        className="w-10 h-10 rounded border-0 cursor-pointer"
                      />
                      <Input
                        value={form.textColor}
                        onChange={(e) => setForm({ ...form, textColor: e.target.value })}
                        className="border-stone-200 bg-[#F5F0EB]/50 font-light text-sm font-mono"
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-[#F5F0EB] rounded-lg p-4">
                  <p className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 font-medium mb-2">
                    Preview
                  </p>
                  <div
                    className="rounded px-4 py-2 text-sm font-light"
                    style={{ backgroundColor: form.bgColor, color: form.textColor }}
                  >
                    {form.text || "Announcement preview..."}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 font-medium mb-2 block">
                    Title
                  </label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Banner title..."
                    className="border-stone-200 bg-[#F5F0EB]/50 font-light focus:border-[#C9A96E] focus:ring-[#C9A96E]/20"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 font-medium mb-2 block">
                    Subtitle
                  </label>
                  <Input
                    value={form.subtitle}
                    onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                    placeholder="Subtitle text..."
                    className="border-stone-200 bg-[#F5F0EB]/50 font-light focus:border-[#C9A96E] focus:ring-[#C9A96E]/20"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 font-medium mb-2 block">
                    Image URL
                  </label>
                  <Input
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    placeholder="/banners/image.jpg or https://..."
                    className="border-stone-200 bg-[#F5F0EB]/50 font-light focus:border-[#C9A96E] focus:ring-[#C9A96E]/20"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 font-medium mb-2 block">
                    Link URL
                  </label>
                  <Input
                    value={form.link}
                    onChange={(e) => setForm({ ...form, link: e.target.value })}
                    placeholder="/collections/..."
                    className="border-stone-200 bg-[#F5F0EB]/50 font-light focus:border-[#C9A96E] focus:ring-[#C9A96E]/20"
                  />
                </div>
                {dialogType === "hero" && (
                  <div>
                    <label className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 font-medium mb-2 block">
                      Button Text
                    </label>
                    <Input
                      value={form.buttonText}
                      onChange={(e) => setForm({ ...form, buttonText: e.target.value })}
                      placeholder="Shop Now"
                      className="border-stone-200 bg-[#F5F0EB]/50 font-light focus:border-[#C9A96E] focus:ring-[#C9A96E]/20"
                    />
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <label className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 font-medium">
                    Active
                  </label>
                  <Switch
                    checked={form.active}
                    onCheckedChange={(checked) => setForm({ ...form, active: checked })}
                  />
                </div>
              </>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="border-stone-200 text-[#1A1A1A]/60 font-light"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="bg-[#1A1A1A] text-white hover:bg-[#1A1A1A]/80 font-light tracking-wide"
              >
                {editingBanner ? "Save Changes" : "Add Banner"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
