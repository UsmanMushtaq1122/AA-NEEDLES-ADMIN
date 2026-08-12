"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Bell,
  LogOut,
  User,
  ChevronDown,
  Plus,
  ExternalLink,
  Package,
  ShoppingCart,
  Users,
  Image as ImageIcon,
  Tag,
  Settings,
  Shield,
  CheckCircle2,
  Sparkles,
  Command,
  X,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { STORE_URL } from "@/lib/config";
import { useAppDispatch, useAppSelector } from "@/store";
import { useAuth } from "@/hooks/useAuth";
import { toggleSidebar } from "@/store/slices/uiSlice";
import Breadcrumbs from "./breadcrumbs";

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  unread: boolean;
  type: "order" | "inventory" | "system";
  link: string;
}

const initialNotifications: NotificationItem[] = [
  {
    id: "1",
    title: "New Premium Order #1048",
    description: "Silk Dupatta & Embroidered Suit — PKR 45,000",
    time: "2m ago",
    unread: true,
    type: "order",
    link: "/admin/orders",
  },
  {
    id: "2",
    title: "Low Stock Alert",
    description: "Velvet Anarkali Set (Size M) is down to 2 items",
    time: "15m ago",
    unread: true,
    type: "inventory",
    link: "/admin/products",
  },
  {
    id: "3",
    title: "New 5-Star Customer Review",
    description: "Fatima Khan left a review on 'Royal Kurti'",
    time: "1h ago",
    unread: true,
    type: "system",
    link: "/admin/reviews",
  },
  {
    id: "4",
    title: "Payment Verified",
    description: "Order #1042 card payment of PKR 32,500 settled",
    time: "3h ago",
    unread: false,
    type: "order",
    link: "/admin/payments",
  },
];

const searchNavItems = [
  { label: "Products Catalog", href: "/admin/products", category: "Navigation", icon: Package },
  { label: "Orders & Fulfillment", href: "/admin/orders", category: "Navigation", icon: ShoppingCart },
  { label: "Customer List", href: "/admin/customers", category: "Navigation", icon: Users },
  { label: "Banner & Slides", href: "/admin/content/banners", category: "Navigation", icon: ImageIcon },
  { label: "Coupons & Discounts", href: "/admin/coupons", category: "Navigation", icon: Tag },
  { label: "General Settings", href: "/admin/settings", category: "Navigation", icon: Settings },
  { label: "Admin Access", href: "/admin/settings/users", category: "Navigation", icon: Shield },
  { label: "Add New Product", href: "/admin/products/new", category: "Quick Action", icon: Plus },
  { label: "Upload Banner", href: "/admin/content/banners", category: "Quick Action", icon: ImageIcon },
];

export default function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const collapsed = useAppSelector((state) => state.ui.sidebarCollapsed);
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();

  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState(initialNotifications);
  const [activeNotifTab, setActiveNotifTab] = useState<"all" | "unread">("all");

  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const quickAddRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const { data: notificationCount = unreadCount } = useQuery({
    queryKey: ["notifications-count"],
    queryFn: async () => unreadCount,
    initialData: unreadCount,
    refetchInterval: 60000,
  });

  // Keyboard shortcut Ctrl+K / Cmd+K for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setSearchModalOpen(false);
        setProfileOpen(false);
        setNotificationsOpen(false);
        setQuickAddOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
      if (quickAddRef.current && !quickAddRef.current.contains(e.target as Node)) {
        setQuickAddOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllNotifsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const filteredSearchItems = searchNavItems.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayedNotifications =
    activeNotifTab === "unread"
      ? notifications.filter((n) => n.unread)
      : notifications;

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#1A1A1A]/10 bg-white/90 px-4 md:px-6 backdrop-blur-md shadow-xs transition-all">
        {/* Left Section: Sidebar Toggle & Breadcrumbs */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Sidebar toggle removed as requested */}

          <Breadcrumbs pathname={pathname} />
        </div>

        {/* Center / Right Section */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Quick Search Button / Input Command Bar */}
          <button
            onClick={() => setSearchModalOpen(true)}
            className="group relative hidden h-9 w-56 items-center justify-between rounded-xl border border-stone-200 bg-stone-50/80 px-3 text-xs text-stone-500 shadow-2xs transition-all hover:border-[#C9A96E]/60 hover:bg-white hover:shadow-xs md:flex lg:w-72"
          >
            <span className="flex items-center gap-2">
              <Search size={15} className="text-stone-400 transition-colors group-hover:text-[#C9A96E]" />
              <span className="truncate">Search commands, pages...</span>
            </span>
            <kbd className="inline-flex h-5 items-center gap-0.5 rounded border border-stone-200 bg-white px-1.5 font-mono text-[10px] font-semibold text-stone-500 shadow-2xs">
              <Command size={10} />K
            </kbd>
          </button>

          {/* Mobile Search Icon */}
          <button
            onClick={() => setSearchModalOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-stone-600 transition-colors hover:bg-stone-100 md:hidden"
            title="Search"
          >
            <Search size={19} />
          </button>

          {/* Store Live Pill Status */}
          <div className="hidden items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50/80 px-3 py-1 text-xs font-semibold text-emerald-800 lg:flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span>Store Live</span>
          </div>

          {/* Quick Add Dropdown */}
          <div ref={quickAddRef} className="relative">
            <button
              onClick={() => setQuickAddOpen(!quickAddOpen)}
              className="flex h-9 items-center gap-1.5 rounded-xl border border-[#C9A96E]/40 bg-[#C9A96E]/10 px-3 text-xs font-semibold text-[#7A6543] transition-all hover:bg-[#C9A96E]/20 active:scale-95"
            >
              <Plus size={15} className="stroke-[2.5]" />
              <span className="hidden sm:inline">Quick Add</span>
              <ChevronDown
                size={13}
                className={cn("transition-transform duration-200", quickAddOpen && "rotate-180")}
              />
            </button>

            <AnimatePresence>
              {quickAddOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-2xl border border-stone-200 bg-white p-1.5 shadow-xl ring-1 ring-black/5 z-50"
                >
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Create New
                  </div>
                  <Link
                    href="/admin/products/new"
                    onClick={() => setQuickAddOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-stone-700 transition-colors hover:bg-[#C9A96E]/10 hover:text-[#7A6543]"
                  >
                    <Package size={15} />
                    New Product
                  </Link>
                  <Link
                    href="/admin/content/banners"
                    onClick={() => setQuickAddOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-stone-700 transition-colors hover:bg-[#C9A96E]/10 hover:text-[#7A6543]"
                  >
                    <ImageIcon size={15} />
                    New Banner
                  </Link>
                  <Link
                    href="/admin/coupons"
                    onClick={() => setQuickAddOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-stone-700 transition-colors hover:bg-[#C9A96E]/10 hover:text-[#7A6543]"
                  >
                    <Tag size={15} />
                    New Coupon
                  </Link>
                  <div className="my-1 h-px bg-stone-100" />
                  <a
                    href={STORE_URL}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setQuickAddOpen(false)}
                    className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-100"
                  >
                    <span className="flex items-center gap-2.5">
                      <ExternalLink size={15} />
                      View Storefront
                    </span>
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Notifications Dropdown */}
          <div ref={notificationsRef} className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative flex h-9 w-9 items-center justify-center rounded-xl text-stone-600 transition-all hover:bg-stone-100 hover:text-[#1A1A1A]"
              title="Notifications"
            >
              <Bell size={19} />
              {notificationCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#8B1A1A] px-1 text-[10px] font-bold text-white shadow-xs animate-pulse">
                  {notificationCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {notificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-80 sm:w-96 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl z-50"
                >
                  <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3 bg-stone-50/50">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm text-[#1A1A1A]">Notifications</h4>
                      {unreadCount > 0 && (
                        <span className="rounded-full bg-[#8B1A1A]/10 px-2 py-0.5 text-[11px] font-bold text-[#8B1A1A]">
                          {unreadCount} unread
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotifsAsRead}
                        className="text-xs font-semibold text-[#7A6543] transition-colors hover:text-[#1A1A1A]"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  {/* Filter Tabs */}
                  <div className="flex border-b border-stone-100 bg-white px-4 pt-2">
                    <button
                      onClick={() => setActiveNotifTab("all")}
                      className={cn(
                        "pb-2 text-xs font-semibold transition-colors border-b-2 px-2",
                        activeNotifTab === "all"
                          ? "border-[#C9A96E] text-[#1A1A1A]"
                          : "border-transparent text-stone-400 hover:text-stone-600"
                      )}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setActiveNotifTab("unread")}
                      className={cn(
                        "pb-2 text-xs font-semibold transition-colors border-b-2 px-2 ml-4",
                        activeNotifTab === "unread"
                          ? "border-[#C9A96E] text-[#1A1A1A]"
                          : "border-transparent text-stone-400 hover:text-stone-600"
                      )}
                    >
                      Unread ({unreadCount})
                    </button>
                  </div>

                  {/* Notification List */}
                  <div className="max-h-80 overflow-y-auto divide-y divide-stone-100">
                    {displayedNotifications.length === 0 ? (
                      <div className="p-8 text-center text-xs text-stone-400">
                        <CheckCircle2 size={24} className="mx-auto mb-2 text-emerald-500 opacity-60" />
                        No notifications to display
                      </div>
                    ) : (
                      displayedNotifications.map((n) => (
                        <Link
                          key={n.id}
                          href={n.link}
                          onClick={() => {
                            setNotifications((prev) =>
                              prev.map((item) => (item.id === n.id ? { ...item, unread: false } : item))
                            );
                            setNotificationsOpen(false);
                          }}
                          className={cn(
                            "flex items-start gap-3 p-3.5 transition-colors hover:bg-stone-50",
                            n.unread ? "bg-[#C9A96E]/5" : "bg-white"
                          )}
                        >
                          <div
                            className={cn(
                              "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white mt-0.5",
                              n.type === "order"
                                ? "bg-emerald-600"
                                : n.type === "inventory"
                                ? "bg-amber-500"
                                : "bg-indigo-600"
                            )}
                          >
                            {n.type === "order" ? (
                              <ShoppingCart size={15} />
                            ) : n.type === "inventory" ? (
                              <AlertTriangle size={15} />
                            ) : (
                              <Sparkles size={15} />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className={cn("text-xs font-semibold truncate", n.unread ? "text-[#1A1A1A]" : "text-stone-600")}>
                                {n.title}
                              </p>
                              <span className="shrink-0 text-[10px] text-stone-400">{n.time}</span>
                            </div>
                            <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">{n.description}</p>
                          </div>
                          {n.unread && <span className="h-2 w-2 shrink-0 rounded-full bg-[#8B1A1A] mt-1.5" />}
                        </Link>
                      ))
                    )}
                  </div>

                  <div className="border-t border-stone-100 bg-stone-50/60 p-2 text-center">
                    <Link
                      href="/admin/orders"
                      onClick={() => setNotificationsOpen(false)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#7A6543] hover:text-[#1A1A1A]"
                    >
                      View order dashboard <ArrowRight size={12} />
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="h-4 w-px bg-stone-200 mx-0.5" />

          {/* User Profile Menu */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2.5 rounded-xl p-1.5 transition-all hover:bg-stone-100 active:scale-98"
            >
              <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[#1A1A1A] text-xs font-bold text-[#F5F0EB] ring-2 ring-[#C9A96E]/30 shadow-2xs">
                {user?.name?.charAt(0) || "A"}
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
              </div>
              <div className="hidden text-left md:block">
                <p className="text-xs font-bold leading-none text-[#1A1A1A]">
                  {user?.name || "Admin"}
                </p>
                <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#7A6543]">
                  {user?.role || "Super Admin"}
                </p>
              </div>
              <ChevronDown
                size={14}
                className={cn(
                  "hidden text-stone-400 transition-transform duration-200 md:block",
                  profileOpen && "rotate-180"
                )}
              />
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-64 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl z-50"
                >
                  <div className="border-b border-stone-100 bg-stone-50/70 px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1A1A1A] text-sm font-bold text-[#F5F0EB] ring-2 ring-[#C9A96E]/40">
                        {user?.name?.charAt(0) || "A"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-[#1A1A1A]">
                          {user?.name || "Admin User"}
                        </p>
                        <p className="truncate text-xs text-stone-500">
                          {user?.email || "admin@aanneddles.com"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-1.5 space-y-0.5">
                    <Link
                      href="/admin/settings/users"
                      onClick={() => setProfileOpen(false)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-100 hover:text-[#1A1A1A]"
                    >
                      <User size={16} className="text-stone-400" />
                      Account Settings
                    </Link>
                    <Link
                      href="/admin/settings"
                      onClick={() => setProfileOpen(false)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-100 hover:text-[#1A1A1A]"
                    >
                      <Settings size={16} className="text-stone-400" />
                      Store Preferences
                    </Link>
                    <a
                      href={STORE_URL}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => setProfileOpen(false)}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-100 hover:text-[#1A1A1A]"
                    >
                      <span className="flex items-center gap-3">
                        <ExternalLink size={16} className="text-stone-400" />
                        View Live Website
                      </span>
                    </a>
                  </div>

                  <div className="border-t border-stone-100 p-1.5">
                    <button
                      onClick={() => logout(queryClient)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold text-[#8B1A1A] transition-colors hover:bg-red-50"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Global Command Palette / Search Modal */}
      <AnimatePresence>
        {searchModalOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSearchModalOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -16 }}
              transition={{ duration: 0.18 }}
              className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl z-50"
            >
              {/* Search Header Input */}
              <div className="flex items-center border-b border-stone-100 px-4 py-3">
                <Search size={18} className="text-[#C9A96E] shrink-0 mr-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search pages, orders, products..."
                  autoFocus
                  className="w-full bg-transparent text-sm font-medium text-[#1A1A1A] placeholder-stone-400 outline-none"
                />
                {searchQuery ? (
                  <button onClick={() => setSearchQuery("")} className="p-1 text-stone-400 hover:text-stone-600">
                    <X size={16} />
                  </button>
                ) : (
                  <button onClick={() => setSearchModalOpen(false)} className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600">
                    <X size={18} />
                  </button>
                )}
              </div>

              {/* Quick Results List */}
              <div className="max-h-96 overflow-y-auto p-2">
                {filteredSearchItems.length === 0 ? (
                  <div className="py-10 text-center text-xs text-stone-400">
                    No results found for &ldquo;{searchQuery}&rdquo;
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      Quick Links
                    </div>
                    {filteredSearchItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.href + item.label}
                          onClick={() => {
                            router.push(item.href);
                            setSearchModalOpen(false);
                          }}
                          className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-medium text-stone-700 transition-colors hover:bg-[#C9A96E]/10 hover:text-[#7A6543]"
                        >
                          <span className="flex items-center gap-3">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-100 text-stone-600">
                              <Icon size={14} />
                            </div>
                            <span>{item.label}</span>
                          </span>
                          <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
                            {item.category}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer status */}
              <div className="flex items-center justify-between border-t border-stone-100 bg-stone-50 px-4 py-2 text-[11px] text-stone-400">
                <span>Navigate with click or arrow keys</span>
                <kbd className="rounded border border-stone-200 bg-white px-1 font-mono text-[10px]">ESC to close</kbd>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
