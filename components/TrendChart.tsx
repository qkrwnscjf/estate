"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface TrendChartProps {
  data: Array<{
    name: string;
    price: number;
  }>;
}

export default function TrendChart({ data }: TrendChartProps) {
  return (
    <div className="h-80 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#DED8CF" opacity={0.6} />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: "#78786C", fontSize: 13, fontWeight: 500 }} 
            dy={15}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: "#78786C", fontSize: 13, fontWeight: 500 }} 
            dx={-10}
            tickFormatter={(val) => `${val/1000}k`}
          />
          <Tooltip 
            contentStyle={{ 
              borderRadius: "1.5rem", 
              border: "1px solid rgba(222, 216, 207, 0.5)",
              boxShadow: "0 10px 40px -10px rgba(193, 140, 93, 0.2)",
              backgroundColor: "#FEFEFA",
              padding: "12px 16px"
            }}
            itemStyle={{ color: "#2C2C24", fontWeight: 600 }}
            labelStyle={{ color: "#78786C", marginBottom: "4px" }}
          />
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke="#5D7052" 
            strokeWidth={3.5} 
            dot={{ r: 4, fill: "#5D7052", strokeWidth: 0 }}
            activeDot={{ r: 7, fill: "#C18C5D", stroke: "#FEFEFA", strokeWidth: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
