"use client"

import { useState } from "react"
import { ArrowUpDown, Download, Plus, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DeviceActionModal } from "@/components/device-action-modal"

export default function DeviceManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [actionType, setActionType] = useState<"install" | "uninstall" | "move" | null>(null)
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null)

  // Mock device data
  const devices = [
    {
      id: "dev1",
      name: "Web Server 1",
      model: "Dell R740",
      ip: "192.168.1.10",
      status: "Installed",
      location: "Room 1 - R5",
    },
    {
      id: "dev2",
      name: "Database Server",
      model: "HP DL380",
      ip: "192.168.1.11",
      status: "Installed",
      location: "Room 1 - R5",
    },
    {
      id: "dev3",
      name: "Storage Array",
      model: "NetApp FAS",
      ip: "192.168.1.12",
      status: "Installed",
      location: "Room 2 - R3",
    },
    {
      id: "dev4",
      name: "Backup Server",
      model: "Dell R640",
      ip: "192.168.1.13",
      status: "Uninstalled",
      location: "Storage",
    },
    {
      id: "dev5",
      name: "Web Server 2",
      model: "Dell R740",
      ip: "192.168.1.14",
      status: "Installed",
      location: "Room 1 - R6",
    },
    {
      id: "dev6",
      name: "Application Server",
      model: "HP DL360",
      ip: "192.168.1.15",
      status: "Installed",
      location: "Room 3 - R2",
    },
    {
      id: "dev7",
      name: "Monitoring Server",
      model: "Dell R640",
      ip: "192.168.1.16",
      status: "Uninstalled",
      location: "Storage",
    },
  ]

  const filteredDevices = devices.filter(
    (device) =>
      device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.ip.includes(searchQuery) ||
      device.location.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleAction = (type: "install" | "uninstall" | "move", deviceId: string) => {
    setActionType(type)
    setSelectedDevice(deviceId)
  }

  const closeModal = () => {
    setActionType(null)
    setSelectedDevice(null)
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
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDevices.map((device) => (
                  <TableRow key={device.id}>
                    <TableCell className="font-medium">{device.name}</TableCell>
                    <TableCell>{device.model}</TableCell>
                    <TableCell>{device.ip}</TableCell>
                    <TableCell>{device.location}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          device.status === "Installed" ? "bg-green-900/30 text-green-200" : "bg-gray-700 text-gray-200"
                        }`}
                      >
                        {device.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {device.status === "Installed" ? (
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
                ))}
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
