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

interface IPSubnetModalProps {
  isOpen: boolean
  onClose: () => void
}

export function IPSubnetModal({ isOpen, onClose }: IPSubnetModalProps) {
  const [subnet, setSubnet] = useState("")
  const [description, setDescription] = useState("")
  const [cidr, setCidr] = useState("24")
  const [gateway, setGateway] = useState("")
  const [reservedCount, setReservedCount] = useState("10")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you would add the subnet here
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Subnet</DialogTitle>
          <DialogDescription>Create a new IP subnet for your network</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="subnet" className="text-right">
              Network Address
            </Label>
            <div className="col-span-3 flex items-center gap-2">
              <Input
                id="subnet"
                value={subnet}
                onChange={(e) => setSubnet(e.target.value)}
                placeholder="e.g., 192.168.3.0"
                className="flex-1"
                required
              />
              <span>/</span>
              <Select value={cidr} onValueChange={setCidr}>
                <SelectTrigger className="w-[80px]">
                  <SelectValue placeholder="CIDR" />
                </SelectTrigger>
                <SelectContent>
                  {[16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30].map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              placeholder="e.g., Development Network"
              required
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="gateway" className="text-right">
              Gateway
            </Label>
            <Input
              id="gateway"
              value={gateway}
              onChange={(e) => setGateway(e.target.value)}
              className="col-span-3"
              placeholder="e.g., 192.168.3.1"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reserved" className="text-right">
              Reserved IPs
            </Label>
            <Input
              id="reserved"
              type="number"
              min="0"
              value={reservedCount}
              onChange={(e) => setReservedCount(e.target.value)}
              className="col-span-3"
            />
          </div>

          <div className="rounded-md bg-blue-900/30 p-3 text-sm text-blue-200">
            <p className="font-medium">Subnet Information</p>
            <p>
              A /{cidr} network has {Math.pow(2, 32 - Number.parseInt(cidr))} total addresses with{" "}
              {Math.pow(2, 32 - Number.parseInt(cidr)) - 2} usable addresses.
            </p>
          </div>
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit}>
            Add Subnet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
