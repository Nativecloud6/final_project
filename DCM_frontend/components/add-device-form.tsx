"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { useDataCenterStore } from "@/lib/data-center-store"
import type { Rack } from "@/models/data-center"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Trash } from "lucide-react"

interface AddDeviceFormProps {
  rack: Rack
  onSuccess?: () => void
}

export function AddDeviceForm({ rack, onSuccess }: AddDeviceFormProps) {
  const { findRack, addDevice } = useDataCenterStore()

  const [deviceName, setDeviceName] = useState("")
  const [deviceType, setDeviceType] = useState("server")
  const [startPosition, setStartPosition] = useState("1")
  const [deviceSize, setDeviceSize] = useState("1")
  const [description, setDescription] = useState("")
  const [ipAddresses, setIpAddresses] = useState<{ address: string; subnet: string }[]>([{ address: "", subnet: "" }])
  const [powerConsumption, setPowerConsumption] = useState("")
  const [status, setStatus] = useState("Active")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 獲取可用位置（未被設備佔用）
  const getAvailablePositions = () => {
    const availablePositions: number[] = []

    for (let i = 1; i <= rack.totalUnits - Number.parseInt(deviceSize) + 1; i++) {
      let available = true

      // 檢查從 i 開始的 deviceSize 個單元是否都可用
      for (let j = 0; j < Number.parseInt(deviceSize); j++) {
        const unit = rack.units[i + j - 1]
        if (!unit || unit.deviceId !== null) {
          available = false
          break
        }
      }

      if (available) {
        availablePositions.push(i)
      }
    }

    return availablePositions
  }

  const availablePositions = getAvailablePositions()

  const handleAddIpAddress = () => {
    setIpAddresses([...ipAddresses, { address: "", subnet: "" }])
  }

  const handleRemoveIpAddress = (index: number) => {
    const newIpAddresses = [...ipAddresses]
    newIpAddresses.splice(index, 1)
    setIpAddresses(newIpAddresses)
  }

  const handleIpAddressChange = (index: number, field: "address" | "subnet", value: string) => {
    const newIpAddresses = [...ipAddresses]
    newIpAddresses[index][field] = value
    setIpAddresses(newIpAddresses)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!deviceName.trim()) {
      toast({
        title: "Error",
        description: "Device name is required",
        variant: "destructive",
      })
      return
    }

    // 驗證IP地址
    const validIps = ipAddresses.filter((ip) => ip.address.trim() && ip.subnet.trim())
    if (validIps.length === 0) {
      toast({
        title: "Error",
        description: "At least one valid IP address is required",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const rackInfo = findRack(rack.id)

      if (!rackInfo) {
        throw new Error("Rack not found")
      }

      const { datacenter, room } = rackInfo

      // 格式化IP地址
      const formattedIps = validIps.map((ip, index) => ({
        id: `ip-${Date.now()}-${index}`,
        address: ip.address,
        subnet: ip.subnet,
        gateway: ip.subnet.split("/")[0].split(".").slice(0, 3).concat(["1"]).join("."),
        status: "Assigned" as const,
        deviceId: `dev-${Date.now()}`,
        deviceName: deviceName,
        serviceId: null,
        serviceName: null,
        lastUpdated: new Date().toISOString().split("T")[0],
      }))

      // 添加設備
      addDevice(datacenter.id, room.id, rack.id, Number.parseInt(startPosition), {
        id: `dev-${Date.now()}`,
        name: deviceName,
        type: deviceType,
        size: Number.parseInt(deviceSize),
        description,
        ips: formattedIps,
        status: status as "Active" | "Inactive" | "Maintenance" | "Decommissioned",
        powerConsumption: powerConsumption ? Number.parseInt(powerConsumption) : null,
        installationDate: new Date().toISOString().split("T")[0],
      })

      toast({
        title: "Success",
        description: `Device "${deviceName}" has been added to the rack.`,
      })

      // 重置表單
      setDeviceName("")
      setDeviceType("server")
      setStartPosition("1")
      setDeviceSize("1")
      setDescription("")
      setIpAddresses([{ address: "", subnet: "" }])
      setPowerConsumption("")
      setStatus("Active")

      // 通知父組件
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add device. Please try again.",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
          <Label htmlFor="deviceType">Device Type</Label>
          <Select value={deviceType} onValueChange={setDeviceType}>
            <SelectTrigger id="deviceType">
              <SelectValue placeholder="Select device type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="server">Server</SelectItem>
              <SelectItem value="switch">Network Switch</SelectItem>
              <SelectItem value="storage">Storage Array</SelectItem>
              <SelectItem value="ups">UPS</SelectItem>
              <SelectItem value="router">Router</SelectItem>
              <SelectItem value="firewall">Firewall</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="deviceSize">Device Size (U)</Label>
          <Select
            value={deviceSize}
            onValueChange={(value) => {
              setDeviceSize(value)
              // 重置起始位置
              setStartPosition("1")
            }}
          >
            <SelectTrigger id="deviceSize">
              <SelectValue placeholder="Select device size" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 4, 8].map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}U
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="startPosition">Start Position</Label>
          <Select value={startPosition} onValueChange={setStartPosition} disabled={availablePositions.length === 0}>
            <SelectTrigger id="startPosition">
              <SelectValue placeholder="Select start position" />
            </SelectTrigger>
            <SelectContent>
              {availablePositions.map((pos) => (
                <SelectItem key={pos} value={pos.toString()}>
                  U{pos}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {availablePositions.length === 0 && (
            <p className="text-xs text-red-500">No available positions for this device size</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger id="status">
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
          <Label htmlFor="powerConsumption">Power Consumption (Watts)</Label>
          <Input
            id="powerConsumption"
            type="number"
            min="0"
            value={powerConsumption}
            onChange={(e) => setPowerConsumption(e.target.value)}
            placeholder="Enter power consumption"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>
          IP Addresses <span className="text-red-500">*</span>
        </Label>
        <Card>
          <CardContent className="p-4 space-y-4">
            {ipAddresses.map((ip, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="space-y-2">
                  <Label htmlFor={`ip-address-${index}`}>IP Address</Label>
                  <Input
                    id={`ip-address-${index}`}
                    value={ip.address}
                    onChange={(e) => handleIpAddressChange(index, "address", e.target.value)}
                    placeholder="e.g. 192.168.1.10"
                    required={index === 0}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`ip-subnet-${index}`}>Subnet</Label>
                  <Input
                    id={`ip-subnet-${index}`}
                    value={ip.subnet}
                    onChange={(e) => handleIpAddressChange(index, "subnet", e.target.value)}
                    placeholder="e.g. 192.168.1.0/24"
                    required={index === 0}
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveIpAddress(index)}
                    disabled={ipAddresses.length === 1 && index === 0}
                  >
                    <Trash className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={handleAddIpAddress} className="mt-2">
              <Plus className="h-4 w-4 mr-2" /> Add IP Address
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-2">
        <Label htmlFor="deviceDescription">Description (Optional)</Label>
        <Textarea
          id="deviceDescription"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter device description"
          rows={3}
        />
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={
            isSubmitting ||
            availablePositions.length === 0 ||
            !deviceName.trim() ||
            !ipAddresses[0].address.trim() ||
            !ipAddresses[0].subnet.trim()
          }
        >
          {isSubmitting ? "Adding..." : "Add Device"}
        </Button>
      </div>
    </form>
  )
}
