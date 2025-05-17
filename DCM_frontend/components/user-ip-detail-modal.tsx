"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import type { IPAddress } from "@/models/data-center"

interface UserIPDetailModalProps {
  isOpen: boolean
  onClose: () => void
  ipId: string | null
  ipAddresses: IPAddress[]
}

export function UserIPDetailModal({ isOpen, onClose, ipId, ipAddresses }: UserIPDetailModalProps) {
  const [activeTab, setActiveTab] = useState("details")
  const [ipData, setIpData] = useState<IPAddress | null>(null)

  useEffect(() => {
    if (ipId) {
      const ip = ipAddresses.find((ip) => ip.id === ipId) || null
      setIpData(ip)
    }
  }, [ipId, ipAddresses])

  if (!ipData) return null

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Assigned":
        return "bg-blue-900/30 text-blue-200"
      case "Available":
        return "bg-green-900/30 text-green-200"
      case "Reserved":
        return "bg-yellow-900/30 text-yellow-200"
      case "Deprecated":
        return "bg-red-900/30 text-red-200"
      default:
        return "bg-gray-700 text-gray-200"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{ipData.address}</DialogTitle>
          <DialogDescription>
            {ipData.subnet} - <Badge className={`${getStatusBadgeColor(ipData.status)}`}>{ipData.status}</Badge>
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="details">詳細信息</TabsTrigger>
            <TabsTrigger value="network">網路拓撲</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">基本信息</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground">IP地址</p>
                      <p>{ipData.address}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">子網</p>
                      <p>{ipData.subnet}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">網關</p>
                      <p>{ipData.gateway || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">狀態</p>
                      <Badge className={`${getStatusBadgeColor(ipData.status)}`}>{ipData.status}</Badge>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">關聯信息</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground">設備</p>
                      <p>{ipData.deviceName || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">服務</p>
                      <p>{ipData.serviceName || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">最後更新</p>
                      <p>{ipData.lastUpdated || "-"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="network">
            <div className="flex h-[200px] items-center justify-center bg-muted rounded-md">
              <div className="text-center text-muted-foreground">
                <div className="mb-2 text-lg font-medium">網路拓撲</div>
                <div>IP地址在網路中的視覺表示將顯示在這裡</div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            關閉
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
