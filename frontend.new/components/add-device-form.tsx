"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useDataCenterStore } from "@/lib/data-center-store"
import { toast } from "@/components/ui/use-toast"
import { Plus, X } from "lucide-react"
import type { Rack } from "@/models/data-center"

interface AddDeviceFormProps {
  rack: Rack
  onSuccess?: () => void
  dataCenterId?: string
  roomId?: string
  rackId?: string
}

export function AddDeviceForm({ rack, onSuccess, dataCenterId, roomId, rackId }: AddDeviceFormProps) {
  const [deviceName, setDeviceName] = useState("")
  const [deviceType, setDeviceType] = useState("")
  const [deviceSize, setDeviceSize] = useState("1")
  const [startPosition, setStartPosition] = useState("1")
  const [deviceModel, setDeviceModel] = useState("")
  const [deviceStatus, setDeviceStatus] = useState<"Active" | "Inactive" | "Maintenance" | "Decommissioned">("Active")
  const [deviceDescription, setDeviceDescription] = useState("")
  const [ipAddresses, setIpAddresses] = useState([{ address: "", type: "Management" }])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedService, setSelectedService] = useState<string | null>(null)

  const dataStore = useDataCenterStore()
  const services = dataStore.getAllServices ? dataStore.getAllServices() : []

  // 處理IP地址變更
  const handleIpChange = (index: number, field: string, value: string) => {
    const newIpAddresses = [...ipAddresses]
    newIpAddresses[index] = { ...newIpAddresses[index], [field]: value }
    setIpAddresses(newIpAddresses)
  }

  // 添加IP地址
  const addIpAddress = () => {
    setIpAddresses([...ipAddresses, { address: "", type: "Management" }])
  }

  // 移除IP地址
  const removeIpAddress = (index: number) => {
    const newIpAddresses = [...ipAddresses]
    newIpAddresses.splice(index, 1)
    setIpAddresses(newIpAddresses)
  }

  // 獲取可用的起始位置
  const getAvailableStartPositions = () => {
    const size = Number.parseInt(deviceSize, 10)
    if (isNaN(size) || size <= 0) return []

    const availablePositions = []
    for (let i = 1; i <= rack.totalUnits - size + 1; i++) {
      let available = true
      for (let j = 0; j < size; j++) {
        if (rack.units[i + j - 1].deviceId !== null) {
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

  // 處理表單提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // 驗證必填字段
      if (!deviceName || !deviceType || !deviceSize || !startPosition) {
        throw new Error("Please fill in all required fields")
      }

      // 驗證設備大小
      const size = Number.parseInt(deviceSize, 10)
      if (isNaN(size) || size <= 0) {
        throw new Error("Device size must be a positive number")
      }

      // 驗證起始位置
      const position = Number.parseInt(startPosition, 10)
      if (isNaN(position) || position <= 0 || position > rack.totalUnits - size + 1) {
        throw new Error("Invalid start position")
      }

      // 檢查是否有足夠的空間
      for (let i = 0; i < size; i++) {
        if (rack.units[position + i - 1].deviceId !== null) {
          throw new Error("The selected position does not have enough space")
        }
      }

      // 創建設備對象
      const deviceInfo = {
        id: `dev-${Date.now()}`,
        name: deviceName,
        type: deviceType,
        size,
        model: deviceModel,
        status: deviceStatus,
        description: deviceDescription,
        installationDate: new Date().toISOString(),
        serviceId: selectedService,
        serviceName: selectedService ? services.find((s) => s.id === selectedService)?.name || null : null,
        ips: ipAddresses.filter((ip) => ip.address.trim() !== "").map((ip) => ({ address: ip.address, type: ip.type })),
      }

      // 使用傳入的數據中心、房間和機櫃ID，如果沒有傳入，則使用從機櫃中獲取的信息
      const dcId = dataCenterId || dataStore.findRack(rack.id)?.datacenter.id
      const rmId = roomId || dataStore.findRack(rack.id)?.room.id
      const rkId = rackId || rack.id

      if (!dcId || !rmId) {
        throw new Error("Data center or room information not found")
      }

      // 安裝設備
      dataStore.addDevice(dcId, rmId, rkId, position, deviceInfo)

      // 如果選擇了服務，將設備添加到服務中
      if (selectedService) {
        dataStore.assignDeviceToService(deviceInfo.id, selectedService)
      }

      toast({
        title: "Success",
        description: "Device has been installed successfully",
      })

      // 重置表單
      setDeviceName("")
      setDeviceType("")
      setDeviceSize("1")
      setStartPosition("1")
      setDeviceModel("")
      setDeviceStatus("Active")
      setDeviceDescription("")
      setIpAddresses([{ address: "", type: "Management" }])
      setSelectedService(null)

      // 調用成功回調
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to install device",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const availableStartPositions = getAvailableStartPositions()

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="block text-sm font-medium mb-1">Device Name</Label>
          <Input
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            placeholder="Enter device name"
            required
          />
        </div>
        <div>
          <Label className="block text-sm font-medium mb-1">Device Type</Label>
          <Input
            value={deviceType}
            onChange={(e) => setDeviceType(e.target.value)}
            placeholder="Server, Switch, Router, etc."
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="block text-sm font-medium mb-1">Device Size (U)</Label>
          <Input
            type="number"
            min="1"
            max="42"
            value={deviceSize}
            onChange={(e) => setDeviceSize(e.target.value)}
            placeholder="Size in rack units"
            required
          />
        </div>
        <div>
          <Label className="block text-sm font-medium mb-1">Start Position (U)</Label>
          <Select value={startPosition} onValueChange={setStartPosition}>
            <SelectTrigger>
              <SelectValue placeholder="Select start position" />
            </SelectTrigger>
            <SelectContent>
              {availableStartPositions.map((pos) => (
                <SelectItem key={pos} value={pos.toString()}>
                  U{pos}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {availableStartPositions.length === 0 && (
            <p className="text-xs text-red-500 mt-1">No available positions for this device size</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="block text-sm font-medium mb-1">Model</Label>
          <Input value={deviceModel} onChange={(e) => setDeviceModel(e.target.value)} placeholder="Device model" />
        </div>
        <div>
          <Label className="block text-sm font-medium mb-1">Status</Label>
          <Select
            value={deviceStatus}
            onValueChange={(value: "Active" | "Inactive" | "Maintenance" | "Decommissioned") => setDeviceStatus(value)}
          >
            <SelectTrigger>
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
      </div>

      <div className="space-y-2">
        <Label className="block text-sm font-medium mb-1">Associated Service</Label>
        <Select
          value={selectedService || ""}
          onValueChange={(value) => setSelectedService(value === "" ? null : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a service (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {services.map((service) => (
              <SelectItem key={service.id} value={service.id}>
                {service.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="block text-sm font-medium mb-1">Description</Label>
        <Textarea
          value={deviceDescription}
          onChange={(e) => setDeviceDescription(e.target.value)}
          placeholder="Device description"
          rows={3}
        />
      </div>

      <div>
        <Label className="block text-sm font-medium mb-2">IP Addresses</Label>
        {ipAddresses.map((ip, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <Input
              value={ip.address}
              onChange={(e) => handleIpChange(index, "address", e.target.value)}
              placeholder="IP Address"
              className="flex-1"
            />
            <Select value={ip.type} onValueChange={(value) => handleIpChange(index, "type", value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Management">Management</SelectItem>
                <SelectItem value="Service">Service</SelectItem>
                <SelectItem value="Backup">Backup</SelectItem>
              </SelectContent>
            </Select>
            <Button type="button" variant="outline" size="icon" onClick={() => removeIpAddress(index)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addIpAddress} className="mt-2">
          <Plus className="h-4 w-4 mr-2" /> Add IP Address
        </Button>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting || availableStartPositions.length === 0}>
          {isSubmitting ? "Installing..." : "Install Device"}
        </Button>
      </div>
    </form>
  )
}
