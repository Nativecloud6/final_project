"use client"

import { useState } from "react"
import { ArrowUpDown, Filter, Plus, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ipAddresses, ipSubnets } from "@/models/data-center"
import { IPActionModal } from "@/components/ip-action-modal"
import { IPSubnetModal } from "@/components/ip-subnet-modal"

export default function IPManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [subnetFilter, setSubnetFilter] = useState("all")
  const [selectedIP, setSelectedIP] = useState<string | null>(null)
  const [isIPModalOpen, setIsIPModalOpen] = useState(false)
  const [isSubnetModalOpen, setIsSubnetModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("addresses")

  // Filter IP addresses based on search query and filters
  const filteredIPs = ipAddresses.filter((ip) => {
    const matchesSearch =
      ip.address.includes(searchQuery) ||
      ip.deviceName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      "" ||
      ip.serviceName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      "" ||
      ip.subnet.includes(searchQuery)

    const matchesStatus = statusFilter === "all" || ip.status.toLowerCase() === statusFilter.toLowerCase()
    const matchesSubnet = subnetFilter === "all" || ip.subnet === subnetFilter

    return matchesSearch && matchesStatus && matchesSubnet
  })

  const handleIPClick = (ip: string) => {
    setSelectedIP(ip)
    setIsIPModalOpen(true)
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Assigned":
        return "bg-blue-900/30 text-blue-200"
      case "Available":
        return "bg-green-900/30 text-green-200"
      case "Reserved":
        return "bg-yellow-900/30 text-yellow-200"
      case "Deprecated":
        return "bg-red-900/30 text-red-200"
      default:
        return "bg-gray-700 text-gray-200"
    }
  }

  return (
    <div className="space-y-4 w-full max-w-none">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">IP Management</h1>
        <div className="flex gap-2">
          <Button onClick={() => setIsSubnetModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Add Subnet
          </Button>
        </div>
      </div>

      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="addresses">IP Addresses</TabsTrigger>
          <TabsTrigger value="subnets">Subnets</TabsTrigger>
        </TabsList>

        <TabsContent value="addresses">
          <Card className="w-full">
            <CardHeader className="pb-3">
              <CardTitle>IP Address Pool</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Input
                  placeholder="Search IP addresses, devices, or services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="sm:max-w-xs"
                />

                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="assigned">Assigned</SelectItem>
                      <SelectItem value="reserved">Reserved</SelectItem>
                      <SelectItem value="deprecated">Deprecated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={subnetFilter} onValueChange={setSubnetFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by subnet" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subnets</SelectItem>
                      {ipSubnets.map((subnet) => (
                        <SelectItem key={subnet.id} value={subnet.subnet}>
                          {subnet.subnet}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-md border bg-[hsl(224,50%,18%)] w-full overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">
                        <Button variant="ghost" className="p-0 font-medium">
                          IP Address <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>Subnet</TableHead>
                      <TableHead>Device</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredIPs.map((ip) => (
                      <TableRow key={ip.id}>
                        <TableCell className="font-medium">{ip.address}</TableCell>
                        <TableCell>{ip.subnet}</TableCell>
                        <TableCell>{ip.deviceName || "-"}</TableCell>
                        <TableCell>{ip.serviceName || "-"}</TableCell>
                        <TableCell>
                          <Badge className={`${getStatusBadgeColor(ip.status)}`}>{ip.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleIPClick(ip.id)}>
                            {ip.status === "Available" ? "Assign" : "Manage"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subnets">
          <Card className="w-full">
            <CardHeader className="pb-3">
              <CardTitle>Subnet Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border bg-[hsl(224,50%,18%)] w-full overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subnet</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Total IPs</TableHead>
                      <TableHead>Used</TableHead>
                      <TableHead>Available</TableHead>
                      <TableHead>Reserved</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ipSubnets.map((subnet) => (
                      <TableRow key={subnet.id}>
                        <TableCell className="font-medium">{subnet.subnet}</TableCell>
                        <TableCell>{subnet.description}</TableCell>
                        <TableCell>{subnet.totalIPs}</TableCell>
                        <TableCell>{subnet.usedIPs}</TableCell>
                        <TableCell>{subnet.availableIPs}</TableCell>
                        <TableCell>{subnet.reservedIPs}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm">
                              Manage
                            </Button>
                            <Button variant="ghost" size="sm" className="text-blue-400">
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <IPActionModal
        isOpen={isIPModalOpen}
        onClose={() => setIsIPModalOpen(false)}
        ipId={selectedIP}
        ipAddresses={ipAddresses}
      />

      <IPSubnetModal isOpen={isSubnetModalOpen} onClose={() => setIsSubnetModalOpen(false)} />
    </div>
  )
}
