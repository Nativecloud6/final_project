"use client"

import { useState } from "react"
import { ArrowUpDown, Download, Plus, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DeviceActionModal } from "@/components/device-action-modal"
import { useDataCenterStore } from "@/lib/data-center-store"
import { Badge } from "@/components/ui/badge"

export default function DeviceManagement() {
  const { devices, dataCenters, services } = useDataCenterStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [actionType, setActionType] = useState<"install" | "uninstall" | "move" | null>(null)
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  // Convert devices object to array
  const devicesList = Object.values(devices)

  // Filter devices based on search query
  const filteredDevices = devicesList.filter(
    (device) =>
      device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.ips?.some((ip) => ip.address.includes(searchQuery)) ||
      getDeviceLocation(device.id).toLowerCase().includes(searchQuery.toLowerCase()) ||
      (device.serviceName && device.serviceName.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const handleAction = (type: "install" | "uninstall" | "move", deviceId: string) => {
    setActionType(type)
    setSelectedDevice(deviceId)
  }

  const closeModal = () => {
    setActionType(null)
    setSelectedDevice(null)
    // Refresh the device list
    setRefreshKey((prev) => prev + 1)
  }

  // Find device location
  function getDeviceLocation(deviceId: string): string {
    for (const dc of dataCenters) {
      for (const room of dc.rooms) {
        for (const rack of room.racks) {
          for (const unit of rack.units) {
            if (unit.deviceId === deviceId) {
              return `${dc.name} > ${room.name} > ${rack.name} > U${unit.position}`
            }
          }
        }
      }
    }
    return "Not installed"
  }

  // Check if device is installed
  function isDeviceInstalled(deviceId: string): boolean {
    return getDeviceLocation(deviceId) !== "Not installed"
  }

  // Get status badge color
  function getStatusColor(status: string): string {
    switch (status) {
      case "Active":
        return "bg-green-900/30 text-green-200"
      case "Inactive":
        return "bg-blue-900/30 text-blue-200"
      case "Maintenance":
        return "bg-yellow-900/30 text-yellow-200"
      case "Decommissioned":
        return "bg-red-900/30 text-red-200"
      default:
        return "bg-gray-700 text-gray-200"
    }
  }

  // 獲取服務信息
  const getServiceInfo = (serviceId: string | undefined) => {
    if (!serviceId) return null
    return services.find((service) => service.id === serviceId)
  }

  return (
    <div className="space-y-4 w-full max-w-none">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Device Management</h1>
        <Button onClick={() => handleAction("install", "new")}>
          <Plus className="mr-2 h-4 w-4" /> Add Device
        </Button>
      </div>

      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle>Devices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <Input
              placeholder="Search devices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <div className="rounded-md border bg-[hsl(224,50%,18%)] w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">
                    <Button variant="ghost" className="p-0 font-medium">
                      Name <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDevices.length > 0 ? (
                  filteredDevices.map((device) => (
                    <TableRow key={device.id}>
                      <TableCell className="font-medium">{device.name}</TableCell>
                      <TableCell>{device.type}</TableCell>
                      <TableCell>
                        {device.ips && device.ips.length > 0 ? (
                          <div className="flex flex-col">
                            <span>{device.ips[0].address}</span>
                            {device.ips.length > 1 && (
                              <Badge variant="outline" className="mt-1 w-fit">
                                +{device.ips.length - 1} more
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No IP</span>
                        )}
                      </TableCell>
                      <TableCell>{getDeviceLocation(device.id)}</TableCell>
                      <TableCell>
                        {device.serviceId ? (
                          <Badge variant="outline" className="bg-purple-900/30 text-purple-200 border-purple-700">
                            {device.serviceName || getServiceInfo(device.serviceId)?.name || "Unknown Service"}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">None</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                            device.status,
                          )}`}
                        >
                          {device.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {isDeviceInstalled(device.id) ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1 border-orange-700 bg-orange-900/30 text-orange-200 hover:bg-orange-800/50"
                                onClick={() => handleAction("move", device.id)}
                              >
                                <Upload className="h-3.5 w-3.5" />
                                Move
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1 border-red-700 bg-red-900/30 text-red-200 hover:bg-red-800/50"
                                onClick={() => handleAction("uninstall", device.id)}
                              >
                                <Download className="h-3.5 w-3.5" />
                                Uninstall
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 gap-1 border-blue-700 bg-blue-900/30 text-blue-200 hover:bg-blue-800/50"
                              onClick={() => handleAction("install", device.id)}
                            >
                              <Upload className="h-3.5 w-3.5" />
                              Install
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      {searchQuery ? "No devices match your search" : "No devices found. Add a device to get started."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <DeviceActionModal
        isOpen={actionType !== null}
        onClose={closeModal}
        actionType={actionType}
        deviceId={selectedDevice}
      />
    </div>
  )
}
