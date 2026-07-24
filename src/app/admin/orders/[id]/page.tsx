"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
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
import type { OrderStatus } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { StatusBadge } from "@/components/ui/status-badge"
import StatusTimeline from "@/components/orders/status-timeline"

interface OrderDetail {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string
  paymentMethod: string
  paymentStatus: string
  orderStatus: string
  createdAt: string
  shippingAddress: string
  subtotal: number
  shipping: number
  discount: number
  codFee: number
  total: number
  trackingNumber: string
  internalNotes: string
  items: {
    name: string
    quantity: number
    unitPrice: number
    total: number
  }[]
  statusHistory: {
    status: string
    timestamp: string
    note?: string
  }[]
}

const mockOrderDetail: OrderDetail = {
  id: "1",
  orderNumber: "AA-2026-001",
  customerName: "Ayesha Khan",
  customerEmail: "ayesha.khan@email.com",
  customerPhone: "+92 321 1234567",
  paymentMethod: "Bank Transfer",
  paymentStatus: "paid",
  orderStatus: "delivered",
  createdAt: "2026-07-15T10:30:00Z",
  shippingAddress:
    "House #42-A, Street 12, Gulberg III,\nLahore, Punjab 54660\nPakistan",
  subtotal: 45000,
  shipping: 500,
  discount: 0,
  codFee: 0,
  total: 45500,
  trackingNumber: "TCS-9876543210",
  internalNotes: "Customer requested gift wrapping. Express delivery.",
  items: [
    {
      name: "Unstitched Embroidered Lawn Suit - Summer Collection",
      quantity: 1,
      unitPrice: 12500,
      total: 12500,
    },
    {
      name: "Silk Dupatta - Gold",
      quantity: 2,
      unitPrice: 4500,
      total: 9000,
    },
    {
      name: "Lawn Trousers - Ivory",
      quantity: 1,
      unitPrice: 3500,
      total: 3500,
    },
  ],
  statusHistory: [
    {
      status: "pending",
      timestamp: "2026-07-15T10:30:00Z",
      note: "Order placed successfully",
    },
    {
      status: "processing",
      timestamp: "2026-07-15T14:15:00Z",
      note: "Payment confirmed via bank transfer",
    },
    {
      status: "processing",
      timestamp: "2026-07-16T09:00:00Z",
      note: "Items picked from warehouse",
    },
    {
      status: "shipped",
      timestamp: "2026-07-16T16:30:00Z",
      note: "Shipped via TCS - Tracking: TCS-9876543210",
    },
    {
      status: "delivered",
      timestamp: "2026-07-18T11:45:00Z",
      note: "Delivered to customer",
    },
  ],
}

export default function OrderDetailPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [newStatus, setNewStatus] = useState("")
  const [internalNotes, setInternalNotes] = useState("")
  const [trackingNumber, setTrackingNumber] = useState("")

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", "1"],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 500))
      return mockOrderDetail
    },
  })

  const statusMutation = useMutation({
    mutationFn: async ({ status }: { status: string }) => {
      await new Promise((resolve) => setTimeout(resolve, 800))
      return status
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", "1"] })
      setNewStatus("")
    },
  })

  const notesMutation = useMutation({
    mutationFn: async ({ notes }: { notes: string }) => {
      await new Promise((resolve) => setTimeout(resolve, 500))
      return notes
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", "1"] })
    },
  })

  const trackingMutation = useMutation({
    mutationFn: async ({ tracking }: { tracking: string }) => {
      await new Promise((resolve) => setTimeout(resolve, 500))
      return tracking
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", "1"] })
    },
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-6">
            <div className="h-10 w-48 bg-[#F5F0EB]/5 animate-pulse rounded" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-[#F5F0EB]/5 animate-pulse rounded-lg" />
                <div className="h-48 bg-[#F5F0EB]/5 animate-pulse rounded-lg" />
              </div>
              <div className="space-y-6">
                <div className="h-40 bg-[#F5F0EB]/5 animate-pulse rounded-lg" />
                <div className="h-32 bg-[#F5F0EB]/5 animate-pulse rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!order) return null

  return (
    <div className="min-h-screen bg-[#1A1A1A] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/admin/orders")}
              className="text-[#F5F0EB]/50 hover:text-[#C9A96E]"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-light text-[#F5F0EB] tracking-wide">
                {order.orderNumber}
              </h1>
              <p className="text-sm text-[#F5F0EB]/40 mt-1">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={() => window.print()}
            className="text-[#F5F0EB]/60 hover:text-[#C9A96E] hover:bg-[#C9A96E]/10"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print Invoice
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-[#F5F0EB]/10 bg-[#1A1A1A] rounded-lg p-5"
            >
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#F5F0EB]/10">
                <CreditCard className="w-5 h-5 text-[#C9A96E]" />
                <h2 className="text-sm font-medium text-[#F5F0EB] uppercase tracking-wider">
                  Order Information
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[#F5F0EB]/40 mb-1">Order Number</p>
                  <p className="text-sm text-[#C9A96E] font-medium">
                    {order.orderNumber}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#F5F0EB]/40 mb-1">Date</p>
                  <p className="text-sm text-[#F5F0EB]">{formatDate(order.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-[#F5F0EB]/40 mb-1">Payment Method</p>
                  <p className="text-sm text-[#F5F0EB]">{order.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-xs text-[#F5F0EB]/40 mb-1">Payment Status</p>
                  <Badge
                    className={cn(
                      "text-xs font-normal border-0",
                      getPaymentStatusColor(order.paymentStatus)
                    )}
                  >
                    {order.paymentStatus}
                  </Badge>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="border border-[#F5F0EB]/10 bg-[#1A1A1A] rounded-lg p-5"
            >
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#F5F0EB]/10">
                <Package className="w-5 h-5 text-[#C9A96E]" />
                <h2 className="text-sm font-medium text-[#F5F0EB] uppercase tracking-wider">
                  Order Items
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#F5F0EB]/10">
                      <th className="text-left py-3 text-xs font-medium text-[#F5F0EB]/40 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="text-center py-3 text-xs font-medium text-[#F5F0EB]/40 uppercase tracking-wider w-20">
                        Qty
                      </th>
                      <th className="text-right py-3 text-xs font-medium text-[#F5F0EB]/40 uppercase tracking-wider w-32">
                        Unit Price
                      </th>
                      <th className="text-right py-3 text-xs font-medium text-[#F5F0EB]/40 uppercase tracking-wider w-32">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F5F0EB]/5">
                    {order.items.map((item, index) => (
                      <tr key={index}>
                        <td className="py-3">
                          <span className="text-sm text-[#F5F0EB]">
                            {item.name}
                          </span>
                        </td>
                        <td className="py-3 text-center">
                          <span className="text-sm text-[#F5F0EB]/60">
                            {item.quantity}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <span className="text-sm text-[#F5F0EB]/60">
                            {formatCurrency(item.unitPrice)}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <span className="text-sm text-[#F5F0EB]">
                            {formatCurrency(item.total)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 pt-4 border-t border-[#F5F0EB]/10 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#F5F0EB]/40">Subtotal</span>
                  <span className="text-[#F5F0EB]">
                    {formatCurrency(order.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#F5F0EB]/40">Shipping</span>
                  <span className="text-[#F5F0EB]">
                    {formatCurrency(order.shipping)}
                  </span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#F5F0EB]/40">Discount</span>
                    <span className="text-green-400">
                      -{formatCurrency(order.discount)}
                    </span>
                  </div>
                )}
                {order.codFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#F5F0EB]/40">COD Fee</span>
                    <span className="text-[#F5F0EB]">
                      {formatCurrency(order.codFee)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm pt-2 border-t border-[#F5F0EB]/10">
                  <span className="text-[#F5F0EB] font-medium">Total</span>
                  <span className="text-[#C9A96E] font-medium text-lg">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="border border-[#F5F0EB]/10 bg-[#1A1A1A] rounded-lg p-5"
            >
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#F5F0EB]/10">
                <User className="w-5 h-5 text-[#C9A96E]" />
                <h2 className="text-sm font-medium text-[#F5F0EB] uppercase tracking-wider">
                  Customer
                </h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-[#F5F0EB]/30" />
                  <span className="text-sm text-[#F5F0EB]">
                    {order.customerName}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-[#F5F0EB]/30" />
                  <span className="text-sm text-[#F5F0EB]/60">
                    {order.customerEmail}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-[#F5F0EB]/30" />
                  <span className="text-sm text-[#F5F0EB]/60">
                    {order.customerPhone}
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="border border-[#F5F0EB]/10 bg-[#1A1A1A] rounded-lg p-5"
            >
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#F5F0EB]/10">
                <MapPin className="w-5 h-5 text-[#C9A96E]" />
                <h2 className="text-sm font-medium text-[#F5F0EB] uppercase tracking-wider">
                  Shipping Address
                </h2>
              </div>
              <p className="text-sm text-[#F5F0EB]/60 whitespace-pre-line leading-relaxed">
                {order.shippingAddress}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="border border-[#F5F0EB]/10 bg-[#1A1A1A] rounded-lg p-5"
            >
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#F5F0EB]/10">
                <Clock className="w-5 h-5 text-[#C9A96E]" />
                <h2 className="text-sm font-medium text-[#F5F0EB] uppercase tracking-wider">
                  Order Timeline
                </h2>
              </div>
              <StatusTimeline
                statusHistory={order.statusHistory}
                currentStatus={order.orderStatus}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="border border-[#F5F0EB]/10 bg-[#1A1A1A] rounded-lg p-5"
            >
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#F5F0EB]/10">
                <Truck className="w-5 h-5 text-[#C9A96E]" />
                <h2 className="text-sm font-medium text-[#F5F0EB] uppercase tracking-wider">
                  Update Status
                </h2>
              </div>
              <div className="space-y-3">
                <Select value={newStatus} onValueChange={setNewStatus}>
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
                <Button
                  onClick={() =>
                    statusMutation.mutate({ status: newStatus })
                  }
                  disabled={!newStatus || statusMutation.isPending}
                  className="w-full bg-[#C9A96E] hover:bg-[#C9A96E]/90 text-[#1A1A1A] font-medium"
                >
                  {statusMutation.isPending ? "Updating..." : "Update Status"}
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="border border-[#F5F0EB]/10 bg-[#1A1A1A] rounded-lg p-5"
            >
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#F5F0EB]/10">
                <FileText className="w-5 h-5 text-[#C9A96E]" />
                <h2 className="text-sm font-medium text-[#F5F0EB] uppercase tracking-wider">
                  Internal Notes
                </h2>
              </div>
              <Textarea
                value={internalNotes || order.internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="Add internal notes about this order..."
                rows={4}
                className="bg-[#F5F0EB]/5 border-[#F5F0EB]/10 text-[#F5F0EB] placeholder:text-[#F5F0EB]/30 focus:border-[#C9A96E]/50 resize-none mb-3"
              />
              <Button
                onClick={() =>
                  notesMutation.mutate({ notes: internalNotes })
                }
                disabled={notesMutation.isPending}
                className="w-full bg-[#F5F0EB]/5 hover:bg-[#F5F0EB]/10 text-[#F5F0EB] border border-[#F5F0EB]/10"
              >
                <Save className="w-4 h-4 mr-2" />
                {notesMutation.isPending ? "Saving..." : "Save Notes"}
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="border border-[#F5F0EB]/10 bg-[#1A1A1A] rounded-lg p-5"
            >
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#F5F0EB]/10">
                <Truck className="w-5 h-5 text-[#C9A96E]" />
                <h2 className="text-sm font-medium text-[#F5F0EB] uppercase tracking-wider">
                  Tracking Number
                </h2>
              </div>
              <Input
                value={trackingNumber || order.trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number"
                className="bg-[#F5F0EB]/5 border-[#F5F0EB]/10 text-[#F5F0EB] placeholder:text-[#F5F0EB]/30 focus:border-[#C9A96E]/50 mb-3"
              />
              <Button
                onClick={() =>
                  trackingMutation.mutate({ tracking: trackingNumber })
                }
                disabled={trackingMutation.isPending}
                className="w-full bg-[#F5F0EB]/5 hover:bg-[#F5F0EB]/10 text-[#F5F0EB] border border-[#F5F0EB]/10"
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