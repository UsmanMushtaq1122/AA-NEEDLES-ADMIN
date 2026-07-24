"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { formatNumber } from "@/lib/utils";

interface CustomerChartProps {
  data: { date: string; customers: number }[];
}

export function CustomerChart({ data }: CustomerChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F5F0EB" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(value) => format(new Date(value), "MMM dd")}
          tick={{ fill: "#9CA3AF", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#9CA3AF", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1A1A1A",
            border: "none",
            borderRadius: "12px",
            color: "#F5F0EB",
            padding: "12px 16px",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
          }}
          labelFormatter={(value) => format(new Date(value), "MMMM dd, yyyy")}
          formatter={(value: number) => [formatNumber(value), "Customers"]}
        />
        <Line
          type="monotone"
          dataKey="customers"
          stroke="#C9A96E"
          strokeWidth={2}
          dot={{ r: 4, fill: "#C9A96E", stroke: "#fff", strokeWidth: 2 }}
          activeDot={{ r: 6, fill: "#C9A96E", stroke: "#fff", strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
