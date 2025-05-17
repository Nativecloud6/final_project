"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import { Card } from "@/components/ui/card"

// 資源使用數據
const resourceUsageData = [
  { name: "CPU", usage: 45, color: "#4CAF50" },
  { name: "記憶體", usage: 65, color: "#2196F3" },
  { name: "儲存", usage: 30, color: "#9C27B0" },
  { name: "網路", usage: 20, color: "#FF9800" },
]

// 服務使用數據
const serviceUsageData = [
  { name: "Web服務", value: 40, color: "#4CAF50" },
  { name: "數據庫", value: 30, color: "#2196F3" },
  { name: "應用服務", value: 30, color: "#9C27B0" },
]

export function UserDashboardCharts() {
  const [activeTab, setActiveTab] = useState("bar")

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <Card className="p-2 bg-background border border-border shadow-lg">
          <p className="text-sm font-medium">{`${payload[0].name}: ${payload[0].value}${
            activeTab === "pie" ? "%" : "%"
          }`}</p>
        </Card>
      )
    }
    return null
  }

  return (
    <Tabs defaultValue="bar" value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="mb-4">
        <TabsTrigger value="bar">資源使用率</TabsTrigger>
        <TabsTrigger value="pie">服務分佈</TabsTrigger>
      </TabsList>
      <TabsContent value="bar" className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={resourceUsageData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="name" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="usage" name="使用率 (%)" radius={[4, 4, 0, 0]}>
              {resourceUsageData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </TabsContent>
      <TabsContent value="pie" className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={serviceUsageData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {serviceUsageData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend layout="horizontal" verticalAlign="bottom" align="center" />
          </PieChart>
        </ResponsiveContainer>
      </TabsContent>
    </Tabs>
  )
}
