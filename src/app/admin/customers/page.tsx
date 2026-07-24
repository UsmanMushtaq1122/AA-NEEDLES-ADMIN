"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Download,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  MapPin,
  ShoppingBag,
  Calendar,
  Eye,
  MoreHorizontal,
  User,
  TrendingUp,
  FileText,
  ToggleLeft,
  ToggleRight,
  ArrowUpDown,
  Filter,
  X,
  Star,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  totalOrders: number;
  totalSpent: number;
  lastOrder: string;
  status: "active" | "inactive";
  joinedDate: string;
  addresses: { label: string; address: string; city: string; isDefault: boolean }[];
  orders: { id: string; date: string; total: number; status: string; items: number }[];
  notes: string;
  tier: "gold" | "silver" | "platinum";
}

const mockCustomers: Customer[] = [
  {
    id: "c1",
    name: "Ayesha Khan",
    email: "ayesha.khan@gmail.com",
    phone: "+92 321 4567890",
    avatar: "AK",
    totalOrders: 23,
    totalSpent: 345000,
    lastOrder: "2026-07-15",
    status: "active",
    joinedDate: "2024-03-12",
    addresses: [
      { label: "Home", address: "42-B, Gulberg III", city: "Lahore", isDefault: true },
      { label: "Office", address: "15, Mall Road, Cantt", city: "Lahore", isDefault: false },
    ],
    orders: [
      { id: "ORD-7891", date: "2026-07-15", total: 28500, status: "delivered", items: 3 },
      { id: "ORD-7845", date: "2026-06-28", total: 15200, status: "delivered", items: 1 },
      { id: "ORD-7801", date: "2026-06-10", total: 42000, status: "delivered", items: 5 },
      { id: "ORD-7756", date: "2026-05-22", total: 18900, status: "delivered", items: 2 },
      { id: "ORD-7701", date: "2026-05-01", total: 32000, status: "delivered", items: 4 },
    ],
    notes: "VIP customer. Prefers silk fabrics. Birthday: September 14.",
    tier: "platinum",
  },
  {
    id: "c2",
    name: "Fatima Ahmed",
    email: "fatima.ahmed@outlook.com",
    phone: "+92 300 1234567",
    avatar: "FA",
    totalOrders: 15,
    totalSpent: 210000,
    lastOrder: "2026-07-10",
    status: "active",
    joinedDate: "2024-06-20",
    addresses: [
      { label: "Home", address: "7, Clifton Block 5", city: "Karachi", isDefault: true },
    ],
    orders: [
      { id: "ORD-7876", date: "2026-07-10", total: 19800, status: "delivered", items: 2 },
      { id: "ORD-7823", date: "2026-06-15", total: 35000, status: "delivered", items: 3 },
      { id: "ORD-7789", date: "2026-05-30", total: 12500, status: "delivered", items: 1 },
    ],
    notes: "Loves the bridal collection. Size: M.",
    tier: "gold",
  },
  {
    id: "c3",
    name: "Noor Malik",
    email: "noor.malik@yahoo.com",
    phone: "+92 333 9876543",
    avatar: "NM",
    totalOrders: 8,
    totalSpent: 95000,
    lastOrder: "2026-07-05",
    status: "active",
    joinedDate: "2025-01-10",
    addresses: [
      { label: "Home", address: "22, F-8/2", city: "Islamabad", isDefault: true },
      { label: "Parents", address: "5, DHA Phase 6", city: "Lahore", isDefault: false },
    ],
    orders: [
      { id: "ORD-7855", date: "2026-07-05", total: 22000, status: "delivered", items: 2 },
      { id: "ORD-7800", date: "2026-06-01", total: 16500, status: "delivered", items: 1 },
    ],
    notes: "Interested in couture pieces.",
    tier: "silver",
  },
  {
    id: "c4",
    name: "Hira Shah",
    email: "hira.shah@hotmail.com",
    phone: "+92 312 5551234",
    avatar: "HS",
    totalOrders: 31,
    totalSpent: 520000,
    lastOrder: "2026-07-16",
    status: "active",
    joinedDate: "2023-11-05",
    addresses: [
      { label: "Home", address: "10, Bahria Town Phase 4", city: "Rawalpindi", isDefault: true },
    ],
    orders: [
      { id: "ORD-7899", date: "2026-07-16", total: 55000, status: "processing", items: 6 },
      { id: "ORD-7888", date: "2026-07-12", total: 18900, status: "delivered", items: 2 },
      { id: "ORD-7850", date: "2026-06-25", total: 42000, status: "delivered", items: 4 },
      { id: "ORD-7812", date: "2026-06-08", total: 29000, status: "delivered", items: 3 },
    ],
    notes: "Top spender. Early access to new collections.",
    tier: "platinum",
  },
  {
    id: "c5",
    name: "Zainab Raza",
    email: "zainab.raza@gmail.com",
    phone: "+92 345 6789012",
    avatar: "ZR",
    totalOrders: 5,
    totalSpent: 67500,
    lastOrder: "2026-06-20",
    status: "active",
    joinedDate: "2025-09-15",
    addresses: [
      { label: "Home", address:  "33, DHA Phase 2", city: "Lahore", isDefault: true },
    ],
    orders: [
      { id: "ORD-7830", date: "2026-06-20", total: 24000, status: "delivered", items: 2 },
      { id: "ORD-7780", date: "2026-05-18", total: 18500, status: "delivered", items: 1 },
    ],
    notes: "Referred by Ayesha Khan.",
    tier: "silver",
  },
  {
    id: "c6",
    name: "Sana Javed",
    email: "sana.javed@outlook.com",
    phone: "+92 300 4443210",
    avatar: "SJ",
    totalOrders: 12,
    totalSpent: 156000,
    lastOrder: "2026-05-30",
    status: "inactive",
    joinedDate: "2024-08-22",
    addresses: [
      { label: "Home", address: "8, Nazimabad No. 3", city: "Karachi", isDefault: true },
    ],
    orders: [
      { id: "ORD-7790", date: "2026-05-30", total: 14200, status: "delivered", items: 1 },
      { id: "ORD-7730", date: "2026-04-15", total: 28000, status: "delivered", items: 3 },
    ],
    notes: "Last contacted about sale items.",
    tier: "silver",
  },
  {
    id: "c7",
    name: "Mehreen Iqbal",
    email: "mehreen.iqbal@gmail.com",
    phone: "+92 322 8765432",
    avatar: "MI",
    totalOrders: 19,
    totalSpent: 278000,
    lastOrder: "2026-07-14",
    status: "active",
    joinedDate: "2024-02-14",
    addresses: [
      { label: "Home", address: "14, Wapda Town", city: "Lahore", isDefault: true },
      { label: "Office", address: "5, Johar Town Block G", city: "Lahore", isDefault: false },
    ],
    orders: [
      { id: "ORD-7893", date: "2026-07-14", total: 31000, status: "shipped", items: 3 },
      { id: "ORD-7860", date: "2026-07-01", total: 19500, status: "delivered", items: 2 },
      { id: "ORD-7810", date: "2026-06-05", total: 45000, status: "delivered", items: 5 },
    ],
    notes: "Enjoys festive collection. Prefers emerald tones.",
    tier: "gold",
  },
  {
    id: "c8",
    name: "Rabia Tariq",
    email: "rabia.tariq@yahoo.com",
    phone: "+92 311 2345678",
    avatar: "RT",
    totalOrders: 3,
    totalSpent: 28500,
    lastOrder: "2026-04-12",
    status: "inactive",
    joinedDate: "2026-01-05",
    addresses: [
      { label: "Home", address: "20, Satellite Town", city: "Gujranwala", isDefault: true },
    ],
    orders: [
      { id: "ORD-7720", date: "2026-04-12", total: 14500, status: "delivered", items: 1 },
    ],
    notes: "New customer. Size S.",
    tier: "silver",
  },
];

const statusColors: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  inactive: "bg-stone-100 text-stone-500 border-stone-200",
  processing: "bg-amber-50 text-amber-700 border-amber-200",
  shipped: "bg-blue-50 text-blue-700 border-blue-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const tierColors: Record<string, string> = {
  platinum: "bg-[#C9A96E]/10 text-[#7A6543] border-[#C9A96E]/30",
  gold: "bg-amber-50 text-amber-700 border-amber-200",
  silver: "bg-stone-100 text-stone-600 border-stone-200",
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [sortField, setSortField] = useState<"name" | "totalSpent" | "totalOrders" | "lastOrder">("lastOrder");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [editNotes, setEditNotes] = useState("");

  const filtered = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery);
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sorted = [...filtered].sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1;
    if (sortField === "name") return a.name.localeCompare(b.name) * dir;
    if (sortField === "totalSpent") return (a.totalSpent - b.totalSpent) * dir;
    if (sortField === "totalOrders") return (a.totalOrders - b.totalOrders) * dir;
    return (new Date(a.lastOrder).getTime() - new Date(b.lastOrder).getTime()) * dir;
  });

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const toggleCustomerStatus = (id: string) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: c.status === "active" ? "inactive" : "active" } : c
      )
    );
  };

  const openDetail = (customer: Customer) => {
    setSelectedCustomer(customer);
    setEditNotes(customer.notes);
    setDetailOpen(true);
  };

  const saveNotes = () => {
    if (selectedCustomer) {
      setCustomers((prev) =>
        prev.map((c) => (c.id === selectedCustomer.id ? { ...c, notes: editNotes } : c))
      );
    }
  };

  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const activeCount = customers.filter((c) => c.status === "active").length;
  const avgSpent = totalRevenue / customers.length;

  return (
    <div className="min-h-screen bg-[#F5F0EB]">
      <div className="p-8 max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-light tracking-wide text-[#1A1A1A]">
                Customers
              </h1>
              <p className="text-[#1A1A1A]/50 mt-1 font-light">
                {customers.length} total customers
              </p>
            </div>
            <Button
              variant="outline"
              className="border-[#C9A96E] text-[#7A6543] hover:bg-[#C9A96E] hover:text-white font-light tracking-wide"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-5">
                <p className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 font-medium">
                  Total Customers
                </p>
                <p className="text-2xl font-light text-[#1A1A1A] mt-1">{customers.length}</p>
              </CardContent>
            </Card>
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-5">
                <p className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 font-medium">
                  Active
                </p>
                <p className="text-2xl font-light text-[#1A1A1A] mt-1">{activeCount}</p>
              </CardContent>
            </Card>
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-5">
                <p className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 font-medium">
                  Total Revenue
                </p>
                <p className="text-2xl font-light text-[#7A6543] mt-1">
                  {formatCurrency(totalRevenue)}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-5">
                <p className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 font-medium">
                  Avg. Spent
                </p>
                <p className="text-2xl font-light text-[#1A1A1A] mt-1">
                  {formatCurrency(Math.round(avgSpent))}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A1A1A]/30" />
                  <Input
                    placeholder="Search by name, email, or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-stone-200 bg-[#F5F0EB]/50 font-light focus:border-[#C9A96E] focus:ring-[#C9A96E]/20"
                  />
                </div>
                <div className="flex gap-2">
                  {(["all", "active", "inactive"] as const).map((status) => (
                    <Button
                      key={status}
                      variant={statusFilter === status ? "default" : "outline"}
                      className={cn(
                        "font-light tracking-wide text-xs uppercase",
                        statusFilter === status
                          ? "bg-[#1A1A1A] text-white"
                          : "border-stone-200 text-[#1A1A1A]/60 hover:border-[#C9A96E] hover:text-[#7A6543]"
                      )}
                      onClick={() => setStatusFilter(status)}
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-stone-100">
                      <TableHead className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 font-medium">
                        Customer
                      </TableHead>
                      <TableHead className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 font-medium">
                        <button
                          onClick={() => toggleSort("name")}
                          className="flex items-center gap-1 hover:text-[#7A6543] transition-colors"
                        >
                          Name
                          <ArrowUpDown className="w-3 h-3" />
                        </button>
                      </TableHead>
                      <TableHead className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 font-medium">
                        Phone
                      </TableHead>
                      <TableHead className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 font-medium">
                        <button
                          onClick={() => toggleSort("totalOrders")}
                          className="flex items-center gap-1 hover:text-[#7A6543] transition-colors"
                        >
                          Orders
                          <ArrowUpDown className="w-3 h-3" />
                        </button>
                      </TableHead>
                      <TableHead className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 font-medium">
                        <button
                          onClick={() => toggleSort("totalSpent")}
                          className="flex items-center gap-1 hover:text-[#7A6543] transition-colors"
                        >
                          Total Spent
                          <ArrowUpDown className="w-3 h-3" />
                        </button>
                      </TableHead>
                      <TableHead className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 font-medium">
                        <button
                          onClick={() => toggleSort("lastOrder")}
                          className="flex items-center gap-1 hover:text-[#7A6543] transition-colors"
                        >
                          Last Order
                          <ArrowUpDown className="w-3 h-3" />
                        </button>
                      </TableHead>
                      <TableHead className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 font-medium">
                        Status
                      </TableHead>
                      <TableHead className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 font-medium">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sorted.map((customer) => (
                      <TableRow
                        key={customer.id}
                        className="border-stone-100 hover:bg-[#F5F0EB]/30 cursor-pointer transition-colors"
                        onClick={() => openDetail(customer)}
                      >
                        <TableCell>
                          <div className="w-9 h-9 rounded-full bg-[#1A1A1A] flex items-center justify-center text-white text-xs font-light tracking-wider">
                            {customer.avatar}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-[#1A1A1A] text-sm">{customer.name}</p>
                            <p className="text-xs text-[#1A1A1A]/40 font-light">{customer.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-[#1A1A1A]/70 font-light">
                          {customer.phone}
                        </TableCell>
                        <TableCell className="text-sm text-[#1A1A1A]/70 font-light">
                          {customer.totalOrders}
                        </TableCell>
                        <TableCell className="text-sm font-medium text-[#7A6543]">
                          {formatCurrency(customer.totalSpent)}
                        </TableCell>
                        <TableCell className="text-sm text-[#1A1A1A]/50 font-light">
                          {formatDate(customer.lastOrder)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              "text-[10px] uppercase tracking-wider font-medium border",
                              statusColors[customer.status]
                            )}
                          >
                            {customer.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white border-stone-100">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openDetail(customer);
                                }}
                                className="font-light text-sm cursor-pointer"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleCustomerStatus(customer.id);
                                }}
                                className="font-light text-sm cursor-pointer"
                              >
                                {customer.status === "active" ? (
                                  <>
                                    <ToggleRight className="w-4 h-4 mr-2" />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <ToggleLeft className="w-4 h-4 mr-2" />
                                    Activate
                                  </>
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {sorted.length === 0 && (
                <div className="text-center py-16">
                  <User className="w-12 h-12 text-[#1A1A1A]/10 mx-auto mb-4" />
                  <p className="text-[#1A1A1A]/40 font-light">No customers found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white border-0">
          {selectedCustomer && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-light tracking-wide text-[#1A1A1A]">
                  Customer Details
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-8">
                <div className="flex items-start gap-5">
                  <div className="w-16 h-16 rounded-full bg-[#1A1A1A] flex items-center justify-center text-white text-lg font-light tracking-wider shrink-0">
                    {selectedCustomer.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-medium text-[#1A1A1A]">
                        {selectedCustomer.name}
                      </h3>
                      <Badge
                        className={cn(
                          "text-[10px] uppercase tracking-wider font-medium border",
                          tierColors[selectedCustomer.tier]
                        )}
                      >
                        {selectedCustomer.tier}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-[#1A1A1A]/50 font-light">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" />
                        {selectedCustomer.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" />
                        {selectedCustomer.phone}
                      </span>
                    </div>
                    <p className="text-xs text-[#1A1A1A]/30 mt-1 font-light">
                      Member since {formatDate(selectedCustomer.joinedDate)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#1A1A1A]/40 font-light">Active</span>
                    <Switch
                      checked={selectedCustomer.status === "active"}
                      onCheckedChange={() => toggleCustomerStatus(selectedCustomer.id)}
                    />
                  </div>
                </div>

                <Separator className="bg-stone-100" />

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-[#F5F0EB] rounded-lg p-4">
                    <p className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 font-medium">
                      Total Orders
                    </p>
                    <p className="text-xl font-light text-[#1A1A1A] mt-1">
                      {selectedCustomer.totalOrders}
                    </p>
                  </div>
                  <div className="bg-[#F5F0EB] rounded-lg p-4">
                    <p className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 font-medium">
                      Total Spent
                    </p>
                    <p className="text-xl font-light text-[#7A6543] mt-1">
                      {formatCurrency(selectedCustomer.totalSpent)}
                    </p>
                  </div>
                  <div className="bg-[#F5F0EB] rounded-lg p-4">
                    <p className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 font-medium">
                      Last Order
                    </p>
                    <p className="text-xl font-light text-[#1A1A1A] mt-1">
                      {formatDate(selectedCustomer.lastOrder)}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-[#1A1A1A] mb-3 uppercase tracking-wider">
                    Addresses
                  </h4>
                  <div className="space-y-2">
                    {selectedCustomer.addresses.map((addr, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-3 bg-[#F5F0EB]/50 rounded-lg"
                      >
                        <MapPin className="w-4 h-4 text-[#7A6543] mt-0.5 shrink-0" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-[#1A1A1A]">
                              {addr.label}
                            </span>
                            {addr.isDefault && (
                              <Badge className="text-[9px] uppercase tracking-wider bg-[#C9A96E]/10 text-[#7A6543] border border-[#C9A96E]/20">
                                Default
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-[#1A1A1A]/50 font-light">
                            {addr.address}, {addr.city}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-[#1A1A1A] mb-3 uppercase tracking-wider">
                    Order History
                  </h4>
                  <div className="space-y-2">
                    {selectedCustomer.orders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-3 bg-[#F5F0EB]/50 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <ShoppingBag className="w-4 h-4 text-[#1A1A1A]/30" />
                          <div>
                            <p className="text-sm font-medium text-[#1A1A1A]">{order.id}</p>
                            <p className="text-xs text-[#1A1A1A]/40 font-light">
                              {formatDate(order.date)} · {order.items} items
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-[#7A6543]">
                            {formatCurrency(order.total)}
                          </p>
                          <Badge
                            className={cn(
                              "text-[9px] uppercase tracking-wider font-medium border",
                              statusColors[order.status]
                            )}
                          >
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-[#1A1A1A] mb-3 uppercase tracking-wider">
                    Notes
                  </h4>
                  <Textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="border-stone-200 bg-[#F5F0EB]/50 font-light text-sm min-h-[80px] focus:border-[#C9A96E] focus:ring-[#C9A96E]/20"
                    placeholder="Add notes about this customer..."
                  />
                  <Button
                    variant="outline"
                    className="mt-2 border-[#C9A96E] text-[#7A6543] hover:bg-[#C9A96E] hover:text-white font-light text-xs tracking-wide"
                    onClick={saveNotes}
                  >
                    Save Notes
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
