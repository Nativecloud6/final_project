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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { type Service, devices, ipAddresses } from "@/models/data-center"

interface ServiceDetailModalProps {
  isOpen: boolean
  onClose: () => void
  serviceId: string | null
  services: Service[]
}

export function ServiceDetailModal({ isOpen, onClose, serviceId, services }: ServiceDetailModalProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [serviceData, setServiceData] = useState<Service | null>(null)

  useEffect(() => {
    if (serviceId) {
      const service = services.find((s) => s.id === serviceId) || null
      setServiceData(service)
    }
  }, [serviceId, services])

  if (!serviceData) return null

  // Get devices for this service
  const serviceDevices = devices.filter((device) => device.serviceId === serviceData.id)

  // Get IPs for this service
  const serviceIPs = ipAddresses.filter((ip) => ip.serviceId === serviceData.id)

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Active":
      case "Assigned":
        return "bg-green-900/30 text-green-200"
      case "Inactive":
      case "Available":
        return "bg-blue-900/30 text-blue-200"
      case "Maintenance":
      case "Reserved":
        return "bg-yellow-900/30 text-yellow-200"
      case "Decommissioned":
      case "Deprecated":
        return "bg-red-900/30 text-red-200"
      default:
        return "bg-gray-700 text-gray-200"
    }
  }

  const getCriticalityBadgeColor = (criticality: string) => {
    switch (criticality) {
      case "Low":
        return "bg-green-900/30 text-green-200"
      case "Medium":
        return "bg-blue-900/30 text-blue-200"
      case "High":
        return "bg-yellow-900/30 text-yellow-200"
      case "Critical":
        return "bg-red-900/30 text-red-200"
      default:
        return "bg-gray-700 text-gray-200"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>{serviceData.name}</DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <Badge className={`${getStatusBadgeColor(serviceData.status)}`}>{serviceData.status}</Badge>
            <Badge className={`${getCriticalityBadgeColor(serviceData.criticality)}`}>{serviceData.criticality}</Badge>
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="devices">Devices</TabsTrigger>
            <TabsTrigger value="ips">IP Addresses</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                  <p>{serviceData.description}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Details</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Owner</p>
                      <p>{serviceData.owner || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Department</p>
                      <p>{serviceData.department || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Devices</p>
                      <p>{serviceDevices.length}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">IP Addresses</p>
                      <p>{serviceIPs.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="devices">
            <div className="rounded-md border bg-[hsl(224,50%,18%)] w-full overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device Name</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>IP Addresses</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {serviceDevices.length > 0 ? (
                    serviceDevices.map((device) => (
                      <TableRow key={device.id}>
                        <TableCell className="font-medium">{device.name}</TableCell>
                        <TableCell>{device.model}</TableCell>
                        <TableCell>
                          <Badge className={`${getStatusBadgeColor(device.status)}`}>{device.status}</Badge>
                        </TableCell>
                        <TableCell>DC-A &gt; Room 1 &gt; Rack 1</TableCell>
                        <TableCell>
                          {device.ips.map((ip) => (
                            <div key={ip.id}>{ip.address}</div>
                          ))}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                        No devices associated with this service
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="ips">
            <div className="rounded-md border bg-[hsl(224,50%,18%)] w-full overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Subnet</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {serviceIPs.length > 0 ? (
                    serviceIPs.map((ip) => (
                      <TableRow key={ip.id}>
                        <TableCell className="font-medium">{ip.address}</TableCell>
                        <TableCell>{ip.subnet}</TableCell>
                        <TableCell>{ip.deviceName || "-"}</TableCell>
                        <TableCell>
                          <Badge className={`${getStatusBadgeColor(ip.status)}`}>{ip.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                        No IP addresses associated with this service
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button>Edit Service</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
