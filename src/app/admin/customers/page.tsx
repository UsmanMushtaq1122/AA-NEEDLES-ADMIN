"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Download,
  Phone,
  Mail,
  MapPin,
  ShoppingBag,
  Eye,
  MoreHorizontal,
  User,
  ToggleLeft,
  ToggleRight,
  ArrowUpDown,
  Trash2,
} from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
  emailVerified?: boolean;
  joinedDate: string;
  addresses: { label: string; address: string; city: string; isDefault: boolean }[];
  orders: { id: string; date: string; total: number; status: string; items: number }[];
  notes: string;
  tier: "gold" | "silver" | "platinum";
}

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
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    api.get<any>("/customers")
      .then((res) => setCustomers(res.data?.customers || []))
      .catch(() => setCustomers([]))
      .finally(() => setLoading(false));
  }, []);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [sortField, setSortField] = useState<"name" | "totalSpent" | "totalOrders" | "lastOrder">("lastOrder");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [editNotes, setEditNotes] = useState("");
  const [deletingCustomerId, setDeletingCustomerId] = useState<string | null>(null);
  const { toast } = useToast();

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

  const toggleCustomerStatus = async (id: string) => {
    const customer = customers.find((c) => c.id === id);
    if (!customer) return;
    const newStatus = customer.status === "active" ? "inactive" : "active";
    try {
      await api.put(`/customers/${id}`, { status: newStatus });
      setCustomers((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
      );
    } catch {}
  };

  const manuallyVerifyCustomer = async (id: string) => {
    try {
      await api.post(`/customers/${id}/verify-email`, {});
      setCustomers((prev) =>
        prev.map((c) => (c.id === id ? { ...c, emailVerified: true } : c))
      );
      if (selectedCustomer?.id === id) {
        setSelectedCustomer((prev) => prev ? { ...prev, emailVerified: true } : null);
      }
    } catch {}
  };

  const deleteCustomer = async (customer: Customer) => {
    if (!window.confirm(`Delete customer "${customer.name}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingCustomerId(customer.id);
    try {
      await api.delete(`/customers/${customer.id}`);
      setCustomers((prev) => prev.filter((c) => c.id !== customer.id));
      if (selectedCustomer?.id === customer.id) {
        setSelectedCustomer(null);
        setDetailOpen(false);
      }
      toast("success", "Customer deleted successfully");
    } catch (error) {
      toast("error", error instanceof Error ? error.message : "Failed to delete customer");
    } finally {
      setDeletingCustomerId(null);
    }
  };

  const openDetail = (customer: Customer) => {
    setSelectedCustomer(customer);
    setEditNotes(customer.notes);
    setDetailOpen(true);
  };

  const saveNotes = async () => {
    if (selectedCustomer) {
      try {
        await api.put(`/customers/${selectedCustomer.id}`, { notes: editNotes });
        setCustomers((prev) =>
          prev.map((c) => (c.id === selectedCustomer.id ? { ...c, notes: editNotes } : c))
        );
      } catch {}
    }
  };

  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const activeCount = customers.filter((c) => c.status === "active").length;
  const avgSpent = totalRevenue / customers.length;

  return (
    <div className="min-h-screen bg-[#F5F0EB]">
      <div className="w-full max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between sm:mb-8">
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
              className="w-full sm:w-auto border-[#C9A96E] text-[#7A6543] hover:bg-[#C9A96E] hover:text-white font-light tracking-wide"
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
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col gap-3 mb-6 lg:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A1A1A]/30" />
                  <Input
                    placeholder="Search by name, email, or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-stone-200 bg-[#F5F0EB]/50 font-light focus:border-[#C9A96E] focus:ring-[#C9A96E]/20"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 lg:flex">
                  {(["all", "active", "inactive"] as const).map((status) => (
                    <Button
                      key={status}
                      variant={statusFilter === status ? "default" : "outline"}
                      className={cn(
                        "w-full font-light tracking-wide text-xs uppercase",
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

              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <Table className="min-w-[900px]">
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
                            <DropdownMenuContent
                              align="end"
                              portal
                              className="bg-white border-stone-100"
                            >
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
                              {!customer.emailVerified && (
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    manuallyVerifyCustomer(customer.id);
                                  }}
                                  className="font-light text-sm cursor-pointer text-[#7A6543]"
                                >
                                  Manually Verify OTP/Email
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  void deleteCustomer(customer);
                                }}
                                disabled={deletingCustomerId === customer.id}
                                destructive
                                className="font-light text-sm cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                {deletingCustomerId === customer.id ? "Deleting..." : "Delete Customer"}
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
        <DialogContent className="max-w-3xl max-h-[calc(100vh-2rem)] overflow-y-auto rounded-lg bg-white border-0 p-4 sm:max-h-[90vh] sm:rounded-xl sm:p-6">
          {selectedCustomer && (
            <>
              <DialogHeader className="pr-10">
                <DialogTitle className="text-xl font-light tracking-wide text-[#1A1A1A]">
                  Customer Details
                </DialogTitle>
              </DialogHeader>
              <DialogClose
                onClick={() => setDetailOpen(false)}
                aria-label="Close customer details"
                className="right-3 top-3 h-9 w-9 flex items-center justify-center rounded-full bg-[#F5F0EB] text-[#7A6543] hover:bg-[#C9A96E] hover:text-white sm:right-4 sm:top-4"
              />

              <div className="space-y-6 sm:space-y-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
                  <div className="flex items-start gap-3 sm:contents">
                    <div className="w-14 h-14 rounded-full bg-[#1A1A1A] flex items-center justify-center text-white text-lg font-light tracking-wider shrink-0 sm:w-16 sm:h-16">
                    {selectedCustomer.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-medium text-[#1A1A1A] truncate">
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
                    <div className="flex flex-col gap-1 text-sm text-[#1A1A1A]/50 font-light sm:flex-row sm:items-center sm:gap-4">
                      <span className="flex items-center gap-1 min-w-0">
                        <Mail className="w-3.5 h-3.5" />
                        <span className="truncate">{selectedCustomer.email}</span>
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
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-start">
                    <span className="text-xs text-[#1A1A1A]/40 font-light">Active</span>
                    <Switch
                      checked={selectedCustomer.status === "active"}
                      onCheckedChange={() => toggleCustomerStatus(selectedCustomer.id)}
                    />
                  </div>
                </div>

                <Separator className="bg-stone-100" />

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
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
                        className="flex flex-col items-start gap-3 p-3 bg-[#F5F0EB]/50 rounded-lg sm:flex-row sm:items-center sm:justify-between"
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
                        <div className="text-left sm:text-right">
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
