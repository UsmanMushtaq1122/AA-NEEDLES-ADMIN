"use client";

import { useState, useEffect, useCallback } from "react";
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
  EyeOff,
  GripVertical,
  X,
  Link as LinkIcon,
  Type,
  AlignLeft,
  Palette,
  Upload,
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
  mobileImage: string;
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
  mobileImage: string;
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


export default function BannersPage() {
  const [heroBanners, setHeroBanners] = useState<any[]>([]);
  const [editorialBanners, setEditorialBanners] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchBanners = useCallback(() => {
    setLoading(true);
    api.get<any>("/banners?all=true")
      .then((res) => {
        const banners = res.data || [];
        const mapped = banners.map((b: any) => ({
          id: b.id,
          title: b.title,
          subtitle: b.subtitle || "",
          imageUrl: b.image || "",
          mobileImage: b.mobileImage || "",
          link: b.link || "",
          buttonText: b.buttonText || "",
          active: b.isActive,
          order: b.sortOrder,
          text: b.title,
          bgColor: b.bgColor || "#1A1A1A",
          textColor: b.textColor || "#F5F0EB",
          type: b.type || "hero",
        }));
        setHeroBanners(mapped.filter((b: any) => b.type === "hero"));
        setEditorialBanners(mapped.filter((b: any) => b.type === "editorial"));
        setAnnouncements(mapped.filter((b: any) => b.type === "announcement"));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);
  const [editingBanner, setEditingBanner] = useState<any>(null);
  const [dialogType, setDialogType] = useState<"hero" | "editorial" | "announcement">("hero");
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    imageUrl: "",
    mobileImageUrl: "",
    link: "",
    buttonText: "",
    active: true,
    text: "",
    bgColor: "#1A1A1A",
    textColor: "#F5F0EB",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [mobileSelectedFile, setMobileSelectedFile] = useState<File | null>(null);
  const [mobileImagePreview, setMobileImagePreview] = useState<string>("");

  const openAdd = (type: typeof dialogType) => {
    setEditingBanner(null);
    setDialogType(type);
    setForm({
      title: "",
      subtitle: "",
      imageUrl: "",
      mobileImageUrl: "",
      link: "",
      buttonText: "",
      active: true,
      text: "",
      bgColor: "#1A1A1A",
      textColor: "#F5F0EB",
    });
    setSelectedFile(null);
    setImagePreview("");
    setMobileSelectedFile(null);
    setMobileImagePreview("");
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
        mobileImageUrl: banner.mobileImage,
        link: banner.link,
        buttonText: banner.buttonText || "",
        active: banner.active,
      });
      setSelectedFile(null);
      setImagePreview(banner.imageUrl || "");
      setMobileSelectedFile(null);
      setMobileImagePreview(banner.mobileImage || "");
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setActionLoading("save");

    if (dialogType !== "announcement" && !selectedFile && !form.imageUrl) {
      toast("error", "Please upload an image");
      return;
    }

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("subtitle", form.subtitle);
    formData.append("link", form.link);
    formData.append("isActive", String(form.active));
    formData.append("type", dialogType);
    formData.append("bgColor", form.bgColor);
    formData.append("textColor", form.textColor);
    if (dialogType !== "announcement") {
      formData.append("buttonText", form.buttonText);
    }
    if (dialogType === "announcement") {
      formData.append("text", form.text);
    }
    if (selectedFile) {
      formData.append("image", selectedFile);
    } else if (form.imageUrl) {
      formData.append("imageUrl", form.imageUrl);
    }
    if (mobileSelectedFile) {
      formData.append("mobileImage", mobileSelectedFile);
    } else if (form.mobileImageUrl) {
      formData.append("mobileImageUrl", form.mobileImageUrl);
    }
    if (!editingBanner) {
      formData.append("sortOrder", String(dialogType === "hero" ? heroBanners.length : dialogType === "editorial" ? editorialBanners.length : 0));
    }

    try {
      if (editingBanner) {
        await api.upload(`/banners/${editingBanner.id}`, formData, "PUT");
        toast("success", "Banner updated successfully");
      } else {
        await api.upload("/banners", formData, "POST");
        toast("success", "Banner added successfully");
      }
      fetchBanners();
      setDialogOpen(false);
    } catch (err: any) {
      toast("error", err.message || "Failed to save banner");
    } finally {
      setActionLoading(null);
    }
  };

  const toggleActive = async (id: string, type: "hero" | "editorial" | "announcement") => {
    const list = type === "hero" ? heroBanners : type === "editorial" ? editorialBanners : announcements;
    const item = list.find((b) => b.id === id);
    if (!item) return;

    try {
      await api.put(`/banners/${id}`, { isActive: !item.active });
      toast("success", "Status updated successfully");
      fetchBanners();
    } catch (err: any) {
      toast("error", err.message || "Failed to update status");
    }
  };

  const moveItem = async (
    id: string,
    direction: "up" | "down",
    type: "hero" | "editorial"
  ) => {
    const list = type === "hero" ? heroBanners : editorialBanners;
    const idx = list.findIndex((b) => b.id === id);
    if (idx === -1) return;
    const newIdx = direction === "up" ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= list.length) return;

    const currentItem = list[idx];
    const swapItem = list[newIdx];

    try {
      await Promise.all([
        api.put(`/banners/${currentItem.id}`, { sortOrder: swapItem.order }),
        api.put(`/banners/${swapItem.id}`, { sortOrder: currentItem.order }),
      ]);
      toast("success", "Order updated successfully");
      fetchBanners();
    } catch (err: any) {
      toast("error", err.message || "Failed to update order");
    }
  };

  const deleteItem = async (id: string, type: "hero" | "editorial" | "announcement") => {
    try {
      await api.delete(`/banners/${id}`);
      toast("success", "Banner deleted successfully");
      fetchBanners();
    } catch (err: any) {
      toast("error", err.message || "Failed to delete banner");
    }
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
                        <div className="flex flex-col md:flex-row">
                          <div className="w-full md:w-64 h-48 md:h-40 bg-[#F5F0EB] flex items-center justify-center shrink-0 overflow-hidden">
                            {banner.imageUrl ? (
                              <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover max-h-[240px]" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-[#1A1A1A]/10 to-[#C9A96E]/10 flex items-center justify-center">
                                <Image className="w-10 h-10 text-[#1A1A1A]/20" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 p-5 flex flex-col justify-between">
                            <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium text-[#1A1A1A]">{banner.title}</h3>
                              {banner.mobileImage && (
                                <Badge className="text-[9px] uppercase tracking-wider bg-[#C9A96E]/15 text-[#7A6543] border-0">
                                  Mobile
                                </Badge>
                              )}
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
                          <div className="w-full md:w-80 h-56 md:h-48 bg-[#F5F0EB] flex items-center justify-center shrink-0 overflow-hidden">
                            {banner.imageUrl ? (
                              <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover max-h-[320px]" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-[#8B1A1A]/10 to-[#C9A96E]/10 flex items-center justify-center">
                                <Image className="w-12 h-12 text-[#1A1A1A]/15" />
                              </div>
                            )}
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
        <DialogContent className="bg-white border-0 max-w-lg md:max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-light tracking-wide text-[#1A1A1A]">
              {editingBanner ? "Edit" : "Add"} {dialogType === "hero" ? "Hero Banner" : dialogType === "editorial" ? "Editorial Banner" : "Announcement"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 mt-2 max-h-[70vh] md:max-h-[72vh] overflow-y-auto pr-3">
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
                    Desktop Banner Image
                  </label>
                  <p className="text-[11px] text-[#7A6543] mb-2 font-light leading-snug">
                    Recommended: 1920 × 900 px (landscape). Keep important content
                    and subjects centered with safe margins so nothing is cropped.
                  </p>
                  <label className="flex items-center justify-center gap-2 border-2 border-dashed border-stone-200 rounded-lg p-4 cursor-pointer hover:border-[#C9A96E] transition-colors bg-[#F5F0EB]/40">
                    <Upload className="w-4 h-4 text-[#1A1A1A]/40" />
                    <span className="text-sm font-light text-[#1A1A1A]/60">
                      {selectedFile ? selectedFile.name : "Click to upload desktop image"}
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp,image/avif"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setSelectedFile(file);
                        if (file) {
                          setImagePreview(URL.createObjectURL(file));
                        } else {
                          setImagePreview("");
                        }
                      }}
                    />
                  </label>
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Banner preview"
                      className="mt-3 w-full h-48 md:h-40 object-cover rounded-lg border border-stone-200"
                    />
                  )}
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 font-medium mb-2 block">
                    Mobile Banner Image <span className="normal-case tracking-normal text-[#7A6543]/60">(Optional — Recommended)</span>
                  </label>
                  <p className="text-[11px] text-[#7A6543] mb-2 font-light leading-snug">
                    Recommended: 1080 × 1350 px (portrait). Used on phones to avoid
                    cropping. If skipped, the desktop image is used on mobile too.
                  </p>
                  <label className="flex items-center justify-center gap-2 border-2 border-dashed border-stone-200 rounded-lg p-4 cursor-pointer hover:border-[#C9A96E] transition-colors bg-[#F5F0EB]/40">
                    <Upload className="w-4 h-4 text-[#1A1A1A]/40" />
                    <span className="text-sm font-light text-[#1A1A1A]/60">
                      {mobileSelectedFile ? mobileSelectedFile.name : "Click to upload mobile image"}
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp,image/avif"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setMobileSelectedFile(file);
                        if (file) {
                          setMobileImagePreview(URL.createObjectURL(file));
                        } else {
                          setMobileImagePreview("");
                        }
                      }}
                    />
                  </label>
                  {mobileImagePreview && (
                    <img
                      src={mobileImagePreview}
                      alt="Mobile banner preview"
                      className="mt-3 w-full h-48 md:h-40 object-cover rounded-lg border border-stone-200"
                    />
                  )}
                </div>
                {/* Image URL input removed per request */}
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
                disabled={actionLoading === "save"}
              >
                {actionLoading === "save" ? "Saving..." : editingBanner ? "Save Changes" : "Add Banner"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
