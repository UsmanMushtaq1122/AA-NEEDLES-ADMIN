"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import {
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  X,
  Calendar,
  ArrowUpDown,
  Trash2,
  RefreshCw,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn, formatCurrency, formatDate, getOrderStatusColor, getOrderStatusLabel, getPaymentStatusColor } from "@/lib/utils"
import type { Order, OrderStatus, PaginatedResponse } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { StatusBadge } from "@/components/ui/status-badge"
import { Pagination } from "@/components/ui/pagination"
import { EmptyState } from "@/components/ui/empty-state"

interface MockOrder {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string
  itemCount: number
  total: number
  paymentStatus: string
  orderStatus: string
  createdAt: string
  paymentMethod: string
  shippingAddress: string
  items: {
    name: string
    quantity: number
    unitPrice: number
  }[]
}

const mockOrders: MockOrder[] = [
  {
    id: "1",
    orderNumber: "AA-2026-001",
    customerName: "Ayesha Khan",
    customerEmail: "ayesha.khan@email.com",
    customerPhone: "+92 321 1234567",
    itemCount: 3,
    total: 45500,
    paymentStatus: "paid",
    orderStatus: "delivered",
    createdAt: "2026-07-15T10:30:00Z",
    paymentMethod: "Bank Transfer",
    shippingAddress: "42-A, Gulberg III, Lahore, Punjab, Pakistan",
    items: [
      { name: "Unstitched Embroidered Lawn Suit", quantity: 1, unitPrice: 12500 },
      { name: "Silk Dupatta - Gold", quantity: 2, unitPrice: 4500 },
      { name: "Lawn Trousers - Ivory", quantity: 1, unitPrice: 3500 },
    ],
  },
  {
    id: "2",
    orderNumber: "AA-2026-002",
    customerName: "Fatima Ahmed",
    customerEmail: "fatima.ahmed@email.com",
    customerPhone: "+92 300 9876543",
    itemCount: 2,
    total: 28000,
    paymentStatus: "paid",
    orderStatus: "shipped",
    createdAt: "2026-07-16T14:20:00Z",
    paymentMethod: "COD",
    shippingAddress: "15, DHA Phase 5, Karachi, Sindh, Pakistan",
    items: [
      { name: "Pret Collection - Formal Suit", quantity: 1, unitPrice: 18000 },
      { name: "Embroidered Organza Dupatta", quantity: 1, unitPrice: 10000 },
    ],
  },
  {
    id: "3",
    orderNumber: "AA-2026-003",
    customerName: "Sana Malik",
    customerEmail: "sana.malik@email.com",
    customerPhone: "+92 311 5551234",
    itemCount: 5,
    total: 72500,
    paymentStatus: "pending",
    orderStatus: "processing",
    createdAt: "2026-07-16T16:45:00Z",
    paymentMethod: "JazzCash",
    shippingAddress: "8, Satellite Town, Rawalpindi, Punjab, Pakistan",
    items: [
      { name: "Unstitched Chiffon Collection", quantity: 2, unitPrice: 15000 },
      { name: "Velvet Shawl - Maroon", quantity: 1, unitPrice: 8500 },
      { name: "Silk Trousers", quantity: 2, unitPrice: 4500 },
    ],
  },
  {
    id: "4",
    orderNumber: "AA-2026-004",
    customerName: "Hira Raza",
    customerEmail: "hira.raza@email.com",
    customerPhone: "+92 332 7778899",
    itemCount: 1,
    total: 35000,
    paymentStatus: "paid",
    orderStatus: "processing",
    createdAt: "2026-07-17T09:10:00Z",
    paymentMethod: "Bank Transfer",
    shippingAddress: "23, Faisal Town, Islamabad, Pakistan",
    items: [
      { name: "Bridal Lehnega - Heavy Embroidered", quantity: 1, unitPrice: 35000 },
    ],
  },
  {
    id: "5",
    orderNumber: "AA-2026-005",
    customerName: "Nadia Hussain",
    customerEmail: "nadia.hussain@email.com",
    customerPhone: "+92 345 2223344",
    itemCount: 4,
    total: 56000,
    paymentStatus: "refunded",
    orderStatus: "cancelled",
    createdAt: "2026-07-17T11:30:00Z",
    paymentMethod: "Credit Card",
    shippingAddress: "7, Canal Road, Faisalabad, Punjab, Pakistan",
    items: [
      { name: "Cotton Unstitched Suit", quantity: 2, unitPrice: 8000 },
      { name: "Lawn Dupatta", quantity: 2, unitPrice: 3500 },
    ],
  },
  {
    id: "6",
    orderNumber: "AA-2026-006",
    customerName: "Zainab Ali",
    customerEmail: "zainab.ali@email.com",
    customerPhone: "+92 300 1112233",
    itemCount: 2,
    total: 19000,
    paymentStatus: "paid",
    orderStatus: "pending",
    createdAt: "2026-07-18T08:15:00Z",
    paymentMethod: "COD",
    shippingAddress: "56, Model Town, Lahore, Punjab, Pakistan",
    items: [
      { name: "Pret Kurti - Embroidered", quantity: 1, unitPrice: 9500 },
      { name: "Cotton Trousers", quantity: 1, unitPrice: 3500 },
    ],
  },
  {
    id: "7",
    orderNumber: "AA-2026-007",
    customerName: "Mehreen Shah",
    customerEmail: "mehreen.shah@email.com",
    customerPhone: "+92 321 4445566",
    itemCount: 3,
    total: 41500,
    paymentStatus: "paid",
    orderStatus: "shipped",
    createdAt: "2026-07-15T13:00:00Z",
    paymentMethod: "EasyPaisa",
    shippingAddress: "12, Clifton, Karachi, Sindh, Pakistan",
    items: [
      { name: "Karandi Winter Suit", quantity: 1, unitPrice: 16000 },
      { name: "Pashmina Shawl", quantity: 1, unitPrice: 12500 },
      { name: "Silk Inner", quantity: 1, unitPrice: 3000 },
    ],
  },
  {
    id: "8",
    orderNumber: "AA-2026-008",
    customerName: "Rabia Noor",
    customerEmail: "rabia.noor@email.com",
    customerPhone: "+92 333 6667788",
    itemCount: 1,
    total: 8500,
    paymentStatus: "pending",
    orderStatus: "pending",
    createdAt: "2026-07-18T09:45:00Z",
    paymentMethod: "COD",
    shippingAddress: "34, Johar Town, Lahore, Punjab, Pakistan",
    items: [
      { name: "Designer Clutch - Gold", quantity: 1, unitPrice: 8500 },
    ],
  },
  {
    id: "9",
    orderNumber: "AA-2026-009",
    customerName: "Asma Bibi",
    customerEmail: "asma.bibi@email.com",
    customerPhone: "+92 312 8889900",
    itemCount: 2,
    total: 24000,
    paymentStatus: "paid",
    orderStatus: "delivered",
    createdAt: "2026-07-14T10:00:00Z",
    paymentMethod: "Bank Transfer",
    shippingAddress: "89, Gulshan-e-Iqbal, Karachi, Sindh, Pakistan",
    items: [
      { name: "Raw Fabric - Silk (5 yards)", quantity: 1, unitPrice: 15000 },
      { name: "Georgette Fabric (3 yards)", quantity: 1, unitPrice: 9000 },
    ],
  },
  {
    id: "10",
    orderNumber: "AA-2026-010",
    customerName: "Iqra Javed",
    customerEmail: "iqra.javed@email.com",
    customerPhone: "+92 346 1122334",
    itemCount: 6,
    total: 95000,
    paymentStatus: "paid",
    orderStatus: "delivered",
    createdAt: "2026-07-13T15:20:00Z",
    paymentMethod: "Bank Transfer",
    shippingAddress: "5, Wapda Town, Lahore, Punjab, Pakistan",
    items: [
      { name: "Bridal Collection - Heavy Suit", quantity: 1, unitPrice: 35000 },
      { name: "Embroidered Dupatta", quantity: 2, unitPrice: 12000 },
      { name: "Jewelry Set", quantity: 1, unitPrice: 18000 },
      { name: "Clutch", quantity: 1, unitPrice: 8000 },
      { name: "Trousers", quantity: 1, unitPrice: 5000 },
    ],
  },
]

const statusTabs: { label: string; value: string | null }[] = [
  { label: "All", value: null },
  { label: "Pending", value: "pending" },
  { label: "Processing", value: "processing" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
]

export default function OrdersPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(8)
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [isBulkStatusOpen, setIsBulkStatusOpen] = useState(false)
  const [bulkStatus, setBulkStatus] = useState<string>("")
  const [sortField, setSortField] = useState<string>("createdAt")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  const { data: orders = mockOrders, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 500))
      return mockOrders
    },
  })

  const bulkStatusMutation = useMutation({
    mutationFn: async ({ ids, status }: { ids: string[]; status: string }) => {
      await new Promise((resolve) => setTimeout(resolve, 800))
      return { ids, status }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      setIsBulkStatusOpen(false)
      setSelectedOrders([])
      setBulkStatus("")
    },
  })

  const filteredOrders = orders.filter((order) => {
    if (activeTab && order.orderStatus !== activeTab) return false
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      if (
        !order.orderNumber.toLowerCase().includes(query) &&
        !order.customerName.toLowerCase().includes(query)
      ) {
        return false
      }
    }
    if (dateFrom && new Date(order.createdAt) < new Date(dateFrom)) return false
    if (dateTo && new Date(order.createdAt) > new Date(dateTo)) return false
    return true
  })

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const aVal = a[sortField as keyof MockOrder]
    const bVal = b[sortField as keyof MockOrder]
    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortDirection === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal)
    }
    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortDirection === "asc" ? aVal - bVal : bVal - aVal
    }
    return 0
  })

  const totalPages = Math.ceil(sortedOrders.length / pageSize)
  const paginatedOrders = sortedOrders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const toggleSelectOrder = (id: string) => {
    setSelectedOrders((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedOrders.length === paginatedOrders.length) {
      setSelectedOrders([])
    } else {
      setSelectedOrders(paginatedOrders.map((o) => o.id))
    }
  }

  const exportCSV = () => {
    const headers = [
      "Order #",
      "Customer",
      "Items",
      "Total",
      "Payment Status",
      "Order Status",
      "Date",
    ]
    const rows = filteredOrders.map((o) => [
      o.orderNumber,
      o.customerName,
      o.itemCount.toString(),
      o.total.toString(),
      o.paymentStatus,
      o.orderStatus,
      new Date(o.createdAt).toLocaleDateString(),
    ])
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `orders-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getStatusCounts = () => {
    const counts: Record<string, number> = {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    }
    orders.forEach((order) => {
      if (counts[order.orderStatus] !== undefined) {
        counts[order.orderStatus]++
      }
    })
    return counts
  }

  const statusCounts = getStatusCounts()

  return (
    <div className="min-h-screen bg-[#1A1A1A] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-light text-[#F5F0EB] tracking-wide">
              Orders
            </h1>
            <Badge className="bg-[#C9A96E]/20 text-[#C9A96E] border-0 px-3 py-1 font-normal">
              {orders.length} total
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={exportCSV}
              className="text-[#F5F0EB]/60 hover:text-[#C9A96E] hover:bg-[#C9A96E]/10"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            {selectedOrders.length > 0 && (
              <Button
                size="sm"
                onClick={() => setIsBulkStatusOpen(true)}
                className="bg-[#C9A96E]/20 text-[#C9A96E] hover:bg-[#C9A96E]/30 border border-[#C9A96E]/30"
              >
                Update Status ({selectedOrders.length})
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 mb-6 border-b border-[#F5F0EB]/10 overflow-x-auto">
          {statusTabs.map((tab) => (
            <button
              key={tab.label}
              onClick={() => {
                setActiveTab(tab.value)
                setCurrentPage(1)
              }}
              className={cn(
                "px-4 py-3 text-sm font-medium transition-all duration-200 whitespace-nowrap border-b-2 -mb-px",
                activeTab === tab.value
                  ? "text-[#C9A96E] border-[#C9A96E]"
                  : "text-[#F5F0EB]/40 border-transparent hover:text-[#F5F0EB]/60"
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "ml-2 text-xs px-1.5 py-0.5 rounded-full",
                  activeTab === tab.value
                    ? "bg-[#C9A96E]/20 text-[#C9A96E]"
                    : "bg-[#F5F0EB]/5 text-[#F5F0EB]/30"
                )}
              >
                {tab.value === null
                  ? orders.length
                  : statusCounts[tab.value] || 0}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#F5F0EB]/30" />
            <Input
              placeholder="Search by order # or customer name..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-9 bg-[#F5F0EB]/5 border-[#F5F0EB]/10 text-[#F5F0EB] placeholder:text-[#F5F0EB]/30 focus:border-[#C9A96E]/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#F5F0EB]/30 hover:text-[#F5F0EB]/60"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#F5F0EB]/30" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value)
                setCurrentPage(1)
              }}
              className="bg-[#F5F0EB]/5 border border-[#F5F0EB]/10 rounded-md px-3 py-2 text-sm text-[#F5F0EB] focus:outline-none focus:border-[#C9A96E]/50 [color-scheme:dark]"
            />
            <span className="text-[#F5F0EB]/20">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value)
                setCurrentPage(1)
              }}
              className="bg-[#F5F0EB]/5 border border-[#F5F0EB]/10 rounded-md px-3 py-2 text-sm text-[#F5F0EB] focus:outline-none focus:border-[#C9A96E]/50 [color-scheme:dark]"
            />
          </div>
        </div>

        <div className="border border-[#F5F0EB]/10 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F5F0EB]/5 border-b border-[#F5F0EB]/10">
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedOrders.length === paginatedOrders.length && paginatedOrders.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-[#F5F0EB]/20 bg-transparent accent-[#C9A96E]"
                    />
                  </th>
                  {[
                    { key: "orderNumber", label: "Order #" },
                    { key: "customerName", label: "Customer" },
                    { key: "itemCount", label: "Items" },
                    { key: "total", label: "Total" },
                    { key: "paymentStatus", label: "Payment" },
                    { key: "orderStatus", label: "Status" },
                    { key: "createdAt", label: "Date" },
                  ].map((col) => (
                    <th
                      key={col.key}
                      className="px-4 py-3 text-left text-xs font-medium text-[#F5F0EB]/40 uppercase tracking-wider"
                    >
                      <button
                        onClick={() => toggleSort(col.key)}
                        className="flex items-center gap-1 hover:text-[#F5F0EB]/60 transition-colors"
                      >
                        {col.label}
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right">
                    <span className="text-xs font-medium text-[#F5F0EB]/40 uppercase tracking-wider">
                      Actions
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F0EB]/5">
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(9)].map((_, j) => (
                        <td key={j} className="px-4 py-4">
                          <div className="h-4 rounded bg-[#F5F0EB]/5 animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : paginatedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-16">
                      <EmptyState
                        title="No orders found"
                        description="Try adjusting your filters or search query."
                      />
                    </td>
                  </tr>
                ) : (
                  paginatedOrders.map((order) => (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={cn(
                        "hover:bg-[#F5F0EB]/[0.02] transition-colors cursor-pointer",
                        selectedOrders.includes(order.id) && "bg-[#C9A96E]/[0.03]"
                      )}
                      onClick={() => router.push(`/admin/orders/${order.id}`)}
                    >
                      <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(order.id)}
                          onChange={() => toggleSelectOrder(order.id)}
                          className="rounded border-[#F5F0EB]/20 bg-transparent accent-[#C9A96E]"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-medium text-[#C9A96E]">
                          {order.orderNumber}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <span className="text-sm text-[#F5F0EB]">
                            {order.customerName}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-[#F5F0EB]/60">
                          {order.itemCount} items
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-medium text-[#F5F0EB]">
                          {formatCurrency(order.total)}
                        </span>
                      </td>
                      <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                        <Badge
                          className={cn(
                            "text-xs font-normal border-0",
                            getPaymentStatusColor(order.paymentStatus)
                          )}
                        >
                          {order.paymentStatus}
                        </Badge>
                      </td>
                      <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                        <Badge
                          className={cn(
                            "text-xs font-normal border-0",
                            getOrderStatusColor(order.orderStatus)
                          )}
                        >
                          {getOrderStatusLabel(order.orderStatus)}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-[#F5F0EB]/40">
                          {formatDate(order.createdAt)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-8 h-8 text-[#F5F0EB]/50 hover:text-[#C9A96E]"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-[#2A2A2A] border-[#F5F0EB]/10"
                          >
                            <DropdownMenuItem
                              onClick={() => router.push(`/admin/orders/${order.id}`)}
                              className="text-[#F5F0EB] hover:bg-[#F5F0EB]/5 focus:bg-[#F5F0EB]/5"
                            >
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-[#F5F0EB] hover:bg-[#F5F0EB]/5 focus:bg-[#F5F0EB]/5">
                              Update Status
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-[#F5F0EB] hover:bg-[#F5F0EB]/5 focus:bg-[#F5F0EB]/5">
                              Print Invoice
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-[#F5F0EB]/40">
              Showing {(currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, sortedOrders.length)} of{" "}
              {sortedOrders.length} orders
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="w-9 h-9 text-[#F5F0EB]/50 hover:text-[#C9A96E] disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {[...Array(totalPages)].map((_, i) => (
                <Button
                  key={i}
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentPage(i + 1)}
                  className={cn(
                    "w-9 h-9 text-sm",
                    currentPage === i + 1
                      ? "bg-[#C9A96E]/20 text-[#C9A96E]"
                      : "text-[#F5F0EB]/50 hover:text-[#C9A96E]"
                  )}
                >
                  {i + 1}
                </Button>
              ))}
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className="w-9 h-9 text-[#F5F0EB]/50 hover:text-[#C9A96E] disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={isBulkStatusOpen} onOpenChange={setIsBulkStatusOpen}>
        <DialogContent className="bg-[#2A2A2A] border-[#F5F0EB]/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#F5F0EB] font-light tracking-wide">
              Update Order Status
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-[#F5F0EB]/60 mb-4">
              Update status for {selectedOrders.length} selected order
              {selectedOrders.length > 1 ? "s" : ""}
            </p>
            <Select value={bulkStatus} onValueChange={setBulkStatus}>
              <SelectTrigger className="bg-[#F5F0EB]/5 border-[#F5F0EB]/10 text-[#F5F0EB]">
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">
                  Pending
                </SelectItem>
                <SelectItem value="processing">
                  Processing
                </SelectItem>
                <SelectItem value="shipped">
                  Shipped
                </SelectItem>
                <SelectItem value="delivered">
                  Delivered
                </SelectItem>
                <SelectItem value="cancelled">
                  Cancelled
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setIsBulkStatusOpen(false)
                setBulkStatus("")
              }}
              className="text-[#F5F0EB]/60 hover:text-[#F5F0EB] hover:bg-[#F5F0EB]/5"
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                bulkStatusMutation.mutate({
                  ids: selectedOrders,
                  status: bulkStatus,
                })
              }
              disabled={!bulkStatus || bulkStatusMutation.isPending}
              className="bg-[#C9A96E] hover:bg-[#C9A96E]/90 text-[#1A1A1A] font-medium px-6"
            >
              {bulkStatusMutation.isPending ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}