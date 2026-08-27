"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import {
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  X,
  Calendar,
  ArrowUpDown,
  RefreshCw,
} from "lucide-react"
import { motion } from "framer-motion"
import { cn, formatCurrency, formatDate, getOrderStatusColor, getOrderStatusLabel, getPaymentStatusColor } from "@/lib/utils"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { EmptyState } from "@/components/ui/empty-state"
import { useToast } from "@/components/ui/toast"

const statusTabs: { label: string; value: string | null }[] = [
  { label: "All", value: null },
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Processing", value: "processing" },
  { label: "Quality Check", value: "quality_check" },
  { label: "Shipped", value: "shipped" },
  { label: "Out for Delivery", value: "out_for_delivery" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
]

export default function OrdersPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { toast } = useToast()
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

  const { data: orders = [], isLoading, refetch } = useQuery({
    queryKey: ["orders", activeTab],
    queryFn: async () => {
      const statusQuery = activeTab ? `&status=${activeTab.toUpperCase()}` : ""
      const res = await api.get<{ success: boolean; data: any }>(`/orders?limit=100${statusQuery}`)
      const backendOrders = Array.isArray(res.data) ? res.data : (res.data?.orders || [])
      return backendOrders.map((o: any, index: number) => ({
        id: o.id ?? `temp-${index}`,
        orderNumber: o.orderNumber || (o.id ? o.id.slice(0, 8).toUpperCase() : `TEMP-${String(index).padStart(4, '0')}`),
        customerName: o.customer?.name || "Guest Customer",
        customerEmail: o.customer?.email || "",
        customerPhone: o.customer?.phone || "",
        itemCount: o.items?.length || 0,
        total: o.total || 0,
        paymentStatus: o.paymentStatus?.toLowerCase() || "pending",
        orderStatus: o.status?.toLowerCase() || "pending",
        createdAt: o.createdAt,
        paymentMethod: o.paymentMethod || "COD",
        shippingAddress: typeof o.shippingAddress === "object"
          ? `${o.shippingAddress.addressLine1 || ""}, ${o.shippingAddress.city || ""}`
          : o.shippingAddress || "",
        items: (o.items || []).map((item: any) => ({
          name: item.product?.name || item.name || `Product #${item.productId}`,
          quantity: item.quantity,
          unitPrice: item.price || item.unitPrice || 0,
          total: item.total || (item.quantity * item.price) || 0,
        })),
      }))
    },
  })

  const bulkStatusMutation = useMutation({
    mutationFn: async ({ ids, status }: { ids: string[]; status: string }) => {
      await Promise.all(
        ids.map((id) =>
          api.put(`/orders/${id}/status`, { status: status.toUpperCase() })
        )
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      setIsBulkStatusOpen(false)
      setSelectedOrders([])
      setBulkStatus("")
      toast("success", "Order status updated successfully.")
    },
    onError: (error: any) => {
      toast("error", error.message || "Failed to update status.")
    },
  })

  const filteredOrders = orders.filter((order: any) => {
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
    const aVal = a[sortField as keyof typeof a]
    const bVal = b[sortField as keyof typeof b]
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

  const totalPages = Math.max(1, Math.ceil(sortedOrders.length / pageSize))
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
    if (selectedOrders.length === paginatedOrders.length && paginatedOrders.length > 0) {
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
    const rows = filteredOrders.map((o: any) => [
      o.orderNumber,
      o.customerName,
      o.itemCount.toString(),
      o.total.toString(),
      o.paymentStatus,
      o.orderStatus,
      new Date(o.createdAt).toLocaleDateString(),
    ])
    const csv = [headers.join(","), ...rows.map((r: any) => r.join(","))].join("\n")
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
      confirmed: 0,
      processing: 0,
      quality_check: 0,
      shipped: 0,
      out_for_delivery: 0,
      delivered: 0,
      cancelled: 0,
    }
    orders.forEach((order: any) => {
      if (counts[order.orderStatus] !== undefined) {
        counts[order.orderStatus]++
      }
    })
    return counts
  }

  const statusCounts = getStatusCounts()

  return (
    <div className="min-h-screen p-2 md:p-6 bg-[#F5F0EB]">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-[#1A1A1A] tracking-tight">
              Orders
            </h1>
            <Badge className="bg-[#7A6543]/10 text-[#7A6543] border border-[#7A6543]/20 px-3 py-1 font-medium">
              {orders.length} total
            </Badge>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="border-[#E5DDCF] bg-white text-gray-700 hover:bg-[#F5F0EB]"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportCSV}
              className="border-[#E5DDCF] bg-white text-gray-700 hover:bg-[#F5F0EB]"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            {selectedOrders.length > 0 && (
              <Button
                size="sm"
                onClick={() => setIsBulkStatusOpen(true)}
                className="bg-[#7A6543] text-white hover:bg-[#7A6543]/90 font-medium"
              >
                Update Status ({selectedOrders.length})
              </Button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 border-b border-[#E5DDCF] overflow-x-auto pb-1">
          {statusTabs.map((tab) => {
            const count = tab.value === null ? orders.length : (statusCounts[tab.value] || 0)
            const isActive = activeTab === tab.value
            return (
              <button
                key={tab.label}
                onClick={() => {
                  setActiveTab(tab.value)
                  setCurrentPage(1)
                }}
                className={cn(
                  "px-4 py-2.5 text-sm font-medium transition-all duration-200 whitespace-nowrap border-b-2 -mb-px flex items-center gap-2",
                  isActive
                    ? "text-[#7A6543] border-[#7A6543] font-semibold"
                    : "text-gray-600 border-transparent hover:text-gray-900 hover:border-gray-300"
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-full font-normal",
                    isActive
                      ? "bg-[#7A6543]/15 text-[#7A6543]"
                      : "bg-gray-200/70 text-gray-600"
                  )}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Search and Date Filters */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search by order # or customer name..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-9 bg-white border-[#E5DDCF] text-[#1A1A1A] placeholder:text-gray-400 focus:border-[#7A6543] rounded-lg shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value)
                setCurrentPage(1)
              }}
              className="bg-white border border-[#E5DDCF] rounded-lg px-3 py-1.5 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#7A6543] shadow-sm"
            />
            <span className="text-gray-400">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value)
                setCurrentPage(1)
              }}
              className="bg-white border border-[#E5DDCF] rounded-lg px-3 py-1.5 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#7A6543] shadow-sm"
            />
            {(dateFrom || dateTo) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDateFrom("")
                  setDateTo("")
                }}
                className="text-xs text-gray-500 hover:text-gray-800"
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white border border-[#E5DDCF] rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FDFBF9] border-b border-[#E5DDCF]">
                  <th className="px-4 py-3.5 w-12 text-center">
                    <input
                      type="checkbox"
                      checked={selectedOrders.length === paginatedOrders.length && paginatedOrders.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-[#7A6543] focus:ring-[#7A6543]"
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
                      className="px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider"
                    >
                      <button
                        onClick={() => toggleSort(col.key)}
                        className="flex items-center gap-1.5 hover:text-[#7A6543] transition-colors"
                      >
                        {col.label}
                        <ArrowUpDown className="w-3 h-3 text-gray-400" />
                      </button>
                    </th>
                  ))}
                  <th className="px-4 py-3.5 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(9)].map((_, j) => (
                        <td key={j} className="px-4 py-4">
                          <div className="h-4 rounded bg-gray-100 animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : paginatedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-16 text-center">
                      <EmptyState
                        title="No orders found"
                        description="Try adjusting your filters or search query."
                      />
                    </td>
                  </tr>
                ) : (
                  paginatedOrders.map((order) => (
                    <tr
                      key={order.id}
                      className={cn(
                        "hover:bg-[#FDFBF9] transition-colors cursor-pointer",
                        selectedOrders.includes(order.id) && "bg-[#7A6543]/5"
                      )}
                      onClick={() => router.push(`/admin/orders/${order.id}`)}
                    >
                      <td className="px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(order.id)}
                          onChange={() => toggleSelectOrder(order.id)}
                          className="rounded border-gray-300 text-[#7A6543] focus:ring-[#7A6543]"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-medium text-[#7A6543] hover:underline">
                          {order.orderNumber}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-sm font-medium text-[#1A1A1A]">
                            {order.customerName}
                          </p>
                          {order.customerEmail && (
                            <p className="text-xs text-gray-500">
                              {order.customerEmail}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-600">
                          {order.itemCount} item{order.itemCount > 1 ? "s" : ""}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-medium text-[#1A1A1A]">
                          {formatCurrency(order.total)}
                        </span>
                      </td>
                      <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                        <Badge
                          className={cn(
                            "text-xs font-medium border-0 px-2.5 py-0.5 capitalize",
                            getPaymentStatusColor(order.paymentStatus)
                          )}
                        >
                          {order.paymentStatus}
                        </Badge>
                      </td>
                      <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                        <Badge
                          className={cn(
                            "text-xs font-medium border-0 px-2.5 py-0.5 capitalize",
                            getOrderStatusColor(order.orderStatus)
                          )}
                        >
                          {getOrderStatusLabel(order.orderStatus)}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-xs text-gray-500">
                          {formatDate(order.createdAt)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-8 h-8 text-gray-500 hover:text-[#7A6543] hover:bg-gray-100"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-white border-[#E5DDCF] shadow-lg text-[#1A1A1A]"
                          >
                            <DropdownMenuItem
                              onClick={() => router.push(`/admin/orders/${order.id}`)}
                              className="cursor-pointer hover:bg-[#F5F0EB]"
                            >
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedOrders([order.id])
                                setIsBulkStatusOpen(true)
                              }}
                              className="cursor-pointer hover:bg-[#F5F0EB]"
                            >
                              Update Status
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
            <p className="text-sm text-gray-600">
              Showing {(currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, sortedOrders.length)} of{" "}
              {sortedOrders.length} orders
            </p>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 border-[#E5DDCF] bg-white text-gray-600 hover:bg-[#F5F0EB] disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {[...Array(totalPages)].map((_, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(i + 1)}
                  className={cn(
                    "w-8 h-8 text-xs p-0 border-[#E5DDCF]",
                    currentPage === i + 1
                      ? "bg-[#7A6543] text-white border-[#7A6543] font-semibold"
                      : "bg-white text-gray-700 hover:bg-[#F5F0EB]"
                  )}
                >
                  {i + 1}
                </Button>
              ))}
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className="w-8 h-8 border-[#E5DDCF] bg-white text-gray-600 hover:bg-[#F5F0EB] disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Status Update Dialog */}
      <Dialog open={isBulkStatusOpen} onOpenChange={setIsBulkStatusOpen}>
        <DialogContent className="bg-white border-[#E5DDCF] text-[#1A1A1A] max-w-md rounded-xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-[#1A1A1A] font-semibold text-lg">
              Update Order Status
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <p className="text-sm text-gray-600">
              Select a new status for {selectedOrders.length} order
              {selectedOrders.length > 1 ? "s" : ""}:
            </p>
            <Select value={bulkStatus} onValueChange={setBulkStatus}>
              <SelectTrigger className="bg-white border-[#E5DDCF] text-[#1A1A1A]">
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent className="bg-white border-[#E5DDCF] text-[#1A1A1A]">
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="PROCESSING">Processing</SelectItem>
                <SelectItem value="QUALITY_CHECK">Quality Check</SelectItem>
                <SelectItem value="SHIPPED">Shipped</SelectItem>
                <SelectItem value="OUT_FOR_DELIVERY">Out for Delivery</SelectItem>
                <SelectItem value="DELIVERED">Delivered</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsBulkStatusOpen(false)
                setBulkStatus("")
              }}
              className="border-[#E5DDCF] text-gray-700 hover:bg-[#F5F0EB]"
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
              className="bg-[#7A6543] hover:bg-[#7A6543]/90 text-white font-medium px-5"
            >
              {bulkStatusMutation.isPending ? "Updating..." : "Apply Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}