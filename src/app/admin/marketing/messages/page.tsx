"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  MailOpen,
  Archive,
  Trash2,
  Reply,
  Phone,
  Search,
  ArrowLeft,
  Clock,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/search-input";
import { Separator } from "@/components/ui/separator";
import { formatDate, formatDateTime, cn } from "@/lib/utils";
import type { ContactMessage } from "@/types";

const mockMessages: ContactMessage[] = [
  {
    id: "1",
    name: "Ayesha Siddiqui",
    email: "ayesha.siddiqui@gmail.com",
    phone: "+92 321 4567890",
    subject: "Custom Bridal Dress Inquiry",
    message: "Assalam-o-Alaikum, I am looking for a custom bridal lehenga for my wedding in December. I would love to explore your bridal collection and discuss customization options. Could you please share your available designs and pricing? I am particularly interested in gold and maroon tones with heavy embroidery. JazakAllah.",
    status: "unread",
    createdAt: "2026-07-18T09:15:00Z",
  },
  {
    id: "2",
    name: "Maira Haq",
    email: "maira.haq@yahoo.com",
    phone: "+92 300 1234567",
    subject: "Size Exchange Request",
    message: "Hi, I recently ordered the Velvet Anarkali suit (Order #AA-4521) and it runs a size too small. I would like to exchange it for a larger size. The order was delivered 3 days ago. Please let me know the process. Thank you.",
    status: "unread",
    createdAt: "2026-07-17T16:30:00Z",
  },
  {
    id: "3",
    name: "Sobia Qadir",
    email: "sobia.qadir@outlook.com",
    subject: "Wholesale Partnership Inquiry",
    message: "Dear AA Neddles Team, I own a boutique in Lahore and I am interested in stocking your ready-to-wear collection. Could you share details about your wholesale pricing, minimum order quantities, and partnership terms? Looking forward to hearing from you.",
    status: "read",
    createdAt: "2026-07-16T11:00:00Z",
  },
  {
    id: "4",
    name: "Nida Faisal",
    email: "nida.faisal@hotmail.com",
    phone: "+92 333 9876543",
    subject: "Fabric Quality Concern",
    message: "Hello, I purchased the Silk Formal Sharara set last week. While the design is beautiful, I noticed some loose stitching on the hem. I would like to know if this can be repaired or if I can get a replacement. I have attached photos of the issue. Kindly respond at your earliest convenience.",
    status: "replied",
    createdAt: "2026-07-15T14:45:00Z",
  },
  {
    id: "5",
    name: "Tania Raza",
    email: "tania.raza@gmail.com",
    subject: "Eid Collection Availability",
    message: "Salam! When will the Eid ul-Adha collection be available for pre-orders? I absolutely loved the preview on your Instagram. Also, do you offer home delivery in Karachi? Please share the details. Shukriya!",
    status: "read",
    createdAt: "2026-07-14T10:20:00Z",
  },
  {
    id: "6",
    name: "Bushra Malik",
    email: "bushra.malik@yahoo.com",
    phone: "+92 312 5551234",
    subject: "Corporate Order for Event",
    message: "Dear Team, We are organizing a corporate gala and need 50 custom embroidered shawls as gifts for our guests. The event is on August 20th. Can you handle bulk orders with custom branding? Please share a quote and timeline. Thanks.",
    status: "archived",
    createdAt: "2026-07-12T08:30:00Z",
  },
  {
    id: "7",
    name: "Hafsa Noor",
    email: "hafsa.noor@gmail.com",
    phone: "+92 345 7890123",
    subject: "International Shipping Inquiry",
    message: "Hi! I am based in Dubai and absolutely adore your luxury lawn collection. Do you ship internationally? If yes, what are the shipping charges and estimated delivery time to UAE? I would like to place an order for multiple items. Please advise. Thank you!",
    status: "unread",
    createdAt: "2026-07-18T07:45:00Z",
  },
  {
    id: "8",
    name: "Rabia Shah",
    email: "rabia.shah@outlook.com",
    subject: "Gift Wrapping Service",
    message: "Hello, I want to order a gift for my sister and would like premium gift wrapping. Do you offer this service? If so, please let me know the charges and available wrapping options. The item is the Pearl Embellished Clutch Bag. Thanks!",
    status: "read",
    createdAt: "2026-07-13T13:10:00Z",
  },
];

const filterTabs = [
  { key: "all", label: "All", icon: Mail },
  { key: "unread", label: "Unread", icon: MailOpen },
  { key: "read", label: "Read", icon: CheckCircle2 },
  { key: "replied", label: "Replied", icon: Reply },
  { key: "archived", label: "Archived", icon: Archive },
] as const;

type FilterKey = (typeof filterTabs)[number]["key"];

export default function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>(mockMessages);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return messages.filter((m) => {
      const matchFilter =
        activeFilter === "all" || m.status === activeFilter;
      const matchSearch =
        !search ||
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.subject.toLowerCase().includes(search.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [messages, activeFilter, search]);

  const selected = messages.find((m) => m.id === selectedId) || null;
  const unreadCount = messages.filter((m) => m.status === "unread").length;

  const markAsRead = (id: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: "read" as const } : m))
    );
  };

  const markAsReplied = (id: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: "replied" as const } : m))
    );
  };

  const archiveMessage = (id: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, status: "archived" as const } : m
      )
    );
    if (selectedId === id) setSelectedId(null);
  };

  const deleteMessage = (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const selectMessage = (id: string) => {
    setSelectedId(id);
    const msg = messages.find((m) => m.id === id);
    if (msg && msg.status === "unread") markAsRead(id);
  };

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-[#1A1A1A]">
            Contact Messages
          </h1>
          {unreadCount > 0 && (
            <Badge className="bg-[#8B1A1A] text-white border-[#8B1A1A]">
              {unreadCount} unread
            </Badge>
          )}
        </div>
      </div>

      <Card className="border-gray-100">
        <CardContent className="p-0">
          <div className="flex h-[calc(100vh-260px)]">
            <div
              className={cn(
                "flex w-full flex-col border-r border-gray-100 lg:w-[380px]",
                selected && "hidden lg:flex"
              )}
            >
              <div className="space-y-3 border-b border-gray-100 p-4">
                <div className="flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
                  {filterTabs.map((tab) => {
                    const count =
                      tab.key === "all"
                        ? messages.length
                        : messages.filter((m) => m.status === tab.key).length;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setActiveFilter(tab.key)}
                        className={cn(
                          "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                          activeFilter === tab.key
                            ? "bg-white text-[#7A6543] shadow-sm"
                            : "text-gray-500 hover:text-[#1A1A1A]"
                        )}
                      >
                        {tab.label}
                        {count > 0 && (
                          <span
                            className={cn(
                              "ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] leading-none",
                              activeFilter === tab.key
                                ? "bg-[#C9A96E]/15 text-[#7A6543]"
                                : "bg-gray-200 text-gray-500"
                            )}
                          >
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                <SearchInput
                  placeholder="Search by name or subject..."
                  onChange={setSearch}
                />
              </div>

              <div className="flex-1 overflow-y-auto">
                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Mail className="mb-3 h-10 w-10 text-gray-300" />
                    <p className="text-sm font-medium text-gray-500">No messages found</p>
                  </div>
                ) : (
                  filtered.map((msg) => (
                    <button
                      key={msg.id}
                      onClick={() => selectMessage(msg.id)}
                      className={cn(
                        "flex w-full flex-col gap-1 border-b border-gray-50 px-4 py-3.5 text-left transition-colors hover:bg-[#C9A96E]/5",
                        selectedId === msg.id && "bg-[#C9A96E]/10",
                        msg.status === "unread" && "bg-[#F5F0EB]"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {msg.status === "unread" && (
                            <span className="h-2 w-2 shrink-0 rounded-full bg-[#C9A96E]" />
                          )}
                          <span
                            className={cn(
                              "text-sm",
                              msg.status === "unread"
                                ? "font-semibold text-[#1A1A1A]"
                                : "font-medium text-[#1A1A1A]/80"
                            )}
                          >
                            {msg.name}
                          </span>
                        </div>
                        <span className="text-[11px] text-gray-400">
                          {formatDate(msg.createdAt)}
                        </span>
                      </div>
                      <p
                        className={cn(
                          "text-xs",
                          msg.status === "unread"
                            ? "font-medium text-[#1A1A1A]/70"
                            : "text-gray-500"
                        )}
                      >
                        {msg.subject}
                      </p>
                      <p className="truncate text-xs text-gray-400">
                        {msg.message}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div
              className={cn(
                "flex flex-1 flex-col",
                !selected && "hidden lg:flex"
              )}
            >
              {selected ? (
                <>
                  <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4">
                    <button
                      onClick={() => setSelectedId(null)}
                      className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#1A1A1A] lg:hidden"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div className="flex-1">
                      <h2 className="text-base font-semibold text-[#1A1A1A]">
                        {selected.subject}
                      </h2>
                      <p className="text-xs text-gray-500">
                        From {selected.name} &middot; {formatDateTime(selected.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {selected.status !== "replied" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5"
                          onClick={() => markAsReplied(selected.id)}
                        >
                          <Reply className="h-3.5 w-3.5" />
                          Reply
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-1.5 text-gray-500"
                        onClick={() => archiveMessage(selected.id)}
                      >
                        <Archive className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-1.5 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => deleteMessage(selected.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="mb-6 flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#C9A96E]/10 text-lg font-bold text-[#7A6543]">
                        {selected.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-[#1A1A1A]">
                          {selected.name}
                        </p>
                        <p className="text-sm text-gray-500">{selected.email}</p>
                        {selected.phone && (
                          <div className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
                            <Phone className="h-3 w-3" />
                            {selected.phone}
                          </div>
                        )}
                      </div>
                      <div className="ml-auto flex items-center gap-2">
                        <Badge
                          variant={
                            selected.status === "unread"
                              ? "default"
                              : selected.status === "replied"
                              ? "default"
                              : selected.status === "archived"
                              ? "secondary"
                              : "outline"
                          }
                          className={cn(
                            selected.status === "replied" && "bg-emerald-50 text-emerald-700 border-emerald-200",
                            selected.status === "archived" && "bg-gray-100 text-gray-600"
                          )}
                        >
                          {selected.status.charAt(0).toUpperCase() + selected.status.slice(1)}
                        </Badge>
                      </div>
                    </div>

                    <Separator className="mb-6" />

                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-wrap leading-relaxed text-[#1A1A1A]/80">
                        {selected.message}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#C9A96E]/10">
                    <Mail className="h-7 w-7 text-[#7A6543]" />
                  </div>
                  <p className="text-base font-semibold text-[#1A1A1A]">
                    Select a message
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Choose a conversation from the inbox to read
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
