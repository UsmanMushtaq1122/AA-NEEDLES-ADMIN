"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/api";
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


const filterTabs = [
  { key: "all", label: "All", icon: Mail },
  { key: "unread", label: "Unread", icon: MailOpen },
  { key: "read", label: "Read", icon: CheckCircle2 },
  { key: "replied", label: "Replied", icon: Reply },
  { key: "archived", label: "Archived", icon: Archive },
] as const;

type FilterKey = (typeof filterTabs)[number]["key"];

export default function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<any>("/contact");
      setMessages(res.data || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/contact/${id}`, { status: "read" });
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: "read" as const } : m))
      );
    } catch (err: any) {
      toast("error", err.message || "Failed to mark message as read");
    }
  };

  const markAsReplied = async (id: string) => {
    try {
      await api.put(`/contact/${id}`, { status: "replied" });
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: "replied" as const } : m))
      );
      toast("success", "Status updated: Replied");
    } catch (err: any) {
      toast("error", err.message || "Failed to update status");
    }
  };

  const archiveMessage = async (id: string) => {
    try {
      await api.put(`/contact/${id}`, { status: "archived" });
      setMessages((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, status: "archived" as const } : m
        )
      );
      toast("success", "Message archived successfully");
      if (selectedId === id) setSelectedId(null);
    } catch (err: any) {
      toast("error", err.message || "Failed to archive message");
    }
  };

  const deleteMessage = async (id: string) => {
    try {
      await api.delete(`/contact/${id}`);
      setMessages((prev) => prev.filter((m) => m.id !== id));
      toast("success", "Message deleted successfully");
      if (selectedId === id) setSelectedId(null);
    } catch (err: any) {
      toast("error", err.message || "Failed to delete message");
    }
  };

  const selectMessage = (id: string) => {
    setSelectedId(id);
    const msg = messages.find((m) => m.id === id);
    if (msg && msg.status === "unread") markAsRead(id);
  };

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
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <p className="text-sm font-medium text-gray-400">Loading messages...</p>
                  </div>
                ) : filtered.length === 0 ? (
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
