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
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDataCenterStore } from "@/lib/data-center-store"
import { toast } from "@/components/ui/use-toast"
import { AddDeviceForm } from "@/components/add-device-form"
import type { DataCenter } from "@/models/data-center"

interface UserDeviceActionModalProps {
  isOpen: boolean
  onClose: () => void
  actionType: "install" | "uninstall" | "move"
  onSuccess?: () => void
  dataCenters: DataCenter[]
  deviceId?: string | null
}

export function UserDeviceActionModal({
  isOpen,
  onClose,
  actionType,
  onSuccess,
  dataCenters,
  deviceId,
}: UserDeviceActionModalProps) {
  // 獲取所有服務
  const { findRack, getDevice, getAllDevices, getAllServices, moveDevice, deleteDevice } = useDataCenterStore()
  const services = getAllServices ? getAllServices() : []

  // 選擇的數據中心、房間和機櫃
  const [selectedDataCenter, setSelectedDataCenter] = useState<string>("")
  const [selectedRoom, setSelectedRoom] = useState<string>("")
  const [selectedRack, setSelectedRack] = useState<string>("")

  // 選擇的設備
  const [selectedDevice, setSelectedDevice] = useState<string>("")

  // 目標位置（用於移動設備）
  const [targetDataCenter, setTargetDataCenter] = useState<string>("")
  const [targetRoom, setTargetRoom] = useState<string>("")
  const [targetRack, setTargetRack] = useState<string>("")
  const [targetPosition, setTargetPosition] = useState<string>("")

  // 處理中狀態
  const [isProcessing, setIsProcessing] = useState(false)

  // 所有設備列表
  const allDevices = getAllDevices ? getAllDevices() : []

  // 重置表單
  const resetForm = () => {
    setSelectedDataCenter("")
    setSelectedRoom("")
    setSelectedRack("")
    setSelectedDevice("")
    setTargetDataCenter("")
    setTargetRoom("")
    setTargetRack("")
    setTargetPosition("")
    setIsProcessing(false)
  }

  // 當模態框打開時重置表單
  useEffect(() => {
    if (isOpen) {
      resetForm()

      // 如果有數據中心，預設選擇第一個
      if (dataCenters.length > 0) {
        setSelectedDataCenter(dataCenters[0].id)

        if (actionType === "move") {
          setTargetDataCenter(dataCenters[0].id)
        }
      }

      // 如果有傳入設備ID，則設置為選中的設備
      if (deviceId) {
        setSelectedDevice(deviceId)

        // 如果是卸載或移動操作，需要找到設備所在的機櫃
        if (actionType === "uninstall" || actionType === "move") {
          // 查找設備所在的機櫃
          for (const dc of dataCenters) {
            let found = false
            for (const room of dc.rooms) {
              for (const rack of room.racks) {
                for (const unit of rack.units) {
                  if (unit.deviceId === deviceId) {
                    setSelectedDataCenter(dc.id)
                    setSelectedRoom(room.id)
                    setSelectedRack(rack.id)
                    found = true
                    break
                  }
                }
                if (found) break
              }
              if (found) break
            }
            if (found) break
          }
        }
      }
    }
  }, [isOpen, dataCenters, actionType, deviceId])

  // 當選擇數據中心時，預設選擇第一個房間
  useEffect(() => {
    if (selectedDataCenter) {
      const dc = dataCenters.find((dc) => dc.id === selectedDataCenter)
      if (dc && dc.rooms.length > 0) {
        setSelectedRoom(dc.rooms[0].id)
      }
    }
  }, [selectedDataCenter, dataCenters])

  // 當選擇房間時，預設選擇第一個機櫃
  useEffect(() => {
    if (selectedDataCenter && selectedRoom) {
      const dc = dataCenters.find((dc) => dc.id === selectedDataCenter)
      const room = dc?.rooms.find((r) => r.id === selectedRoom)
      if (room && room.racks.length > 0) {
        setSelectedRack(room.racks[0].id)
      }
    }
  }, [selectedRoom, selectedDataCenter, dataCenters])

  // 當選擇目標數據中心時，預設選擇第一個房間
  useEffect(() => {
    if (targetDataCenter) {
      const dc = dataCenters.find((dc) => dc.id === targetDataCenter)
      if (dc && dc.rooms.length > 0) {
        setTargetRoom(dc.rooms[0].id)
      }
    }
  }, [targetDataCenter, dataCenters])

  // 當選擇目標房間時，預設選擇第一個機櫃
  useEffect(() => {
    if (targetDataCenter && targetRoom) {
      const dc = dataCenters.find((dc) => dc.id === targetDataCenter)
      const room = dc?.rooms.find((r) => r.id === targetRoom)
      if (room && room.racks.length > 0) {
        setTargetRack(room.racks[0].id)
      }
    }
  }, [targetRoom, targetDataCenter, dataCenters])

  // 獲取選中的機櫃
  const getSelectedRack = () => {
    const dc = dataCenters.find((dc) => dc.id === selectedDataCenter)
    const room = dc?.rooms.find((r) => r.id === selectedRoom)
    return room?.racks.find((r) => r.id === selectedRack)
  }

  // 獲取目標機櫃
  const getTargetRack = () => {
    const dc = dataCenters.find((dc) => dc.id === targetDataCenter)
    const room = dc?.rooms.find((r) => r.id === targetRoom)
    return room?.racks.find((r) => r.id === targetRack)
  }

  // 獲取機櫃中的設備
  const getDevicesInRack = () => {
    const rack = getSelectedRack()
    if (!rack) return []

    const deviceIds = new Set<string>()
    rack.units.forEach((unit) => {
      if (unit.deviceId) {
        deviceIds.add(unit.deviceId)
      }
    })

    return Array.from(deviceIds).map((id) => {
      const device = getDevice(id)
      return {
        id,
        name: device?.name || rack.units.find((u) => u.deviceId === id)?.deviceName || "Unknown Device",
      }
    })
  }

  // 獲取目標機櫃的可用位置
  const getAvailablePositions = () => {
    const rack = getTargetRack()
    if (!rack) return []

    const device = getDevice(selectedDevice)
    const deviceSize = device?.size || 1

    const availablePositions: number[] = []
    for (let i = 1; i <= rack.totalUnits - deviceSize + 1; i++) {
      let available = true

      // 檢查從 i 開始的 deviceSize 個單元是否都可用
      for (let j = 0; j < deviceSize; j++) {
        const unit = rack.units[i + j - 1]
        if (!unit || (unit.deviceId !== null && unit.deviceId !== selectedDevice)) {
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

  // 處理卸載設備
  const handleUninstallDevice = async () => {
    if (!selectedDevice) {
      toast({
        title: "Error",
        description: "Please select a device to uninstall",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      const rackInfo = findRack(selectedRack)

      if (!rackInfo) {
        throw new Error("Rack not found")
      }

      const { datacenter, room } = rackInfo

      deleteDevice(datacenter.id, room.id, selectedRack, selectedDevice)

      toast({
        title: "Success",
        description: "Device has been uninstalled successfully",
      })

      if (onSuccess) {
        onSuccess()
      }

      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to uninstall device. Please try again.",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsProcessing(false)
    }
  }

  // 處理移動設備
  const handleMoveDevice = async () => {
    if (!selectedDevice || !targetPosition) {
      toast({
        title: "Error",
        description: "Please select a device and target position",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      // 獲取源機櫃信息
      const sourceRackInfo = findRack(selectedRack)

      if (!sourceRackInfo) {
        throw new Error("Source rack not found")
      }

      // 獲取目標機櫃信息
      const targetRackInfo = findRack(targetRack)

      if (!targetRackInfo) {
        throw new Error("Target rack not found")
      }

      // 移動設備
      moveDevice(
        sourceRackInfo.datacenter.id,
        sourceRackInfo.room.id,
        selectedRack,
        selectedDevice,
        targetRackInfo.datacenter.id,
        targetRackInfo.room.id,
        targetRack,
        Number.parseInt(targetPosition),
      )

      toast({
        title: "Success",
        description: "Device has been moved successfully",
      })

      if (onSuccess) {
        onSuccess()
      }

      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to move device: ${(error as Error).message}`,
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsProcessing(false)
    }
  }

  // 獲取模態框標題
  const getModalTitle = () => {
    switch (actionType) {
      case "install":
        return "Install New Device"
      case "uninstall":
        return "Uninstall Device"
      case "move":
        return "Move Device"
    }
  }

  // 獲取模態框描述
  const getModalDescription = () => {
    switch (actionType) {
      case "install":
        return "Add a new device to a rack"
      case "uninstall":
        return "Remove a device from a rack"
      case "move":
        return "Move a device to a different location"
    }
  }

  // 渲染安裝設備表單
  const renderInstallForm = () => {
    const rack = getSelectedRack()

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="datacenter">Data Center</Label>
            <Select value={selectedDataCenter} onValueChange={setSelectedDataCenter}>
              <SelectTrigger id="datacenter">
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
            <Label htmlFor="room">Room</Label>
            <Select value={selectedRoom} onValueChange={setSelectedRoom} disabled={!selectedDataCenter}>
              <SelectTrigger id="room">
                <SelectValue placeholder="Select room" />
              </SelectTrigger>
              <SelectContent>
                {dataCenters
                  .find((dc) => dc.id === selectedDataCenter)
                  ?.rooms.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      {room.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rack">Rack</Label>
            <Select value={selectedRack} onValueChange={setSelectedRack} disabled={!selectedRoom}>
              <SelectTrigger id="rack">
                <SelectValue placeholder="Select rack" />
              </SelectTrigger>
              <SelectContent>
                {dataCenters
                  .find((dc) => dc.id === selectedDataCenter)
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

        {rack ? (
          <AddDeviceForm
            rack={rack}
            onSuccess={onSuccess}
            dataCenterId={selectedDataCenter}
            roomId={selectedRoom}
            rackId={selectedRack}
            services={services}
          />
        ) : (
          <p className="text-muted-foreground">Please select a rack to install a device</p>
        )}
      </div>
    )
  }

  // 渲染卸載設備表單
  const renderUninstallForm = () => {
    const devices = getDevicesInRack()
    const selectedDeviceInfo = devices.find((d) => d.id === selectedDevice)

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="datacenter">Data Center</Label>
          <Select value={selectedDataCenter} onValueChange={setSelectedDataCenter}>
            <SelectTrigger id="datacenter">
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
          <Label htmlFor="room">Room</Label>
          <Select value={selectedRoom} onValueChange={setSelectedRoom}>
            <SelectTrigger id="room">
              <SelectValue placeholder="Select room" />
            </SelectTrigger>
            <SelectContent>
              {dataCenters
                .find((dc) => dc.id === selectedDataCenter)
                ?.rooms.map((room) => (
                  <SelectItem key={room.id} value={room.id}>
                    {room.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="rack">Rack</Label>
          <Select value={selectedRack} onValueChange={setSelectedRack}>
            <SelectTrigger id="rack">
              <SelectValue placeholder="Select rack" />
            </SelectTrigger>
            <SelectContent>
              {dataCenters
                .find((dc) => dc.id === selectedDataCenter)
                ?.rooms.find((room) => room.id === selectedRoom)
                ?.racks.map((rack) => (
                  <SelectItem key={rack.id} value={rack.id}>
                    {rack.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="device">Device</Label>
          <Select value={selectedDevice} onValueChange={setSelectedDevice}>
            <SelectTrigger id="device">
              <SelectValue placeholder="Select device" />
            </SelectTrigger>
            <SelectContent>
              {devices.map((device) => (
                <SelectItem key={device.id} value={device.id}>
                  {device.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedDeviceInfo && (
          <div className="p-4 border rounded-md bg-red-900/20 border-red-800 text-red-100">
            <p className="font-medium">Warning: You are about to uninstall the following device:</p>
            <p className="mt-2">{selectedDeviceInfo.name}</p>
            <p className="mt-4 text-sm">This action cannot be undone. The device will be removed from the rack.</p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleUninstallDevice} disabled={isProcessing || !selectedDevice}>
            {isProcessing ? "Uninstalling..." : "Uninstall Device"}
          </Button>
        </DialogFooter>
      </div>
    )
  }

  // 渲染移動設備表單
  const renderMoveForm = () => {
    const devices = getDevicesInRack()
    const availablePositions = getAvailablePositions()

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <h3 className="font-medium">Source Location</h3>

            <div className="space-y-2">
              <Label htmlFor="source-datacenter">Data Center</Label>
              <Select value={selectedDataCenter} onValueChange={setSelectedDataCenter}>
                <SelectTrigger id="source-datacenter">
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
              <Label htmlFor="source-room">Room</Label>
              <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                <SelectTrigger id="source-room">
                  <SelectValue placeholder="Select room" />
                </SelectTrigger>
                <SelectContent>
                  {dataCenters
                    .find((dc) => dc.id === selectedDataCenter)
                    ?.rooms.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        {room.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="source-rack">Rack</Label>
              <Select value={selectedRack} onValueChange={setSelectedRack}>
                <SelectTrigger id="source-rack">
                  <SelectValue placeholder="Select rack" />
                </SelectTrigger>
                <SelectContent>
                  {dataCenters
                    .find((dc) => dc.id === selectedDataCenter)
                    ?.rooms.find((room) => room.id === selectedRoom)
                    ?.racks.map((rack) => (
                      <SelectItem key={rack.id} value={rack.id}>
                        {rack.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="device">Device</Label>
              <Select value={selectedDevice} onValueChange={setSelectedDevice}>
                <SelectTrigger id="device">
                  <SelectValue placeholder="Select device" />
                </SelectTrigger>
                <SelectContent>
                  {devices.map((device) => (
                    <SelectItem key={device.id} value={device.id}>
                      {device.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Target Location</h3>

            <div className="space-y-2">
              <Label htmlFor="target-datacenter">Data Center</Label>
              <Select value={targetDataCenter} onValueChange={setTargetDataCenter}>
                <SelectTrigger id="target-datacenter">
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
              <Label htmlFor="target-room">Room</Label>
              <Select value={targetRoom} onValueChange={setTargetRoom}>
                <SelectTrigger id="target-room">
                  <SelectValue placeholder="Select room" />
                </SelectTrigger>
                <SelectContent>
                  {dataCenters
                    .find((dc) => dc.id === targetDataCenter)
                    ?.rooms.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        {room.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target-rack">Rack</Label>
              <Select value={targetRack} onValueChange={setTargetRack}>
                <SelectTrigger id="target-rack">
                  <SelectValue placeholder="Select rack" />
                </SelectTrigger>
                <SelectContent>
                  {dataCenters
                    .find((dc) => dc.id === targetDataCenter)
                    ?.rooms.find((room) => room.id === targetRoom)
                    ?.racks.map((rack) => (
                      <SelectItem key={rack.id} value={rack.id}>
                        {rack.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target-position">Position</Label>
              <Select
                value={targetPosition}
                onValueChange={setTargetPosition}
                disabled={!selectedDevice || availablePositions.length === 0}
              >
                <SelectTrigger id="target-position">
                  <SelectValue placeholder="Select position" />
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
                <p className="text-xs text-red-500">No available positions in the target rack</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleMoveDevice} disabled={isProcessing || !selectedDevice || !targetPosition}>
            {isProcessing ? "Moving..." : "Move Device"}
          </Button>
        </DialogFooter>
      </div>
    )
  }

  // 根據操作類型渲染不同的表單
  const renderForm = () => {
    switch (actionType) {
      case "install":
        return renderInstallForm()
      case "uninstall":
        return renderUninstallForm()
      case "move":
        return renderMoveForm()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{getModalTitle()}</DialogTitle>
          <DialogDescription>{getModalDescription()}</DialogDescription>
        </DialogHeader>
        {renderForm()}
      </DialogContent>
    </Dialog>
  )
}
