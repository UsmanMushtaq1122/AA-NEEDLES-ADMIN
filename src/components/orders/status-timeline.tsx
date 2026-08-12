"use client"

import { Check } from "lucide-react"
import { cn, formatDate, getOrderStatusLabel } from "@/lib/utils"

interface StatusHistoryEntry {
  status: string
  timestamp: string
  note?: string
}

interface StatusTimelineProps {
  statusHistory?: StatusHistoryEntry[]
  currentStatus: string
}

const statusOrder = ["pending", "processing", "shipped", "delivered"]

export default function StatusTimeline({
  statusHistory = [],
  currentStatus,
}: StatusTimelineProps) {
  const currentStatusIndex = statusOrder.indexOf(currentStatus)

  const isCancelled = currentStatus === "cancelled"

  const completedStatuses = isCancelled
    ? []
    : statusOrder.slice(0, currentStatusIndex)

  const filteredHistory = (statusHistory || []).filter(
    (entry) => entry.status !== "cancelled"
  )

  const lastEntriesByStatus = new Map<string, StatusHistoryEntry>()
  filteredHistory.forEach((entry) => {
    lastEntriesByStatus.set(entry.status, entry)
  })

  return (
    <div className="relative">
      {isCancelled && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-600" />
            <span className="text-sm text-red-700 font-semibold">Cancelled</span>
          </div>
          {statusHistory.find((h) => h.status === "cancelled")?.note && (
            <p className="text-xs text-red-600 mt-1 ml-4">
              {statusHistory.find((h) => h.status === "cancelled")?.note}
            </p>
          )}
          {statusHistory.find((h) => h.status === "cancelled") && (
            <p className="text-xs text-gray-500 mt-1 ml-4">
              {formatDate(
                statusHistory.find((h) => h.status === "cancelled")!.timestamp
              )}
            </p>
          )}
        </div>
      )}

      <div className="space-y-0">
        {statusOrder.map((status, index) => {
          const isCompleted = !isCancelled && completedStatuses.includes(status)
          const isCurrent = !isCancelled && currentStatus === status
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
                      "w-0.5 flex-1 min-h-[2rem]",
                      isCompleted
                        ? "bg-[#7A6543]"
                        : "bg-gray-200"
                    )}
                  />
                )}
              </div>

              <div className="pb-6 flex-1 min-w-0">
                <p
                  className={cn(
                    "text-sm font-medium",
                    isCompleted || isCurrent
                      ? "text-[#1A1A1A]"
                      : "text-gray-400"
                  )}
                >
                  {getOrderStatusLabel(status)}
                </p>
                {entry ? (
                  <p
                    className={cn(
                      "text-xs mt-0.5",
                      isCompleted || isCurrent
                        ? "text-gray-600"
                        : "text-gray-400"
                    )}
                  >
                    {formatDate(entry.timestamp)}
                  </p>
                ) : (
                  <p className="text-xs text-gray-300 mt-0.5">—</p>
                )}
                {entry?.note && (isCompleted || isCurrent) && (
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
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