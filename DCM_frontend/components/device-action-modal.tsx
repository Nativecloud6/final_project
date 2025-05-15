"use client"

import type React from "react"

import { useState } from "react"

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

interface DeviceActionModalProps {
  isOpen: boolean
  onClose: () => void
  actionType: "install" | "uninstall" | "move" | null
  deviceId: string | null
}

export function DeviceActionModal({ isOpen, onClose, actionType, deviceId }: DeviceActionModalProps) {
  const [room, setRoom] = useState("")
  const [rack, setRack] = useState("")
  const [startUnit, setStartUnit] = useState("")
  const [endUnit, setEndUnit] = useState("")
  const [deviceName, setDeviceName] = useState("")
  const [deviceModel, setDeviceModel] = useState("")
  const [ipAddress, setIpAddress] = useState("")

  // Mock data
  const rooms = ["Room 1", "Room 2", "Room 3"]
  const racks = {
    "Room 1": ["R1", "R2", "R3", "R4", "R5", "R6"],
    "Room 2": ["R1", "R2", "R3", "R4"],
    "Room 3": ["R1", "R2", "R3"],
  }
  const unitOptions = Array.from({ length: 42 }, (_, i) => i + 1)

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you would handle the action here
    onClose()
  }

  const availableRacks = room ? (racks as any)[room] || [] : []

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{getTitle()}</DialogTitle>
            <DialogDescription>{getDescription()}</DialogDescription>
          </DialogHeader>

          <div className="mt-4 grid gap-4 py-4">
            {actionType === "install" && deviceId === "new" && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="deviceName" className="text-right">
                    Device Name
                  </Label>
                  <Input
                    id="deviceName"
                    value={deviceName}
                    onChange={(e) => setDeviceName(e.target.value)}
                    className="col-span-3"
                    required
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="deviceModel" className="text-right">
                    Model
                  </Label>
                  <Input
                    id="deviceModel"
                    value={deviceModel}
                    onChange={(e) => setDeviceModel(e.target.value)}
                    className="col-span-3"
                    required
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="ipAddress" className="text-right">
                    IP Address
                  </Label>
                  <Input
                    id="ipAddress"
                    value={ipAddress}
                    onChange={(e) => setIpAddress(e.target.value)}
                    className="col-span-3"
                    required
                  />
                </div>
              </>
            )}

            {(actionType === "install" || actionType === "move") && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="room" className="text-right">
                    Room
                  </Label>
                  <Select value={room} onValueChange={setRoom}>
                    <SelectTrigger id="room" className="col-span-3">
                      <SelectValue placeholder="Select Room" />
                    </SelectTrigger>
                    <SelectContent>
                      {rooms.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="rack" className="text-right">
                    Rack
                  </Label>
                  <Select value={rack} onValueChange={setRack} disabled={!room}>
                    <SelectTrigger id="rack" className="col-span-3">
                      <SelectValue placeholder="Select Rack" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRacks.map((r: string) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Position</Label>
                  <div className="col-span-3 flex items-center gap-2">
                    <Select value={startUnit} onValueChange={setStartUnit}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Start U" />
                      </SelectTrigger>
                      <SelectContent>
                        {unitOptions.map((unit) => (
                          <SelectItem key={unit} value={unit.toString()}>
                            U{unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span>to</span>
                    <Select value={endUnit} onValueChange={setEndUnit}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="End U" />
                      </SelectTrigger>
                      <SelectContent>
                        {unitOptions.map((unit) => (
                          <SelectItem key={unit} value={unit.toString()}>
                            U{unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}

            {actionType === "uninstall" && (
              <div className="py-4 text-center text-sm">
                Are you sure you want to uninstall this device? The device will be removed from its current rack and
                marked as uninstalled.
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
