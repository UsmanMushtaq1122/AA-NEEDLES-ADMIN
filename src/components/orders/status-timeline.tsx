"use client"

import { Check, Mail, AlertTriangle } from "lucide-react"
import { cn, formatDate, getOrderStatusLabel } from "@/lib/utils"

export interface StatusHistoryEntry {
  status: string
  to?: string
  from?: string
  timestamp?: string
  at?: string
  note?: string
  emailSent?: boolean
  emailRecipient?: string
  notificationStatus?: string
  notificationError?: string
}

interface StatusTimelineProps {
  statusHistory?: StatusHistoryEntry[]
  currentStatus: string
}

const statusOrder = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
]

export default function StatusTimeline({
  statusHistory = [],
  currentStatus,
}: StatusTimelineProps) {
  const normCurrent = (currentStatus || "").toLowerCase()
  const currentStatusIndex = statusOrder.indexOf(normCurrent)
  const isCancelled = normCurrent === "cancelled"

  const completedStatuses = isCancelled
    ? []
    : currentStatusIndex >= 0
    ? statusOrder.slice(0, currentStatusIndex)
    : []

  const lastEntriesByStatus = new Map<string, StatusHistoryEntry>()
  ;(statusHistory || []).forEach((entry) => {
    const raw = entry.status || entry.to || ""
    const key = raw.toLowerCase()
    lastEntriesByStatus.set(key, entry)
  })

  const cancelledEntry =
    lastEntriesByStatus.get("cancelled") ||
    (statusHistory || []).find((h) => (h.status || h.to || "").toLowerCase() === "cancelled")

  return (
    <div className="relative">
      {isCancelled && (
        <div className="mb-4 p-3.5 rounded-lg bg-red-50 border border-red-200">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-600" />
            <span className="text-sm text-red-700 font-semibold">Cancelled</span>
          </div>
          {cancelledEntry?.note && (
            <p className="text-xs text-red-600 mt-1 ml-4">
              Reason: {cancelledEntry.note}
            </p>
          )}
          {cancelledEntry && (
            <p className="text-xs text-gray-500 mt-1 ml-4">
              {formatDate(cancelledEntry.timestamp || cancelledEntry.at || new Date().toISOString())}
            </p>
          )}
          {cancelledEntry?.emailSent && (
            <p className="text-[11px] text-emerald-700 font-medium mt-1 ml-4 flex items-center gap-1">
              <Mail className="w-3 h-3" /> Cancellation email sent to customer
            </p>
          )}
        </div>
      )}

      <div className="space-y-0">
        {statusOrder.map((status, index) => {
          const isCompleted = !isCancelled && completedStatuses.includes(status)
          const isCurrent = !isCancelled && normCurrent === status
          const entry = lastEntriesByStatus.get(status)

          return (
            <div key={status} className="relative flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all duration-300",
                    isCompleted
                      ? "bg-[#7A6543] border-[#7A6543]"
                      : isCurrent
                      ? "bg-[#7A6543]/20 border-[#7A6543]"
                      : "bg-gray-100 border-gray-300"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-3 h-3 text-white" />
                  ) : isCurrent ? (
                    <div className="w-2 h-2 rounded-full bg-[#7A6543]" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-gray-300" />
                  )}
                </div>
                {index < statusOrder.length - 1 && (
                  <div
                    className={cn(
                      "w-0.5 flex-1 min-h-[2.2rem]",
                      isCompleted ? "bg-[#7A6543]" : "bg-gray-200"
                    )}
                  />
                )}
              </div>

              <div className="pb-5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      isCompleted || isCurrent ? "text-[#1A1A1A]" : "text-gray-400"
                    )}
                  >
                    {getOrderStatusLabel(status)}
                  </p>
                  {entry?.emailSent === true && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium border border-emerald-200">
                      <Mail className="w-2.5 h-2.5" /> Email Sent
                    </span>
                  )}
                  {entry?.notificationStatus === "failed" && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded font-medium border border-rose-200">
                      <AlertTriangle className="w-2.5 h-2.5" /> Email Failed
                    </span>
                  )}
                </div>

                {entry ? (
                  <p
                    className={cn(
                      "text-xs mt-0.5",
                      isCompleted || isCurrent ? "text-gray-600" : "text-gray-400"
                    )}
                  >
                    {formatDate(entry.timestamp || entry.at || "")}
                  </p>
                ) : (
                  <p className="text-xs text-gray-300 mt-0.5">—</p>
                )}

                {entry?.note && (isCompleted || isCurrent) && (
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed bg-[#F8F5F2] p-1.5 rounded border border-[#E8DDD4]">
                    {entry.note}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}