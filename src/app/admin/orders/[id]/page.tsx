"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter, useParams } from "next/navigation"
import {
  ArrowLeft,
  Printer,
  Save,
  Package,
  CreditCard,
  MapPin,
  User,
  Mail,
  Phone,
  Clock,
  Truck,
  FileText,
} from "lucide-react"
import { motion } from "framer-motion"
import {
  cn,
  formatCurrency,
  formatDate,
  getOrderStatusColor,
  getOrderStatusLabel,
  getPaymentStatusColor,
} from "@/lib/utils"
import { api } from "@/lib/api"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/toast"
import StatusTimeline from "@/components/orders/status-timeline"

export default function OrderDetailPage() {
  const router = useRouter()
  const params = useParams()
  const orderId = params?.id as string
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [newStatus, setNewStatus] = useState("")
  const [internalNotes, setInternalNotes] = useState<string | null>(null)
  const [trackingNumber, setTrackingNumber] = useState<string | null>(null)

  const { data: rawOrder, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const res = await api.get<any>(`/orders/${orderId}`)
      return res.data || null
    },
    enabled: !!orderId,
  })

  const order = rawOrder
    ? {
        id: rawOrder.id,
        orderNumber: rawOrder.orderNumber || rawOrder.id.slice(0, 8).toUpperCase(),
        customerName: rawOrder.customer?.name || "Guest Customer",
        customerEmail: rawOrder.customer?.email || "",
        customerPhone: rawOrder.customer?.phone || "",
        paymentMethod: rawOrder.paymentMethod || "COD",
        paymentStatus: rawOrder.paymentStatus?.toLowerCase() || "pending",
        orderStatus: rawOrder.status?.toLowerCase() || "pending",
        createdAt: rawOrder.createdAt,
        shippingAddress:
          typeof rawOrder.shippingAddress === "object"
            ? `${rawOrder.shippingAddress.addressLine1 || ""}, ${rawOrder.shippingAddress.city || ""}`
            : rawOrder.shippingAddress || "",
        subtotal: rawOrder.subtotal || 0,
        shipping: rawOrder.shippingCost || 0,
        discount: rawOrder.discount || 0,
        codFee: rawOrder.codFee || 0,
        total: rawOrder.total || 0,
        internalNotes: rawOrder.internalNotes || "",
        trackingNumber: rawOrder.trackingNumber || "",
        statusHistory: rawOrder.statusHistory || [],
        items: (rawOrder.items || []).map((item: any) => ({
          name: item.product?.name || item.name || `Product #${item.productId}`,
          quantity: item.quantity,
          unitPrice: item.price || item.unitPrice || 0,
          total: item.total || item.quantity * (item.price || 0) || 0,
        })),
      }
    : null

  const statusMutation = useMutation({
    mutationFn: async ({ status }: { status: string }) => {
      await api.put(`/orders/${orderId}/status`, { status: status.toUpperCase() })
      return status
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", orderId] })
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      setNewStatus("")
      toast("success", "Order status updated successfully.")
    },
    onError: (error: any) => {
      toast("error", error.message || "Failed to update order status.")
    },
  })

  const notesMutation = useMutation({
    mutationFn: async ({ notes }: { notes: string }) => {
      await api.put(`/orders/${orderId}/notes`, { notes })
      return notes
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", orderId] })
      toast("success", "Internal notes saved successfully.")
    },
    onError: (error: any) => {
      toast("error", error.message || "Failed to save internal notes.")
    },
  })

  const trackingMutation = useMutation({
    mutationFn: async ({ tracking }: { tracking: string }) => {
      await api.put(`/orders/${orderId}/tracking`, {
        carrier: "Standard Shipping",
        trackingNumber: tracking,
      })
      return tracking
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", orderId] })
      toast("success", "Tracking number saved successfully.")
    },
    onError: (error: any) => {
      toast("error", error.message || "Failed to save tracking number.")
    },
  })

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 bg-[#F5F0EB]">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-10 w-48 bg-gray-200 animate-pulse rounded-lg" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-white animate-pulse rounded-xl border border-[#E5DDCF]" />
              <div className="h-48 bg-white animate-pulse rounded-xl border border-[#E5DDCF]" />
            </div>
            <div className="space-y-6">
              <div className="h-40 bg-white animate-pulse rounded-xl border border-[#E5DDCF]" />
              <div className="h-32 bg-white animate-pulse rounded-xl border border-[#E5DDCF]" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!order) return null

  const activeNotes = internalNotes !== null ? internalNotes : order.internalNotes
  const activeTracking = trackingNumber !== null ? trackingNumber : order.trackingNumber

  return (
    <div className="min-h-screen p-4 md:p-6 bg-[#F5F0EB]">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push("/admin/orders")}
              className="border-[#E5DDCF] bg-white text-gray-700 hover:bg-[#F5F0EB]"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold text-[#1A1A1A] tracking-tight">
                  {order.orderNumber}
                </h1>
                <Badge
                  className={cn(
                    "text-xs font-medium border-0 px-2.5 py-0.5 capitalize",
                    getOrderStatusColor(order.orderStatus)
                  )}
                >
                  {getOrderStatusLabel(order.orderStatus)}
                </Badge>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="border-[#E5DDCF] bg-white text-gray-700 hover:bg-[#F5F0EB]"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print Invoice
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-[#E5DDCF] bg-white rounded-xl p-5 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#E5DDCF]">
                <CreditCard className="w-5 h-5 text-[#7A6543]" />
                <h2 className="text-sm font-semibold text-[#1A1A1A] uppercase tracking-wider">
                  Order Information
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Order Number</p>
                  <p className="text-sm text-[#7A6543] font-semibold">
                    {order.orderNumber}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Date</p>
                  <p className="text-sm text-[#1A1A1A] font-medium">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Payment Method</p>
                  <p className="text-sm text-[#1A1A1A] font-medium">
                    {order.paymentMethod}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Payment Status</p>
                  <Badge
                    className={cn(
                      "text-xs font-medium border-0 px-2.5 py-0.5 capitalize",
                      getPaymentStatusColor(order.paymentStatus)
                    )}
                  >
                    {order.paymentStatus}
                  </Badge>
                </div>
              </div>
            </motion.div>

            {/* Items */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="border border-[#E5DDCF] bg-white rounded-xl p-5 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#E5DDCF]">
                <Package className="w-5 h-5 text-[#7A6543]" />
                <h2 className="text-sm font-semibold text-[#1A1A1A] uppercase tracking-wider">
                  Order Items
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E5DDCF]">
                      <th className="py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="py-2.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-20">
                        Qty
                      </th>
                      <th className="py-2.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">
                        Unit Price
                      </th>
                      <th className="py-2.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {order.items.map((item: any, index: number) => (
                      <tr key={index}>
                        <td className="py-3">
                          <span className="text-sm font-medium text-[#1A1A1A]">
                            {item.name}
                          </span>
                        </td>
                        <td className="py-3 text-center">
                          <span className="text-sm text-gray-600">
                            {item.quantity}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <span className="text-sm text-gray-600">
                            {formatCurrency(item.unitPrice)}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <span className="text-sm font-medium text-[#1A1A1A]">
                            {formatCurrency(item.total)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Calculation Breakdown */}
              <div className="mt-4 pt-4 border-t border-[#E5DDCF] space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-[#1A1A1A]">
                    {formatCurrency(order.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span className="text-[#1A1A1A]">
                    {formatCurrency(order.shipping)}
                  </span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Discount</span>
                    <span className="text-emerald-600 font-medium">
                      -{formatCurrency(order.discount)}
                    </span>
                  </div>
                )}
                {order.codFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">COD Fee</span>
                    <span className="text-[#1A1A1A]">
                      {formatCurrency(order.codFee)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-base font-semibold pt-3 border-t border-[#E5DDCF]">
                  <span className="text-[#1A1A1A]">Total</span>
                  <span className="text-[#7A6543]">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Customer Details */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="border border-[#E5DDCF] bg-white rounded-xl p-5 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#E5DDCF]">
                <User className="w-5 h-5 text-[#7A6543]" />
                <h2 className="text-sm font-semibold text-[#1A1A1A] uppercase tracking-wider">
                  Customer
                </h2>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 text-[#1A1A1A] font-medium">
                  <User className="w-4 h-4 text-gray-400" />
                  <span>{order.customerName}</span>
                </div>
                {order.customerEmail && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{order.customerEmail}</span>
                  </div>
                )}
                {order.customerPhone && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{order.customerPhone}</span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Shipping Address */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="border border-[#E5DDCF] bg-white rounded-xl p-5 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#E5DDCF]">
                <MapPin className="w-5 h-5 text-[#7A6543]" />
                <h2 className="text-sm font-semibold text-[#1A1A1A] uppercase tracking-wider">
                  Shipping Address
                </h2>
              </div>
              <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
                {order.shippingAddress || "No shipping address provided."}
              </p>
            </motion.div>

            {/* Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="border border-[#E5DDCF] bg-white rounded-xl p-5 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#E5DDCF]">
                <Clock className="w-5 h-5 text-[#7A6543]" />
                <h2 className="text-sm font-semibold text-[#1A1A1A] uppercase tracking-wider">
                  Order Timeline
                </h2>
              </div>
              <StatusTimeline
                statusHistory={order.statusHistory}
                currentStatus={order.orderStatus}
              />
            </motion.div>

            {/* Update Status */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="border border-[#E5DDCF] bg-white rounded-xl p-5 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#E5DDCF]">
                <Truck className="w-5 h-5 text-[#7A6543]" />
                <h2 className="text-sm font-semibold text-[#1A1A1A] uppercase tracking-wider">
                  Update Status
                </h2>
              </div>
              <div className="space-y-3">
                <Select value={newStatus} onValueChange={setNewStatus}>
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
                <Button
                  onClick={() => statusMutation.mutate({ status: newStatus })}
                  disabled={!newStatus || statusMutation.isPending}
                  className="w-full bg-[#7A6543] hover:bg-[#7A6543]/90 text-white font-medium"
                >
                  {statusMutation.isPending ? "Updating..." : "Update Status"}
                </Button>
              </div>
            </motion.div>

            {/* Internal Notes */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="border border-[#E5DDCF] bg-white rounded-xl p-5 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#E5DDCF]">
                <FileText className="w-5 h-5 text-[#7A6543]" />
                <h2 className="text-sm font-semibold text-[#1A1A1A] uppercase tracking-wider">
                  Internal Notes
                </h2>
              </div>
              <Textarea
                value={activeNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="Add internal notes about this order..."
                rows={4}
                className="bg-white border-[#E5DDCF] text-[#1A1A1A] placeholder:text-gray-400 focus:border-[#7A6543] resize-none mb-3"
              />
              <Button
                onClick={() => notesMutation.mutate({ notes: activeNotes })}
                disabled={notesMutation.isPending}
                variant="outline"
                className="w-full border-[#E5DDCF] text-[#1A1A1A] hover:bg-[#F5F0EB]"
              >
                <Save className="w-4 h-4 mr-2" />
                {notesMutation.isPending ? "Saving..." : "Save Notes"}
              </Button>
            </motion.div>

            {/* Tracking Number */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="border border-[#E5DDCF] bg-white rounded-xl p-5 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#E5DDCF]">
                <Truck className="w-5 h-5 text-[#7A6543]" />
                <h2 className="text-sm font-semibold text-[#1A1A1A] uppercase tracking-wider">
                  Tracking Number
                </h2>
              </div>
              <Input
                value={activeTracking}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number"
                className="bg-white border-[#E5DDCF] text-[#1A1A1A] placeholder:text-gray-400 focus:border-[#7A6543] mb-3"
              />
              <Button
                onClick={() => trackingMutation.mutate({ tracking: activeTracking })}
                disabled={trackingMutation.isPending}
                variant="outline"
                className="w-full border-[#E5DDCF] text-[#1A1A1A] hover:bg-[#F5F0EB]"
              >
                <Save className="w-4 h-4 mr-2" />
                {trackingMutation.isPending ? "Saving..." : "Save Tracking"}
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}