"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  UserCheck,
  UserPlus,
  TrendingUp,
  Download,
  Mail,
  MoreHorizontal,
  Trash2,
  UserX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/search-input";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { formatDate, cn } from "@/lib/utils";
import type { Subscriber } from "@/types";

const chartData = [
  { month: "Jan", subscribers: 42 },
  { month: "Feb", subscribers: 78 },
  { month: "Mar", subscribers: 115 },
  { month: "Apr", subscribers: 164 },
  { month: "May", subscribers: 210 },
  { month: "Jun", subscribers: 285 },
  { month: "Jul", subscribers: 342 },
];

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const { toast } = useToast();

  const fetchSubscribers = useCallback(() => {
    setLoading(true);
    api.get<any>("/newsletter")
      .then((res) => {
        setSubscribers(res.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  const filtered = useMemo(() => {
    return subscribers.filter((s) => {
      const matchSearch =
        !search ||
        s.email.toLowerCase().includes(search.toLowerCase()) ||
        (s.name && s.name.toLowerCase().includes(search.toLowerCase()));
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && s.isActive) ||
        (statusFilter === "inactive" && !s.isActive);
      return matchSearch && matchStatus;
    });
  }, [subscribers, search, statusFilter]);

  const totalSubscribers = subscribers.length;
  const activeSubscribers = subscribers.filter((s) => s.isActive).length;
  const newThisMonth = subscribers.filter(
    (s) => new Date(s.createdAt).getMonth() === new Date().getMonth() && new Date(s.createdAt).getFullYear() === new Date().getFullYear()
  ).length;
  const growthRate = 18.4;

  const toggleActive = async (id: string) => {
    const sub = subscribers.find((s) => s.id === id);
    if (!sub) return;
    try {
      await api.put(`/newsletter/${id}`, { isActive: !sub.isActive });
      toast("success", "Subscriber status updated");
      fetchSubscribers();
    } catch (err: any) {
      toast("error", err.message || "Failed to update subscriber");
    }
  };

  const removeSubscriber = async (id: string) => {
    try {
      await api.delete(`/newsletter/${id}`);
      toast("success", "Subscriber removed successfully");
      fetchSubscribers();
    } catch (err: any) {
      toast("error", err.message || "Failed to delete subscriber");
    }
  };

  const exportCSV = () => {
    const header = "Email,Name,Status,Subscribed Date\n";
    const rows = subscribers
      .map(
        (s) =>
          `${s.email},${s.name || ""},${s.isActive ? "Active" : "Inactive"},${formatDate(s.createdAt)}`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "newsletter-subscribers.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const statCards = [
    {
      title: "Total Subscribers",
      value: totalSubscribers,
      icon: Users,
      color: "text-[#7A6543]",
      bg: "bg-[#C9A96E]/10",
    },
    {
      title: "Active Subscribers",
      value: activeSubscribers,
      icon: UserCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "New This Month",
      value: newThisMonth,
      icon: UserPlus,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Growth Rate",
      value: `+${growthRate}%`,
      icon: TrendingUp,
      color: "text-[#7A6543]",
      bg: "bg-[#C9A96E]/10",
    },
  ];

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A1A1A]">
            Newsletter Subscribers
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {totalSubscribers} total subscribers
          </p>
        </div>
        <Button onClick={exportCSV} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className="border-gray-100">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                      {stat.title}
                    </p>
                    <p className="mt-2 text-2xl font-bold text-[#1A1A1A]">
                      {stat.value}
                    </p>
                  </div>
                  <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", stat.bg)}>
                    <stat.icon className={cn("h-5 w-5", stat.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-gray-100">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Subscriber Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="subscriberGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C9A96E" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#C9A96E" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#9CA3AF" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#9CA3AF" }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #E5E7EB",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
                      fontSize: "13px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="subscribers"
                    stroke="#C9A96E"
                    strokeWidth={2.5}
                    fill="url(#subscriberGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-gray-100">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">All Subscribers</CardTitle>
              <div className="flex items-center gap-3">
                <div className="flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
                  {(["all", "active", "inactive"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setStatusFilter(f)}
                      className={cn(
                        "rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-all",
                        statusFilter === f
                          ? "bg-white text-[#7A6543] shadow-sm"
                          : "text-gray-500 hover:text-[#1A1A1A]"
                      )}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <SearchInput
                  placeholder="Search by email or name..."
                  onChange={setSearch}
                  className="w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-gray-100">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Subscribed</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[60px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                        Loading subscribers...
                      </TableCell>
                    </TableRow>
                  ) : filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                        No subscribers found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((s, i) => (
                      <TableRow key={s.id}>
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C9A96E]/10 text-xs font-semibold text-[#7A6543]">
                              {s.email.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium">{s.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>{s.name || "—"}</TableCell>
                        <TableCell className="text-gray-500">
                          {formatDate(s.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={s.isActive ? "default" : "secondary"}>
                            {s.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#1A1A1A]">
                                <MoreHorizontal className="h-4 w-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => toggleActive(s.id)}>
                                {s.isActive ? (
                                  <>
                                    <UserX className="h-4 w-4" />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="h-4 w-4" />
                                    Activate
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem destructive onClick={() => removeSubscriber(s.id)}>
                                <Trash2 className="h-4 w-4" />
                                Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
