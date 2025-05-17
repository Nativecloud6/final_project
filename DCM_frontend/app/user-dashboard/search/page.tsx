"use client"

import { useState } from "react"
import { SearchIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { devices, services, ipAddresses } from "@/models/data-center"
import { UserServiceDetailModal } from "@/components/user-service-detail-modal"
import { UserIPDetailModal } from "@/components/user-ip-detail-modal"
import { UserDeviceDetailModal } from "@/components/user-device-detail-modal"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function UserSearch() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false)
  const [selectedIP, setSelectedIP] = useState<string | null>(null)
  const [isIPModalOpen, setIsIPModalOpen] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null)
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false)

  // Advanced search filters
  const [deviceTypeFilter, setDeviceTypeFilter] = useState("any")
  const [locationFilter, setLocationFilter] = useState("any")
  const [ipRangeFilter, setIpRangeFilter] = useState("any")
  const [statusFilter, setStatusFilter] = useState("any")

  // 過濾結果
  const filteredDevices = devices.filter((device) => {
    const matchesSearch =
      searchQuery === "" ||
      device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.serviceName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.ips.some((ip) => ip.address.includes(searchQuery))

    // Apply advanced filters if they are set
    const matchesType = deviceTypeFilter === "any" || device.model.includes(deviceTypeFilter)
    const matchesStatus = statusFilter === "any" || device.status === statusFilter
    const matchesLocation = locationFilter === "any" || true // We would need location data in the device model
    const matchesIpRange =
      ipRangeFilter === "any" ||
      device.ips.some((ip) => {
        // Simple implementation - would need more sophisticated IP range checking in production
        if (ipRangeFilter === "10.0.0.0") return ip.address.startsWith("10.")
        if (ipRangeFilter === "192.168.0.0") return ip.address.startsWith("192.168.")
        return true
      })

    return matchesSearch && matchesType && matchesStatus && matchesLocation && matchesIpRange
  })

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      searchQuery === "" ||
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.owner?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.department?.toLowerCase().includes(searchQuery.toLowerCase())

    // Apply advanced filters
    const matchesStatus = statusFilter === "any" || service.status === statusFilter
    const matchesLocation = locationFilter === "any" || true // Would need location data

    return matchesSearch && matchesStatus && matchesLocation
  })

  const filteredIPs = ipAddresses.filter((ip) => {
    const matchesSearch =
      searchQuery === "" ||
      ip.address.includes(searchQuery) ||
      ip.subnet.includes(searchQuery) ||
      ip.deviceName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ip.serviceName?.toLowerCase().includes(searchQuery.toLowerCase())

    // Apply advanced filters
    const matchesStatus = statusFilter === "any" || ip.status === statusFilter
    const matchesIpRange =
      ipRangeFilter === "any" ||
      (() => {
        // Simple implementation - would need more sophisticated IP range checking in production
        if (ipRangeFilter === "10.0.0.0") return ip.address.startsWith("10.")
        if (ipRangeFilter === "192.168.0.0") return ip.address.startsWith("192.168.")
        return true
      })()

    return matchesSearch && matchesStatus && matchesIpRange
  })

  const handleServiceClick = (serviceId: string) => {
    setSelectedService(serviceId)
    setIsServiceModalOpen(true)
  }

  const handleIPClick = (ipId: string) => {
    setSelectedIP(ipId)
    setIsIPModalOpen(true)
  }

  const handleDeviceClick = (deviceId: string) => {
    setSelectedDevice(deviceId)
    setIsDeviceModalOpen(true)
  }

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

  const clearFilters = () => {
    setDeviceTypeFilter("any")
    setLocationFilter("any")
    setIpRangeFilter("any")
    setStatusFilter("any")
    setSearchQuery("")
  }

  return (
    <div className="space-y-4 w-full max-w-none">
      <h1 className="text-3xl font-bold text-foreground">搜尋服務</h1>

      <Card className="w-full bg-[#111827] border-0">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-6">搜尋</h2>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
            <div className="lg:col-span-7">
              <Input
                placeholder="搜尋設備、IP地址、服務..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 bg-[#1a2035] border-[#2e3650]"
              />
            </div>

            <div className="lg:col-span-3">
              <div className="h-12 bg-[#1a2035] border border-[#2e3650] rounded-md flex items-center px-4 text-lg font-medium">
                進階搜尋
              </div>
            </div>

            <div className="lg:col-span-2">
              <Button className="w-full h-12 bg-[#3b82f6] hover:bg-[#2563eb] text-white">
                <SearchIcon className="mr-2 h-5 w-5" />
                搜尋
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">設備類型</label>
              <Select value={deviceTypeFilter} onValueChange={setDeviceTypeFilter}>
                <SelectTrigger className="h-12 bg-[#1a2035] border-[#2e3650]">
                  <SelectValue placeholder="任何" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">任何</SelectItem>
                  <SelectItem value="Dell">Dell</SelectItem>
                  <SelectItem value="HP">HP</SelectItem>
                  <SelectItem value="NetApp">NetApp</SelectItem>
                  <SelectItem value="Cisco">Cisco</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">位置</label>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="h-12 bg-[#1a2035] border-[#2e3650]">
                  <SelectValue placeholder="任何" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">任何</SelectItem>
                  <SelectItem value="dc-a">DC-A</SelectItem>
                  <SelectItem value="dc-b">DC-B</SelectItem>
                  <SelectItem value="room-1">機房 1</SelectItem>
                  <SelectItem value="room-2">機房 2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">IP 範圍</label>
              <Select value={ipRangeFilter} onValueChange={setIpRangeFilter}>
                <SelectTrigger className="h-12 bg-[#1a2035] border-[#2e3650]">
                  <SelectValue placeholder="任何" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">任何</SelectItem>
                  <SelectItem value="10.0.0.0">10.0.0.0/8</SelectItem>
                  <SelectItem value="192.168.0.0">192.168.0.0/16</SelectItem>
                  <SelectItem value="172.16.0.0">172.16.0.0/12</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">狀態</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-12 bg-[#1a2035] border-[#2e3650]">
                  <SelectValue placeholder="任何" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">任何</SelectItem>
                  <SelectItem value="Active">活躍</SelectItem>
                  <SelectItem value="Inactive">非活躍</SelectItem>
                  <SelectItem value="Maintenance">維護中</SelectItem>
                  <SelectItem value="Decommissioned">已停用</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={clearFilters} className="border-[#2e3650] hover:bg-[#1a2035]">
              清除
            </Button>
          </div>
        </CardContent>
      </Card>

      {(searchQuery !== "" ||
        deviceTypeFilter !== "any" ||
        locationFilter !== "any" ||
        ipRangeFilter !== "any" ||
        statusFilter !== "any") && (
        <Card className="w-full">
          <CardContent className="p-6">
            <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="all">
                  所有結果 ({filteredDevices.length + filteredServices.length + filteredIPs.length})
                </TabsTrigger>
                <TabsTrigger value="devices">設備 ({filteredDevices.length})</TabsTrigger>
                <TabsTrigger value="services">服務 ({filteredServices.length})</TabsTrigger>
                <TabsTrigger value="ips">IP地址 ({filteredIPs.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                {filteredDevices.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-2">設備</h3>
                    <div className="rounded-md border bg-[hsl(224,50%,18%)] w-full overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>設備名稱</TableHead>
                            <TableHead>型號</TableHead>
                            <TableHead>服務</TableHead>
                            <TableHead>狀態</TableHead>
                            <TableHead>IP地址</TableHead>
                            <TableHead className="text-right">操作</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredDevices.slice(0, 3).map((device) => (
                            <TableRow key={device.id}>
                              <TableCell className="font-medium">{device.name}</TableCell>
                              <TableCell>{device.model}</TableCell>
                              <TableCell>{device.serviceName || "-"}</TableCell>
                              <TableCell>
                                <Badge className={`${getStatusBadgeColor(device.status)}`}>{device.status}</Badge>
                              </TableCell>
                              <TableCell>
                                {device.ips.map((ip) => (
                                  <div key={ip.id}>{ip.address}</div>
                                ))}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="sm" onClick={() => handleDeviceClick(device.id)}>
                                  查看詳情
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {filteredDevices.length > 3 && (
                      <div className="mt-2 text-right">
                        <Button variant="link" onClick={() => setActiveTab("devices")}>
                          查看全部 {filteredDevices.length} 個設備
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {filteredServices.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-2">服務</h3>
                    <div className="rounded-md border bg-[hsl(224,50%,18%)] w-full overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>服務名稱</TableHead>
                            <TableHead>描述</TableHead>
                            <TableHead>狀態</TableHead>
                            <TableHead className="text-right">操作</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredServices.slice(0, 3).map((service) => (
                            <TableRow key={service.id}>
                              <TableCell className="font-medium">{service.name}</TableCell>
                              <TableCell>{service.description}</TableCell>
                              <TableCell>
                                <Badge className={`${getStatusBadgeColor(service.status)}`}>{service.status}</Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="sm" onClick={() => handleServiceClick(service.id)}>
                                  查看詳情
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {filteredServices.length > 3 && (
                      <div className="mt-2 text-right">
                        <Button variant="link" onClick={() => setActiveTab("services")}>
                          查看全部 {filteredServices.length} 個服務
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {filteredIPs.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">IP地址</h3>
                    <div className="rounded-md border bg-[hsl(224,50%,18%)] w-full overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>IP地址</TableHead>
                            <TableHead>子網</TableHead>
                            <TableHead>設備</TableHead>
                            <TableHead>狀態</TableHead>
                            <TableHead className="text-right">操作</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredIPs.slice(0, 3).map((ip) => (
                            <TableRow key={ip.id}>
                              <TableCell className="font-medium">{ip.address}</TableCell>
                              <TableCell>{ip.subnet}</TableCell>
                              <TableCell>{ip.deviceName || "-"}</TableCell>
                              <TableCell>
                                <Badge className={`${getStatusBadgeColor(ip.status)}`}>{ip.status}</Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="sm" onClick={() => handleIPClick(ip.id)}>
                                  查看詳情
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {filteredIPs.length > 3 && (
                      <div className="mt-2 text-right">
                        <Button variant="link" onClick={() => setActiveTab("ips")}>
                          查看全部 {filteredIPs.length} 個IP地址
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {filteredDevices.length === 0 && filteredServices.length === 0 && filteredIPs.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">沒有找到與 "{searchQuery}" 相關的結果</div>
                )}
              </TabsContent>

              <TabsContent value="devices">
                <div className="rounded-md border bg-[hsl(224,50%,18%)] w-full overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>設備名稱</TableHead>
                        <TableHead>型號</TableHead>
                        <TableHead>服務</TableHead>
                        <TableHead>狀態</TableHead>
                        <TableHead>IP地址</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDevices.length > 0 ? (
                        filteredDevices.map((device) => (
                          <TableRow key={device.id}>
                            <TableCell className="font-medium">{device.name}</TableCell>
                            <TableCell>{device.model}</TableCell>
                            <TableCell>{device.serviceName || "-"}</TableCell>
                            <TableCell>
                              <Badge className={`${getStatusBadgeColor(device.status)}`}>{device.status}</Badge>
                            </TableCell>
                            <TableCell>
                              {device.ips.map((ip) => (
                                <div key={ip.id}>{ip.address}</div>
                              ))}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" onClick={() => handleDeviceClick(device.id)}>
                                查看詳情
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                            沒有找到與 "{searchQuery}" 相關的設備
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="services">
                <div className="rounded-md border bg-[hsl(224,50%,18%)] w-full overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>服務名稱</TableHead>
                        <TableHead>描述</TableHead>
                        <TableHead>部門</TableHead>
                        <TableHead>狀態</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredServices.length > 0 ? (
                        filteredServices.map((service) => (
                          <TableRow key={service.id}>
                            <TableCell className="font-medium">{service.name}</TableCell>
                            <TableCell>{service.description}</TableCell>
                            <TableCell>{service.department || "-"}</TableCell>
                            <TableCell>
                              <Badge className={`${getStatusBadgeColor(service.status)}`}>{service.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" onClick={() => handleServiceClick(service.id)}>
                                查看詳情
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                            沒有找到與 "{searchQuery}" 相關的服務
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
                        <TableHead>IP地址</TableHead>
                        <TableHead>子網</TableHead>
                        <TableHead>設備</TableHead>
                        <TableHead>服務</TableHead>
                        <TableHead>狀態</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredIPs.length > 0 ? (
                        filteredIPs.map((ip) => (
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
                                查看詳情
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                            沒有找到與 "{searchQuery}" 相關的IP地址
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      <UserServiceDetailModal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        serviceId={selectedService}
        services={services}
      />

      <UserIPDetailModal
        isOpen={isIPModalOpen}
        onClose={() => setIsIPModalOpen(false)}
        ipId={selectedIP}
        ipAddresses={ipAddresses}
      />

      <UserDeviceDetailModal
        isOpen={isDeviceModalOpen}
        onClose={() => setIsDeviceModalOpen(false)}
        deviceId={selectedDevice}
        devices={devices}
      />
    </div>
  )
}
