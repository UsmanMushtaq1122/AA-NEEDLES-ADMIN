"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────

interface MenuItem {
  id: string;
  title: string;
  type: string;
  url?: string;
  icon?: string;
  categoryId?: string;
  sortOrder: number;
  isActive: boolean;
  isHighlighted: boolean;
  textColor?: string;
  bgColor?: string;
  fontWeight?: string;
  parentId?: string;
  children?: MenuItem[];
}

interface MenuItemFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  editItem: MenuItem | null;
  defaultParentId?: string;
  menuItems: MenuItem[];
  saving: boolean;
}

const ITEM_TYPES = [
  { value: "CATEGORY", label: "Category", desc: "Links to a product category page" },
  { value: "COLLECTION", label: "Collection", desc: "Links to a curated collection" },
  { value: "CUSTOM_URL", label: "Custom URL", desc: "Any internal URL e.g. /sale" },
  { value: "EXTERNAL_LINK", label: "External Link", desc: "Opens in new tab" },
  { value: "PROMOTIONAL", label: "Promotional", desc: "Highlighted sale/promo link" },
];

const FONT_WEIGHTS = [
  { value: "normal", label: "Normal" },
  { value: "semibold", label: "Semi Bold" },
  { value: "bold", label: "Bold" },
];

// Flatten tree for parent selector dropdown
function flattenItems(items: MenuItem[], depth = 0, exclude?: string): { id: string; title: string; depth: number }[] {
  const result: { id: string; title: string; depth: number }[] = [];
  for (const item of items) {
    if (item.id === exclude) continue;
    result.push({ id: item.id, title: item.title, depth });
    if (item.children && item.children.length > 0) {
      result.push(...flattenItems(item.children, depth + 1, exclude));
    }
  }
  return result;
}

// ─── Form Component ───────────────────────────────────────────────────────

export default function MenuItemForm({
  open,
  onClose,
  onSave,
  editItem,
  defaultParentId,
  menuItems,
  saving,
}: MenuItemFormProps) {
  const [form, setForm] = useState({
    title: "",
    type: "CUSTOM_URL",
    url: "",
    icon: "",
    categoryId: "",
    sortOrder: 0,
    isActive: true,
    isHighlighted: false,
    textColor: "#FFFFFF",
    bgColor: "#8B1A1A",
    fontWeight: "bold",
    parentId: "",
  });

  useEffect(() => {
    if (open) {
      if (editItem) {
        setForm({
          title: editItem.title || "",
          type: editItem.type || "CUSTOM_URL",
          url: editItem.url || "",
          icon: editItem.icon || "",
          categoryId: editItem.categoryId || "",
          sortOrder: editItem.sortOrder ?? 0,
          isActive: editItem.isActive ?? true,
          isHighlighted: editItem.isHighlighted ?? false,
          textColor: editItem.textColor || "#FFFFFF",
          bgColor: editItem.bgColor || "#8B1A1A",
          fontWeight: editItem.fontWeight || "bold",
          parentId: editItem.parentId || "",
        });
      } else {
        setForm({
          title: "",
          type: "CUSTOM_URL",
          url: "",
          icon: "",
          categoryId: "",
          sortOrder: 0,
          isActive: true,
          isHighlighted: false,
          textColor: "#FFFFFF",
          bgColor: "#8B1A1A",
          fontWeight: "bold",
          parentId: defaultParentId || "",
        });
      }
    }
  }, [open, editItem, defaultParentId]);

  const set = (key: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Record<string, unknown> = {
      title: form.title,
      type: form.type,
      url: form.url || null,
      icon: form.icon || null,
      categoryId: form.categoryId || null,
      sortOrder: Number(form.sortOrder),
      isActive: form.isActive,
      isHighlighted: form.isHighlighted,
      parentId: form.parentId || null,
    };
    if (form.isHighlighted) {
      payload.textColor = form.textColor;
      payload.bgColor = form.bgColor;
      payload.fontWeight = form.fontWeight;
    } else {
      payload.textColor = null;
      payload.bgColor = null;
      payload.fontWeight = null;
    }
    await onSave(payload);
  };

  const parentOptions = flattenItems(menuItems, 0, editItem?.id);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="form-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Slide-over panel */}
          <motion.div
            key="form-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3, ease: [0.32, 0, 0.08, 1] }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
              <h2 className="text-base font-medium text-[#1A1A1A]">
                {editItem ? "Edit Menu Item" : "Add Menu Item"}
              </h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-md text-[#1A1A1A]/40 hover:bg-[#F5F0EB] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

              {/* Title */}
              <div>
                <label className="block text-xs font-medium text-[#1A1A1A]/60 mb-1.5 uppercase tracking-wider">
                  Menu Title *
                </label>
                <input
                  required
                  type="text"
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="e.g. Women, AZADI SALE"
                  className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A96E]/40 focus:border-[#C9A96E] transition-colors"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-xs font-medium text-[#1A1A1A]/60 mb-1.5 uppercase tracking-wider">
                  Type *
                </label>
                <div className="grid grid-cols-1 gap-1.5">
                  {ITEM_TYPES.map((t) => (
                    <label
                      key={t.value}
                      className={cn(
                        "flex items-start gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-all",
                        form.type === t.value
                          ? "border-[#C9A96E] bg-[#C9A96E]/5"
                          : "border-zinc-200 hover:border-zinc-300"
                      )}
                    >
                      <input
                        type="radio"
                        name="type"
                        value={t.value}
                        checked={form.type === t.value}
                        onChange={() => set("type", t.value)}
                        className="mt-0.5 accent-[#C9A96E]"
                      />
                      <div>
                        <p className="text-sm font-medium text-[#1A1A1A]">{t.label}</p>
                        <p className="text-xs text-[#1A1A1A]/40">{t.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* URL field */}
              {(form.type === "CUSTOM_URL" ||
                form.type === "EXTERNAL_LINK" ||
                form.type === "CATEGORY" ||
                form.type === "COLLECTION" ||
                form.type === "PROMOTIONAL") && (
                <div>
                  <label className="block text-xs font-medium text-[#1A1A1A]/60 mb-1.5 uppercase tracking-wider">
                    URL
                  </label>
                  <input
                    type="text"
                    value={form.url}
                    onChange={(e) => set("url", e.target.value)}
                    placeholder={
                      form.type === "EXTERNAL_LINK"
                        ? "https://example.com"
                        : "/category/women"
                    }
                    className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A96E]/40 focus:border-[#C9A96E] transition-colors"
                  />
                  {form.type === "EXTERNAL_LINK" && (
                    <p className="text-xs text-[#1A1A1A]/40 mt-1">Opens in a new tab automatically</p>
                  )}
                </div>
              )}

              {/* Icon */}
              <div>
                <label className="block text-xs font-medium text-[#1A1A1A]/60 mb-1.5 uppercase tracking-wider">
                  Icon (optional)
                </label>
                <input
                  type="text"
                  value={form.icon}
                  onChange={(e) => set("icon", e.target.value)}
                  placeholder="e.g. ✨ or icon name"
                  className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A96E]/40 focus:border-[#C9A96E] transition-colors"
                />
              </div>

              {/* Parent */}
              <div>
                <label className="block text-xs font-medium text-[#1A1A1A]/60 mb-1.5 uppercase tracking-wider">
                  Parent Item (for nesting)
                </label>
                <select
                  value={form.parentId}
                  onChange={(e) => set("parentId", e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A96E]/40 focus:border-[#C9A96E] transition-colors bg-white"
                >
                  <option value="">— No parent (top-level tab) —</option>
                  {parentOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {"  ".repeat(opt.depth)}{opt.depth > 0 ? "↳ " : ""}{opt.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-xs font-medium text-[#1A1A1A]/60 mb-1.5 uppercase tracking-wider">
                  Display Order
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.sortOrder}
                  onChange={(e) => set("sortOrder", parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A96E]/40 focus:border-[#C9A96E] transition-colors"
                />
              </div>

              {/* Toggles */}
              <div className="space-y-3">
                <label className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-zinc-200 cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-[#1A1A1A]">Active</p>
                    <p className="text-xs text-[#1A1A1A]/40">Visible in the menu</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => set("isActive", !form.isActive)}
                    className={cn(
                      "w-10 h-5 rounded-full transition-colors relative",
                      form.isActive ? "bg-[#1A1A1A]" : "bg-zinc-200"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform",
                        form.isActive ? "translate-x-5" : "translate-x-0.5"
                      )}
                    />
                  </button>
                </label>

                <label className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-zinc-200 cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-[#1A1A1A]">Promotional / Highlighted</p>
                    <p className="text-xs text-[#1A1A1A]/40">Show with custom colors</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => set("isHighlighted", !form.isHighlighted)}
                    className={cn(
                      "w-10 h-5 rounded-full transition-colors relative",
                      form.isHighlighted ? "bg-[#8B1A1A]" : "bg-zinc-200"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform",
                        form.isHighlighted ? "translate-x-5" : "translate-x-0.5"
                      )}
                    />
                  </button>
                </label>
              </div>

              {/* Promotional styling */}
              <AnimatePresence initial={false}>
                {form.isHighlighted && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ overflow: "hidden" }}
                  >
                    <div className="space-y-3 p-4 rounded-xl bg-[#F5F0EB]">
                      <p className="text-xs font-medium text-[#7A6543] uppercase tracking-wider mb-2">
                        Promotional Styling
                      </p>

                      {/* Preview */}
                      <div className="flex items-center justify-center py-2">
                        <span
                          className="px-4 py-2 rounded-md text-sm"
                          style={{
                            backgroundColor: form.bgColor,
                            color: form.textColor,
                            fontWeight: form.fontWeight,
                          }}
                        >
                          {form.title || "Preview"}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-[#1A1A1A]/50 mb-1">Text Color</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={form.textColor}
                              onChange={(e) => set("textColor", e.target.value)}
                              className="w-8 h-8 rounded cursor-pointer border border-zinc-200"
                            />
                            <input
                              type="text"
                              value={form.textColor}
                              onChange={(e) => set("textColor", e.target.value)}
                              className="flex-1 px-2 py-1.5 text-xs border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C9A96E]/40"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-[#1A1A1A]/50 mb-1">Background Color</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={form.bgColor}
                              onChange={(e) => set("bgColor", e.target.value)}
                              className="w-8 h-8 rounded cursor-pointer border border-zinc-200"
                            />
                            <input
                              type="text"
                              value={form.bgColor}
                              onChange={(e) => set("bgColor", e.target.value)}
                              className="flex-1 px-2 py-1.5 text-xs border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C9A96E]/40"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-[#1A1A1A]/50 mb-1">Font Weight</label>
                        <div className="flex gap-2">
                          {FONT_WEIGHTS.map((fw) => (
                            <button
                              key={fw.value}
                              type="button"
                              onClick={() => set("fontWeight", fw.value)}
                              className={cn(
                                "flex-1 py-1.5 text-xs rounded-lg border transition-all",
                                form.fontWeight === fw.value
                                  ? "border-[#C9A96E] bg-[#C9A96E]/10 text-[#7A6543]"
                                  : "border-zinc-200 text-[#1A1A1A]/60 hover:border-zinc-300"
                              )}
                              style={{ fontWeight: fw.value === "normal" ? 400 : fw.value === "semibold" ? 600 : 700 }}
                            >
                              {fw.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-zinc-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-[#1A1A1A]/60 hover:text-[#1A1A1A] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#1A1A1A] rounded-lg hover:bg-[#1A1A1A]/80 transition-colors disabled:opacity-50"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {editItem ? "Save Changes" : "Add Item"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
