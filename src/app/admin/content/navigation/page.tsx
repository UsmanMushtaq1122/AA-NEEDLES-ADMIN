"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  Plus,
  ChevronRight,
  LayoutDashboard,
  GripVertical,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Tag,
  Link,
  ExternalLink,
  Zap,
  Layers,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import MenuItemForm from "./components/MenuItemForm";

// ─── Types ────────────────────────────────────────────────────────────────

interface MenuItem {
  id: string;
  title: string;
  type: "CATEGORY" | "COLLECTION" | "CUSTOM_URL" | "EXTERNAL_LINK" | "PROMOTIONAL";
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
  children: MenuItem[];
}

interface NavigationMenu {
  id: string;
  name: string;
  label?: string;
  isActive: boolean;
  items: MenuItem[];
  _count?: { items: number };
}

// ─── Helpers ─────────────────────────────────────────────────────────────

const TYPE_CONFIG = {
  CATEGORY: { label: "Category", icon: Tag, color: "bg-blue-100 text-blue-700" },
  COLLECTION: { label: "Collection", icon: Layers, color: "bg-purple-100 text-purple-700" },
  CUSTOM_URL: { label: "Custom URL", icon: Link, color: "bg-zinc-100 text-zinc-600" },
  EXTERNAL_LINK: { label: "External Link", icon: ExternalLink, color: "bg-amber-100 text-amber-700" },
  PROMOTIONAL: { label: "Promotional", icon: Zap, color: "bg-rose-100 text-rose-700" },
};

// ─── MenuItem Tree Row ────────────────────────────────────────────────────

function MenuItemRow({
  item,
  depth = 0,
  onEdit,
  onDelete,
  onToggleActive,
  onAddChild,
}: {
  item: MenuItem;
  depth?: number;
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
  onToggleActive: (item: MenuItem) => void;
  onAddChild: (parentId: string) => void;
}) {
  const [expanded, setExpanded] = useState(depth < 1);
  const typeConf = TYPE_CONFIG[item.type];
  const TypeIcon = typeConf.icon;
  const hasChildren = item.children && item.children.length > 0;

  return (
    <div className={cn("select-none", depth > 0 && "ml-6 border-l border-[#1A1A1A]/10 pl-4")}>
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg px-3 py-2.5 group transition-all",
          item.isActive ? "hover:bg-[#F5F0EB]" : "opacity-50 hover:bg-[#F5F0EB]"
        )}
      >
        {/* Drag Handle */}
        <GripVertical size={14} className="text-[#1A1A1A]/20 cursor-grab shrink-0" />

        {/* Expand toggle */}
        {hasChildren ? (
          <button
            onClick={() => setExpanded((p) => !p)}
            className="text-[#1A1A1A]/40 hover:text-[#1A1A1A] transition-colors shrink-0"
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : (
          <span className="w-[14px] shrink-0" />
        )}

        {/* Promotional color swatch */}
        {item.isHighlighted && item.bgColor && (
          <span
            className="w-3 h-3 rounded-full shrink-0 ring-1 ring-white shadow"
            style={{ background: item.bgColor }}
          />
        )}

        {/* Title */}
        <span
          className={cn(
            "flex-1 text-sm font-medium truncate",
            item.isHighlighted ? "font-semibold" : ""
          )}
          style={item.isHighlighted ? { color: item.textColor || "#1A1A1A" } : undefined}
        >
          {item.title}
        </span>

        {/* Type badge */}
        <span
          className={cn(
            "hidden sm:inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0",
            typeConf.color
          )}
        >
          <TypeIcon size={10} />
          {typeConf.label}
        </span>

        {/* URL hint */}
        {item.url && (
          <span className="hidden lg:block text-[11px] text-[#1A1A1A]/30 truncate max-w-[160px]">
            {item.url}
          </span>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={() => onAddChild(item.id)}
            className="p-1.5 rounded-md text-[#1A1A1A]/40 hover:bg-[#C9A96E]/10 hover:text-[#7A6543] transition-colors"
            title="Add child item"
          >
            <Plus size={13} />
          </button>
          <button
            onClick={() => onEdit(item)}
            className="p-1.5 rounded-md text-[#1A1A1A]/40 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            title="Edit"
          >
            <Edit2 size={13} />
          </button>
          <button
            onClick={() => onToggleActive(item)}
            className="p-1.5 rounded-md text-[#1A1A1A]/40 hover:bg-[#F5F0EB] hover:text-[#1A1A1A] transition-colors"
            title={item.isActive ? "Deactivate" : "Activate"}
          >
            {item.isActive ? <Eye size={13} /> : <EyeOff size={13} />}
          </button>
          <button
            onClick={() => onDelete(item)}
            className="p-1.5 rounded-md text-[#1A1A1A]/40 hover:bg-rose-50 hover:text-rose-600 transition-colors"
            title="Delete"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Children */}
      <AnimatePresence initial={false}>
        {expanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            {item.children.map((child) => (
              <MenuItemRow
                key={child.id}
                item={child}
                depth={depth + 1}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleActive={onToggleActive}
                onAddChild={onAddChild}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────

export default function NavigationMenuPage() {
  const [menus, setMenus] = useState<NavigationMenu[]>([]);
  const [activeMenu, setActiveMenu] = useState<NavigationMenu | null>(null);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [defaultParentId, setDefaultParentId] = useState<string | undefined>(undefined);
  const [deleteConfirm, setDeleteConfirm] = useState<MenuItem | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadMenus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{ success: boolean; data: NavigationMenu[] }>("/menus");
      setMenus(res.data);
      if (res.data.length > 0) {
        // Load the first menu's full tree
        const detail = await api.get<{ success: boolean; data: NavigationMenu }>(
          `/menus/${res.data[0].id}`
        );
        setActiveMenu(detail.data);
      }
    } catch {
      showToast("Failed to load menus", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMenus();
  }, [loadMenus]);

  const loadActiveMenu = async (menuId: string) => {
    try {
      const res = await api.get<{ success: boolean; data: NavigationMenu }>(`/menus/${menuId}`);
      setActiveMenu(res.data);
    } catch {
      showToast("Failed to refresh menu", "error");
    }
  };

  const handleSeedDefault = async () => {
    setSeeding(true);
    try {
      const res = await api.post<{ success: boolean; data: { skipped?: boolean; message: string } }>(
        "/menus/seed"
      );
      showToast(res.data.message);
      await loadMenus();
    } catch {
      showToast("Seed failed", "error");
    } finally {
      setSeeding(false);
    }
  };

  const handleToggleActive = async (item: MenuItem) => {
    if (!activeMenu) return;
    try {
      await api.put(`/menus/${activeMenu.id}/items/${item.id}`, {
        isActive: !item.isActive,
      });
      await loadActiveMenu(activeMenu.id);
    } catch {
      showToast("Failed to update item", "error");
    }
  };

  const handleDeleteItem = async () => {
    if (!deleteConfirm || !activeMenu) return;
    setSaving(true);
    try {
      await api.delete(`/menus/${activeMenu.id}/items/${deleteConfirm.id}`);
      showToast("Item deleted");
      setDeleteConfirm(null);
      await loadActiveMenu(activeMenu.id);
    } catch {
      showToast("Delete failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleFormSave = async (data: Record<string, unknown>) => {
    if (!activeMenu) return;
    setSaving(true);
    try {
      if (editItem) {
        await api.put(`/menus/${activeMenu.id}/items/${editItem.id}`, data);
        showToast("Item updated");
      } else {
        await api.post(`/menus/${activeMenu.id}/items`, {
          ...data,
          parentId: defaultParentId || null,
        });
        showToast("Item created");
      }
      setFormOpen(false);
      setEditItem(null);
      setDefaultParentId(undefined);
      await loadActiveMenu(activeMenu.id);
    } catch {
      showToast("Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const openAddRoot = () => {
    setEditItem(null);
    setDefaultParentId(undefined);
    setFormOpen(true);
  };

  const openAddChild = (parentId: string) => {
    setEditItem(null);
    setDefaultParentId(parentId);
    setFormOpen(true);
  };

  const openEdit = (item: MenuItem) => {
    setEditItem(item);
    setDefaultParentId(undefined);
    setFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F5F0EB]">
      <div className="p-6 max-w-[1200px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 text-xs text-[#1A1A1A]/30 font-light mb-3">
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Admin</span>
            <ChevronRight className="w-3 h-3" />
            <span>Content</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#1A1A1A]/60">Navigation Menu</span>
          </div>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-light tracking-wide text-[#1A1A1A]">Navigation Menu</h1>
              <p className="text-[#1A1A1A]/50 mt-1 font-light">
                Manage the hamburger menu structure, nested categories, and promotional links
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleSeedDefault}
                disabled={seeding}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#7A6543] border border-[#C9A96E]/40 rounded-lg hover:bg-[#C9A96E]/10 transition-colors disabled:opacity-50"
              >
                {seeding ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <RefreshCw size={14} />
                )}
                Seed from Categories
              </button>
              <button
                onClick={openAddRoot}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#1A1A1A] rounded-lg hover:bg-[#1A1A1A]/80 transition-colors"
              >
                <Plus size={15} />
                Add Menu Item
              </button>
            </div>
          </div>
        </motion.div>

        {/* Menu selector tabs (if multiple menus) */}
        {menus.length > 1 && (
          <div className="flex gap-2 mb-4 flex-wrap">
            {menus.map((m) => (
              <button
                key={m.id}
                onClick={async () => {
                  const detail = await api.get<{ success: boolean; data: NavigationMenu }>(
                    `/menus/${m.id}`
                  );
                  setActiveMenu(detail.data);
                }}
                className={cn(
                  "px-4 py-1.5 text-sm rounded-full transition-all",
                  activeMenu?.id === m.id
                    ? "bg-[#1A1A1A] text-white"
                    : "bg-white text-[#1A1A1A]/60 hover:bg-[#F5F0EB]"
                )}
              >
                {m.label || m.name}
              </button>
            ))}
          </div>
        )}

        {/* Main content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-6 h-6 animate-spin text-[#C9A96E]" />
            </div>
          ) : !activeMenu ? (
            /* Empty state */
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="py-20 flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[#F5F0EB] flex items-center justify-center">
                  <Menu className="w-7 h-7 text-[#C9A96E]" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-medium text-[#1A1A1A] mb-1">No navigation menu yet</h3>
                  <p className="text-[#1A1A1A]/50 text-sm font-light max-w-[340px]">
                    Seed from your existing categories to get started instantly, or create items manually.
                  </p>
                </div>
                <button
                  onClick={handleSeedDefault}
                  disabled={seeding}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#1A1A1A] rounded-lg hover:bg-[#1A1A1A]/80 transition-colors"
                >
                  {seeding ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                  Seed from Categories
                </button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
              {/* Tree panel */}
              <div className="lg:col-span-3">
                <Card className="bg-white border-0 shadow-sm">
                  <CardContent className="p-0">
                    {/* Legend */}
                    <div className="flex items-center justify-between px-5 py-3 border-b border-[#F5F0EB]">
                      <span className="text-xs text-[#1A1A1A]/40 font-light">
                        {activeMenu.label || activeMenu.name} •{" "}
                        {activeMenu.items.length} top-level items
                      </span>
                      <div className="flex items-center gap-3 text-[11px] text-[#1A1A1A]/30">
                        <span>Drag rows to reorder</span>
                      </div>
                    </div>

                    {/* Items tree */}
                    <div className="p-3">
                      {activeMenu.items.length === 0 ? (
                        <div className="py-12 flex flex-col items-center gap-3">
                          <Menu className="w-8 h-8 text-[#1A1A1A]/15" />
                          <p className="text-sm text-[#1A1A1A]/40">
                            No items yet.{" "}
                            <button
                              onClick={openAddRoot}
                              className="text-[#7A6543] underline underline-offset-2"
                            >
                              Add the first item
                            </button>
                          </p>
                        </div>
                      ) : (
                        activeMenu.items.map((item) => (
                          <MenuItemRow
                            key={item.id}
                            item={item}
                            onEdit={openEdit}
                            onDelete={(i) => setDeleteConfirm(i)}
                            onToggleActive={handleToggleActive}
                            onAddChild={openAddChild}
                          />
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Legend / tips panel */}
              <div className="space-y-4">
                <Card className="bg-white border-0 shadow-sm">
                  <CardContent className="p-5">
                    <h3 className="text-sm font-medium text-[#1A1A1A] mb-3">Item Types</h3>
                    <div className="space-y-2">
                      {Object.entries(TYPE_CONFIG).map(([type, conf]) => {
                        const Icon = conf.icon;
                        return (
                          <div key={type} className="flex items-center gap-2">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full",
                                conf.color
                              )}
                            >
                              <Icon size={10} />
                              {conf.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border-0 shadow-sm">
                  <CardContent className="p-5">
                    <h3 className="text-sm font-medium text-[#1A1A1A] mb-2">Tips</h3>
                    <ul className="space-y-1.5 text-xs text-[#1A1A1A]/50 font-light">
                      <li>• Top-level items appear as drawer tabs</li>
                      <li>• Child items appear as rows under each tab</li>
                      <li>• Unlimited nesting supported</li>
                      <li>• Use Promotional type for sale banners</li>
                      <li>• Deactivate items to hide without deleting</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* MenuItemForm modal */}
      <MenuItemForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditItem(null);
          setDefaultParentId(undefined);
        }}
        onSave={handleFormSave}
        editItem={editItem}
        defaultParentId={defaultParentId}
        menuItems={activeMenu?.items || []}
        saving={saving}
      />

      {/* Delete confirmation */}
      <AnimatePresence>
        {deleteConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={() => setDeleteConfirm(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-xl shadow-xl p-6"
            >
              <h3 className="text-base font-medium text-[#1A1A1A] mb-2">Delete menu item?</h3>
              <p className="text-sm text-[#1A1A1A]/50 font-light mb-5">
                <strong>&ldquo;{deleteConfirm.title}&rdquo;</strong> will be removed. Child items will
                be moved up one level.
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 text-sm text-[#1A1A1A]/60 hover:text-[#1A1A1A] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteItem}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-50"
                >
                  {saving && <Loader2 size={13} className="animate-spin" />}
                  Delete
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={cn(
              "fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-lg",
              toast.type === "success"
                ? "bg-[#1A1A1A] text-white"
                : "bg-rose-600 text-white"
            )}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
