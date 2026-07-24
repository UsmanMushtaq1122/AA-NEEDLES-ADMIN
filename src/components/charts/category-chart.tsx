"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { formatCurrency } from "@/lib/utils";

interface CategoryChartProps {
  data: { name: string; products: number; revenue: number }[];
}

const COLORS = ["#C9A96E", "#8B1A1A", "#F5F0EB", "#1A1A1A", "#B8955D"];

const CustomLegend = ({ payload }: { payload?: { value: string; color: string }[] }) => {
  return (
    <div className="flex flex-wrap justify-center gap-4 mt-4">
      {payload?.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-gray-600">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export function CategoryChart({ data }: CategoryChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={70}
          outerRadius={120}
          paddingAngle={4}
          dataKey="revenue"
          nameKey="name"
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "#1A1A1A",
            border: "none",
            borderRadius: "12px",
            color: "#F5F0EB",
            padding: "12px 16px",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
          }}
          formatter={(value: number, name: string) => [
            formatCurrency(value),
            name,
          ]}
        />
        <Legend content={<CustomLegend />} />
      </PieChart>
    </ResponsiveContainer>
  );
}
