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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { useDataCenterStore } from "@/lib/data-center-store"

interface DeviceActionModalProps {
  isOpen: boolean
  onClose: () => void
  actionType: "install" | "uninstall" | "move" | null
  deviceId: string | null
}

export function DeviceActionModal({ isOpen, onClose, actionType, deviceId }: DeviceActionModalProps) {
  const { dataCenters, devices, getDevice, addDevice, deleteDevice, findRack } = useDataCenterStore()

  // Form state
  const [deviceName, setDeviceName] = useState("")
  const [deviceModel, setDeviceModel] = useState("")
  const [ipAddress, setIpAddress] = useState("")
  const [subnet, setSubnet] = useState("192.168.1.0/24")
  const [deviceSize, setDeviceSize] = useState("1")
  const [deviceStatus, setDeviceStatus] = useState("Active")
  const [devicePower, setDevicePower] = useState("")
  const [deviceNotes, setDeviceNotes] = useState("")

  // Location selection
  const [selectedDc, setSelectedDc] = useState("")
  const [selectedRoom, setSelectedRoom] = useState("")
  const [selectedRack, setSelectedRack] = useState("")
  const [startUnit, setStartUnit] = useState("")
  const [endUnit, setEndUnit] = useState("")

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      resetForm()

      // If editing existing device, populate form
      if (deviceId && deviceId !== "new") {
        const device = getDevice(deviceId)
        if (device) {
          setDeviceName(device.name)
          setDeviceModel(device.type)
          setDeviceSize(device.size.toString())
          setDeviceStatus(device.status)
          setDevicePower(device.powerConsumption?.toString() || "")
          setDeviceNotes(device.description || "")

          if (device.ips && device.ips.length > 0) {
            setIpAddress(device.ips[0].address)
            setSubnet(device.ips[0].subnet)
          }
        }
      }
    }
  }, [isOpen, deviceId, getDevice])

  const resetForm = () => {
    setDeviceName("")
    setDeviceModel("")
    setIpAddress("")
    setSubnet("192.168.1.0/24")
    setDeviceSize("1")
    setDeviceStatus("Active")
    setDevicePower("")
    setDeviceNotes("")
    setSelectedDc("")
    setSelectedRoom("")
    setSelectedRack("")
    setStartUnit("")
    setEndUnit("")
  }

  // Get available units for the selected rack
  const getAvailableUnits = () => {
    if (!selectedRack) return []

    const rackInfo = findRack(selectedRack)
    if (!rackInfo) return []

    const { rack } = rackInfo
    const size = Number.parseInt(deviceSize)
    const availableUnits = []

    for (let i = 1; i <= rack.totalUnits - size + 1; i++) {
      let canFit = true
      for (let j = 0; j < size; j++) {
        if (rack.units[i + j - 1].deviceId !== null) {
          canFit = false
          break
        }
      }
      if (canFit) {
        availableUnits.push(i)
      }
    }

    return availableUnits
  }

  // Update end unit when start unit or device size changes
  useEffect(() => {
    if (startUnit && deviceSize) {
      const start = Number.parseInt(startUnit)
      const size = Number.parseInt(deviceSize)
      setEndUnit((start + size - 1).toString())
    }
  }, [startUnit, deviceSize])

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (actionType === "install" && deviceId === "new") {
      // Add new device
      if (!deviceName || !deviceModel || !ipAddress || !selectedDc || !selectedRoom || !selectedRack || !startUnit) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        return
      }

      const newDeviceId = `dev-${Date.now()}`
      const deviceInfo = {
        id: newDeviceId,
        name: deviceName,
        type: deviceModel,
        size: Number.parseInt(deviceSize),
        ips: [
          {
            id: `ip-${Date.now()}`,
            address: ipAddress,
            subnet: subnet,
            gateway: subnet.split("/")[0].split(".").slice(0, 3).concat(["1"]).join("."),
            status: "Assigned" as const,
            deviceId: newDeviceId,
            deviceName: deviceName,
            serviceId: null,
            serviceName: null,
            lastUpdated: new Date().toISOString().split("T")[0],
          },
        ],
        status: deviceStatus as "Active" | "Inactive" | "Maintenance" | "Decommissioned",
        powerConsumption: devicePower ? Number.parseInt(devicePower) : null,
        serviceId: null,
        serviceName: null,
        installationDate: new Date().toISOString().split("T")[0],
        lastUpdated: new Date().toISOString().split("T")[0],
        notes: deviceNotes,
      }

      try {
        addDevice(selectedDc, selectedRoom, selectedRack, Number.parseInt(startUnit), deviceInfo)

        toast({
          title: "Success",
          description: "Device added successfully",
        })

        onClose()
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to add device",
          variant: "destructive",
        })
        console.error(error)
      }
    } else if (actionType === "install" && deviceId) {
      // Install existing device
      if (!selectedDc || !selectedRoom || !selectedRack || !startUnit) {
        toast({
          title: "Error",
          description: "Please select a location",
          variant: "destructive",
        })
        return
      }

      const device = getDevice(deviceId)
      if (!device) {
        toast({
          title: "Error",
          description: "Device not found",
          variant: "destructive",
        })
        return
      }

      try {
        addDevice(selectedDc, selectedRoom, selectedRack, Number.parseInt(startUnit), device)

        toast({
          title: "Success",
          description: "Device installed successfully",
        })

        onClose()
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to install device",
          variant: "destructive",
        })
        console.error(error)
      }
    } else if (actionType === "uninstall" && deviceId) {
      // Find device location
      let deviceLocation = null

      for (const dc of dataCenters) {
        for (const room of dc.rooms) {
          for (const rack of room.racks) {
            const unit = rack.units.find((u) => u.deviceId === deviceId)
            if (unit) {
              deviceLocation = { dcId: dc.id, roomId: room.id, rackId: rack.id }
              break
            }
          }
          if (deviceLocation) break
        }
        if (deviceLocation) break
      }

      if (!deviceLocation) {
        toast({
          title: "Error",
          description: "Device location not found",
          variant: "destructive",
        })
        return
      }

      try {
        deleteDevice(deviceLocation.dcId, deviceLocation.roomId, deviceLocation.rackId, deviceId)

        toast({
          title: "Success",
          description: "Device uninstalled successfully",
        })

        onClose()
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to uninstall device",
          variant: "destructive",
        })
        console.error(error)
      }
    } else if (actionType === "move" && deviceId) {
      // Find current device location
      let currentLocation = null

      for (const dc of dataCenters) {
        for (const room of dc.rooms) {
          for (const rack of room.racks) {
            const unit = rack.units.find((u) => u.deviceId === deviceId)
            if (unit) {
              currentLocation = { dcId: dc.id, roomId: room.id, rackId: rack.id }
              break
            }
          }
          if (currentLocation) break
        }
        if (currentLocation) break
      }

      if (!currentLocation) {
        toast({
          title: "Error",
          description: "Current device location not found",
          variant: "destructive",
        })
        return
      }

      if (!selectedDc || !selectedRoom || !selectedRack || !startUnit) {
        toast({
          title: "Error",
          description: "Please select a new location",
          variant: "destructive",
        })
        return
      }

      const device = getDevice(deviceId)
      if (!device) {
        toast({
          title: "Error",
          description: "Device not found",
          variant: "destructive",
        })
        return
      }

      try {
        // Remove from current location
        deleteDevice(currentLocation.dcId, currentLocation.roomId, currentLocation.rackId, deviceId)

        // Add to new location
        addDevice(selectedDc, selectedRoom, selectedRack, Number.parseInt(startUnit), device)

        toast({
          title: "Success",
          description: "Device moved successfully",
        })

        onClose()
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to move device",
          variant: "destructive",
        })
        console.error(error)
      }
    }
  }

  const getTitle = () => {
    switch (actionType) {
      case "install":
        return deviceId === "new" ? "Add New Device" : "Install Device"
      case "uninstall":
        return "Uninstall Device"
      case "move":
        return "Move Device"
      default:
        return ""
    }
  }

  const getDescription = () => {
    switch (actionType) {
      case "install":
        return deviceId === "new"
          ? "Add a new device to the inventory and install it in a rack."
          : "Install the device in a rack."
      case "uninstall":
        return "Remove the device from its current rack."
      case "move":
        return "Move the device to a different rack or position."
      default:
        return ""
    }
  }

  // Get available units for the selected rack
  const availableUnits = getAvailableUnits()

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{getTitle()}</DialogTitle>
            <DialogDescription>{getDescription()}</DialogDescription>
          </DialogHeader>

          <div className="mt-4 grid gap-4 py-4">
            {actionType === "install" && deviceId === "new" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="deviceName">
                      Device Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="deviceName"
                      value={deviceName}
                      onChange={(e) => setDeviceName(e.target.value)}
                      placeholder="Enter device name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deviceModel">
                      Model/Type <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="deviceModel"
                      value={deviceModel}
                      onChange={(e) => setDeviceModel(e.target.value)}
                      placeholder="e.g. Dell R740"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ipAddress">
                      IP Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="ipAddress"
                      value={ipAddress}
                      onChange={(e) => setIpAddress(e.target.value)}
                      placeholder="e.g. 192.168.1.10"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subnet">
                      Subnet <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="subnet"
                      value={subnet}
                      onChange={(e) => setSubnet(e.target.value)}
                      placeholder="e.g. 192.168.1.0/24"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="deviceSize">
                      Size (U) <span className="text-red-500">*</span>
                    </Label>
                    <Select value={deviceSize} onValueChange={setDeviceSize}>
                      <SelectTrigger id="deviceSize">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((size) => (
                          <SelectItem key={size} value={size.toString()}>
                            {size}U
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deviceStatus">Status</Label>
                    <Select value={deviceStatus} onValueChange={setDeviceStatus}>
                      <SelectTrigger id="deviceStatus">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                        <SelectItem value="Decommissioned">Decommissioned</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="devicePower">Power Consumption (W)</Label>
                    <Input
                      id="devicePower"
                      type="number"
                      min="0"
                      value={devicePower}
                      onChange={(e) => setDevicePower(e.target.value)}
                      placeholder="e.g. 450"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deviceNotes">Notes</Label>
                  <Textarea
                    id="deviceNotes"
                    value={deviceNotes}
                    onChange={(e) => setDeviceNotes(e.target.value)}
                    placeholder="Additional information about this device"
                    rows={3}
                  />
                </div>
              </>
            )}

            {(actionType === "install" || actionType === "move") && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="selectedDc">
                      Data Center <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={selectedDc}
                      onValueChange={(value) => {
                        setSelectedDc(value)
                        setSelectedRoom("")
                        setSelectedRack("")
                        setStartUnit("")
                      }}
                    >
                      <SelectTrigger id="selectedDc">
                        <SelectValue placeholder="Select data center" />
                      </SelectTrigger>
                      <SelectContent>
                        {dataCenters.map((dc) => (
                          <SelectItem key={dc.id} value={dc.id}>
                            {dc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="selectedRoom">
                      Room <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={selectedRoom}
                      onValueChange={(value) => {
                        setSelectedRoom(value)
                        setSelectedRack("")
                        setStartUnit("")
                      }}
                      disabled={!selectedDc}
                    >
                      <SelectTrigger id="selectedRoom">
                        <SelectValue placeholder="Select room" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedDc &&
                          dataCenters
                            .find((dc) => dc.id === selectedDc)
                            ?.rooms.map((room) => (
                              <SelectItem key={room.id} value={room.id}>
                                {room.name}
                              </SelectItem>
                            ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="selectedRack">
                      Rack <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={selectedRack}
                      onValueChange={(value) => {
                        setSelectedRack(value)
                        setStartUnit("")
                      }}
                      disabled={!selectedRoom}
                    >
                      <SelectTrigger id="selectedRack">
                        <SelectValue placeholder="Select rack" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedRoom &&
                          dataCenters
                            .find((dc) => dc.id === selectedDc)
                            ?.rooms.find((room) => room.id === selectedRoom)
                            ?.racks.map((rack) => (
                              <SelectItem key={rack.id} value={rack.id}>
                                {rack.name}
                              </SelectItem>
                            ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startUnit">
                      Start Position <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={startUnit}
                      onValueChange={setStartUnit}
                      disabled={!selectedRack || availableUnits.length === 0}
                    >
                      <SelectTrigger id="startUnit">
                        <SelectValue
                          placeholder={availableUnits.length === 0 ? "No space available" : "Select position"}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {availableUnits.map((unit) => (
                          <SelectItem key={unit} value={unit.toString()}>
                            U{unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedRack && availableUnits.length === 0 && (
                      <p className="text-xs text-red-500">
                        No available space in this rack for the selected device size
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endUnit">End Position</Label>
                    <Input id="endUnit" value={endUnit} readOnly disabled className="bg-muted" />
                  </div>
                </div>
              </>
            )}

            {actionType === "uninstall" && deviceId && (
              <div className="py-4 text-center">
                <p className="mb-2">Are you sure you want to uninstall this device?</p>
                <p className="font-medium">{getDevice(deviceId)?.name}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  The device will be removed from its current rack but will remain in the inventory.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant={actionType === "uninstall" ? "destructive" : "default"}>
              {actionType === "install" && (deviceId === "new" ? "Add & Install" : "Install")}
              {actionType === "uninstall" && "Uninstall"}
              {actionType === "move" && "Move"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
