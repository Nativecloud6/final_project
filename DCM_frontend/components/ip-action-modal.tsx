"use client"

import type React from "react"

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
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { type IPAddress, devices, services } from "@/models/data-center"
import { Badge } from "@/components/ui/badge"

interface IPActionModalProps {
  isOpen: boolean
  onClose: () => void
  ipId: string | null
  ipAddresses: IPAddress[]
}

export function IPActionModal({ isOpen, onClose, ipId, ipAddresses }: IPActionModalProps) {
  const [device, setDevice] = useState("")
  const [service, setService] = useState("")
  const [status, setStatus] = useState("")
  const [activeTab, setActiveTab] = useState("assign")
  const [ipData, setIpData] = useState<IPAddress | null>(null)

  useEffect(() => {
    if (ipId) {
      const ip = ipAddresses.find((ip) => ip.id === ipId) || null
      setIpData(ip)
      if (ip) {
        setDevice(ip.deviceId || "")
        setService(ip.serviceId || "")
        setStatus(ip.status)
      }
    }
  }, [ipId, ipAddresses])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you would update the IP status here
    onClose()
  }

  if (!ipData) return null

  const isAvailable = ipData.status === "Available"
  const isAssigned = ipData.status === "Assigned"
  const isReserved = ipData.status === "Reserved"

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isAvailable ? "Assign IP Address" : "Manage IP Address"}</DialogTitle>
          <DialogDescription>
            {ipData.address} - {ipData.subnet}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="assign">Assign/Update</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="assign">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status" className="col-span-3">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="Assigned">Assigned</SelectItem>
                    <SelectItem value="Reserved">Reserved</SelectItem>
                    <SelectItem value="Deprecated">Deprecated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(status === "Assigned" || status === "Reserved") && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="device" className="text-right">
                      Device
                    </Label>
                    <Select value={device} onValueChange={setDevice}>
                      <SelectTrigger id="device" className="col-span-3">
                        <SelectValue placeholder="Select Device" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {devices.map((dev) => (
                          <SelectItem key={dev.id} value={dev.id}>
                            {dev.name} ({dev.model})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="service" className="text-right">
                      Service
                    </Label>
                    <Select value={service} onValueChange={setService}>
                      <SelectTrigger id="service" className="col-span-3">
                        <SelectValue placeholder="Select Service" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {services.map((svc) => (
                          <SelectItem key={svc.id} value={svc.id}>
                            {svc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {isAssigned && (
                <div className="mt-2 rounded-md bg-yellow-900/30 p-3 text-sm text-yellow-200">
                  <p className="font-medium">Warning</p>
                  <p>Changing the status of an assigned IP address may affect the connected device.</p>
                </div>
              )}
            </form>
          </TabsContent>

          <TabsContent value="history">
            <div className="space-y-4">
              <div className="rounded-md border p-4">
                <h3 className="text-sm font-medium mb-2">IP Address History</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-start border-b border-border pb-2">
                    <div>
                      <p className="text-sm font-medium">Assigned to Web Server 1</p>
                      <p className="text-xs text-muted-foreground">Service: Web Service</p>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-blue-900/30 text-blue-200">Assigned</Badge>
                      <p className="text-xs text-muted-foreground mt-1">2023-05-15</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-start border-b border-border pb-2">
                    <div>
                      <p className="text-sm font-medium">Created</p>
                      <p className="text-xs text-muted-foreground">Added to subnet {ipData.subnet}</p>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-green-900/30 text-green-200">Available</Badge>
                      <p className="text-xs text-muted-foreground mt-1">2023-01-10</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit}>
            {isAvailable ? "Assign IP" : "Update IP"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
