"use client"

import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useDataCenterStore } from "@/lib/data-center-store"
import type { Rack } from "@/models/data-center"

interface RackVisualizerProps {
  rack: Rack
}

export function RackVisualizer({ rack }: RackVisualizerProps) {
  const { getDevice } = useDataCenterStore()

  // 創建一個從底部到頂部的單元數組
  const rackUnits = [...rack.units].reverse()

  // 獲取設備信息
  const getDeviceInfo = (unitPosition: number) => {
    const unit = rack.units[unitPosition - 1]
    if (!unit || !unit.deviceId) return null

    // 獲取完整的設備信息
    const deviceDetails = getDevice(unit.deviceId)

    // 找到設備佔用的所有單元
    const deviceUnits = rack.units.filter((u) => u.deviceId === unit.deviceId)
    const positions = deviceUnits.map((u) => u.position).sort((a, b) => a - b)

    return {
      id: unit.deviceId,
      name: unit.deviceName || "Unknown Device",
      ip: unit.deviceIp,
      startPosition: Math.min(...positions),
      endPosition: Math.max(...positions),
      size: unit.deviceSize || positions.length,
      type: deviceDetails?.type || "Unknown",
      status: deviceDetails?.status || "Active",
      powerConsumption: deviceDetails?.powerConsumption,
      ips: deviceDetails?.ips || [],
    }
  }

  // 檢查單元是否是設備的第一個單元
  const isFirstUnitOfDevice = (position: number) => {
    const unit = rack.units[position - 1]
    if (!unit || !unit.deviceId) return false

    const deviceUnits = rack.units.filter((u) => u.deviceId === unit.deviceId)
    const minPosition = Math.min(...deviceUnits.map((u) => u.position))

    return position === minPosition
  }

  // 獲取設備顏色
  const getDeviceColor = (deviceId: string | null, status?: string) => {
    if (!deviceId) return ""

    // 根據狀態設置顏色
    if (status === "Maintenance") return "hsl(40, 70%, 30%)" // 黃色
    if (status === "Inactive") return "hsl(0, 70%, 30%)" // 紅色
    if (status === "Decommissioned") return "hsl(0, 0%, 50%)" // 灰色

    // 根據設備ID生成一致的顏色
    const hash = deviceId.split("").reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc)
    }, 0)

    const hue = hash % 360
    return `hsl(${hue}, 70%, 30%)`
  }

  return (
    <TooltipProvider>
      <div className="border rounded-md overflow-hidden">
        <div className="bg-muted p-2 text-center font-medium border-b">{rack.name} - Front View</div>
        <div className="p-4">
          <div className="flex flex-col border rounded-md overflow-hidden">
            {rackUnits.map((unit) => {
              const deviceInfo = unit.deviceId ? getDeviceInfo(unit.position) : null
              const isFirstUnit = isFirstUnitOfDevice(unit.position)
              const deviceColor = getDeviceColor(unit.deviceId, deviceInfo?.status)

              return (
                <div
                  key={unit.position}
                  className={`flex items-center border-b last:border-b-0 h-8 ${
                    unit.deviceId ? "bg-primary/10" : "bg-background"
                  }`}
                  style={unit.deviceId ? { backgroundColor: `${deviceColor}20` } : undefined}
                >
                  <div className="w-8 h-full flex items-center justify-center border-r bg-muted text-xs font-medium">
                    {unit.position}
                  </div>
                  <div className="flex-1 px-3 py-1">
                    {unit.deviceId ? (
                      isFirstUnit ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2 truncate">
                                <span className="font-medium truncate">{unit.deviceName}</span>
                                {unit.deviceIp && (
                                  <span className="text-xs text-muted-foreground truncate">({unit.deviceIp})</span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 ml-2 shrink-0">
                                <Badge
                                  variant="outline"
                                  className="text-xs"
                                  style={{ borderColor: deviceColor, color: deviceColor }}
                                >
                                  {deviceInfo?.size}U
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className="text-xs"
                                  style={{
                                    borderColor: deviceColor,
                                    color: deviceColor,
                                    backgroundColor: `${deviceColor}10`,
                                  }}
                                >
                                  {deviceInfo?.status}
                                </Badge>
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="w-80">
                            <div className="space-y-2">
                              <div>
                                <p className="font-medium text-base">{unit.deviceName}</p>
                                <p className="text-xs text-muted-foreground">
                                  Type: {deviceInfo?.type} | Status: {deviceInfo?.status}
                                </p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs">
                                  Position: U{deviceInfo?.startPosition} - U{deviceInfo?.endPosition} (
                                  {deviceInfo?.size}U)
                                </p>
                                {deviceInfo?.powerConsumption && (
                                  <p className="text-xs">Power: {deviceInfo.powerConsumption}W</p>
                                )}
                              </div>
                              {deviceInfo?.ips && deviceInfo.ips.length > 0 && (
                                <div className="space-y-1">
                                  <p className="text-xs font-medium">IP Addresses:</p>
                                  <ul className="text-xs space-y-1">
                                    {deviceInfo.ips.map((ip, index) => (
                                      <li key={index}>
                                        {ip.address} ({ip.subnet})
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <span className="text-xs text-muted-foreground">↑ {unit.deviceName}</span>
                      )
                    ) : (
                      <span className="text-xs text-muted-foreground">Empty</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
