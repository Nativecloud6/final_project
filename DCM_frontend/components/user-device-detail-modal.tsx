"use client"

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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Device } from "@/models/data-center"
import { useState, useEffect } from "react"

interface UserDeviceDetailModalProps {
  isOpen: boolean
  onClose: () => void
  deviceId: string | null
  devices: Device[]
}

export function UserDeviceDetailModal({ isOpen, onClose, deviceId, devices }: UserDeviceDetailModalProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [deviceData, setDeviceData] = useState<Device | null>(null)

  useEffect(() => {
    if (deviceId) {
      const device = devices.find((d) => d.id === deviceId) || null
      setDeviceData(device)
    }
  }, [deviceId, devices])

  if (!deviceData) return null

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-900/30 text-green-200"
      case "Inactive":
        return "bg-gray-700 text-gray-200"
      case "Maintenance":
        return "bg-yellow-900/30 text-yellow-200"
      case "Decommissioned":
        return "bg-red-900/30 text-red-200"
      default:
        return "bg-gray-700 text-gray-200"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>{deviceData.name}</DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <Badge className={`${getStatusBadgeColor(deviceData.status)}`}>{deviceData.status}</Badge>
            <span>{deviceData.model}</span>
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview">概覽</TabsTrigger>
            <TabsTrigger value="network">網路</TabsTrigger>
            <TabsTrigger value="specs">規格</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">基本信息</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground">設備名稱</p>
                      <p>{deviceData.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">型號</p>
                      <p>{deviceData.model}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">狀態</p>
                      <Badge className={`${getStatusBadgeColor(deviceData.status)}`}>{deviceData.status}</Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">服務</p>
                      <p>{deviceData.serviceName || "-"}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">位置信息</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground">數據中心</p>
                      <p>DC-A</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">機架</p>
                      <p>Rack 1</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">位置</p>
                      <p>U5-U6</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">安裝日期</p>
                      <p>{deviceData.installationDate || "-"}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">備註</h3>
                <p className="text-sm">{deviceData.notes || "無備註"}</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="network">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">IP地址</h3>
              <div className="rounded-md border bg-[hsl(224,50%,18%)] w-full overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>IP地址</TableHead>
                      <TableHead>子網</TableHead>
                      <TableHead>狀態</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deviceData.ips.length > 0 ? (
                      deviceData.ips.map((ip) => (
                        <TableRow key={ip.id}>
                          <TableCell className="font-medium">{ip.address}</TableCell>
                          <TableCell>{ip.subnet}</TableCell>
                          <TableCell>
                            <Badge className="bg-blue-900/30 text-blue-200">{ip.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                          沒有分配IP地址
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="specs">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">硬體規格</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground">CPU</p>
                      <p>Intel Xeon E5-2680 v4</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">記憶體</p>
                      <p>128GB DDR4</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">儲存</p>
                      <p>2 x 1TB SSD</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">網路</p>
                      <p>4 x 10GbE</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">電源信息</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground">功耗</p>
                      <p>{deviceData.powerConsumption || "-"} W</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">電源</p>
                      <p>冗餘電源</p>
                    </div>
                  </div>
                </div>
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
