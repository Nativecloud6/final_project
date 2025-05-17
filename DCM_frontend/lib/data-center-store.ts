import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { DataCenter, Rack, Unit, IPAddress } from "@/models/data-center"

// 生成空的機架單元
function generateEmptyUnits(count: number): Unit[] {
  return Array.from({ length: count }, (_, i) => ({
    position: i + 1,
    deviceId: null,
    deviceName: null,
    deviceIp: null,
    deviceSize: 0,
    serviceId: null,
    serviceName: null,
  }))
}

// 初始數據
const initialDataCenters: DataCenter[] = [
  {
    id: "dc-1",
    name: "DC-A",
    rooms: [
      {
        id: "room-1",
        name: "Room 1",
        racks: [
          {
            id: "rack-1",
            name: "Rack 1",
            totalUnits: 42,
            units: generateEmptyUnits(42),
          },
          {
            id: "rack-2",
            name: "Rack 2",
            totalUnits: 42,
            units: generateEmptyUnits(42),
          },
          {
            id: "rack-3",
            name: "Rack 3",
            totalUnits: 42,
            units: generateEmptyUnits(42),
          },
        ],
      },
      {
        id: "room-2",
        name: "Room 2",
        racks: [
          {
            id: "rack-4",
            name: "Rack 1",
            totalUnits: 42,
            units: generateEmptyUnits(42),
          },
          {
            id: "rack-5",
            name: "Rack 2",
            totalUnits: 42,
            units: generateEmptyUnits(42),
          },
          {
            id: "rack-6",
            name: "Rack 3",
            totalUnits: 42,
            units: generateEmptyUnits(42),
          },
        ],
      },
    ],
  },
  {
    id: "dc-2",
    name: "DC-B",
    rooms: [
      {
        id: "room-3",
        name: "Room A",
        racks: [
          {
            id: "rack-7",
            name: "Rack 1",
            totalUnits: 42,
            units: generateEmptyUnits(42),
          },
          {
            id: "rack-8",
            name: "Rack 2",
            totalUnits: 42,
            units: generateEmptyUnits(42),
          },
        ],
      },
      {
        id: "room-4",
        name: "Room B",
        racks: [
          {
            id: "rack-9",
            name: "Rack 1",
            totalUnits: 42,
            units: generateEmptyUnits(42),
          },
        ],
      },
    ],
  },
]

// 設備信息接口
interface DeviceInfo {
  id: string
  name: string
  type: string
  size: number
  description?: string
  ips?: IPAddress[]
  status?: "Active" | "Inactive" | "Maintenance" | "Decommissioned"
  powerConsumption?: number | null
  installationDate?: string | null
}

// 存儲設備數據的映射
interface DeviceStore {
  [deviceId: string]: DeviceInfo
}

interface DataCenterStore {
  dataCenters: DataCenter[]
  devices: DeviceStore
  setDataCenters: (dataCenters: DataCenter[]) => void

  // 數據中心操作
  addDataCenter: (name: string) => string
  updateDataCenter: (id: string, name: string) => void
  deleteDataCenter: (id: string) => void

  // 機房操作
  addRoom: (dataCenterId: string, name: string) => string
  updateRoom: (dataCenterId: string, roomId: string, name: string) => void
  deleteRoom: (dataCenterId: string, roomId: string) => void

  // 機架操作
  addRack: (dataCenterId: string, roomId: string, name: string, totalUnits: number) => string
  updateRack: (dataCenterId: string, roomId: string, rackId: string, name: string, totalUnits: number) => void
  deleteRack: (dataCenterId: string, roomId: string, rackId: string) => void

  // 設備操作
  addDevice: (
    dataCenterId: string,
    roomId: string,
    rackId: string,
    startPosition: number,
    deviceInfo: DeviceInfo,
  ) => string
  updateDevice: (
    dataCenterId: string,
    roomId: string,
    rackId: string,
    deviceId: string,
    deviceInfo: Partial<DeviceInfo>,
  ) => void
  deleteDevice: (dataCenterId: string, roomId: string, rackId: string, deviceId: string) => void
  getDevice: (deviceId: string) => DeviceInfo | undefined

  // 查找功能
  findRack: (rackId: string) => { rack: Rack; datacenter: DataCenter; room: { id: string; name: string } } | null
}

export const useDataCenterStore = create<DataCenterStore>()(
  persist(
    (set, get) => ({
      dataCenters: initialDataCenters,
      devices: {},

      setDataCenters: (dataCenters) => set({ dataCenters }),

      addDataCenter: (name) => {
        const id = `dc-${Date.now()}`
        set((state) => ({
          dataCenters: [...state.dataCenters, { id, name, rooms: [] }],
        }))
        return id
      },

      updateDataCenter: (id, name) => {
        set((state) => ({
          dataCenters: state.dataCenters.map((dc) => (dc.id === id ? { ...dc, name } : dc)),
        }))
      },

      deleteDataCenter: (id) => {
        set((state) => ({
          dataCenters: state.dataCenters.filter((dc) => dc.id !== id),
        }))
      },

      addRoom: (dataCenterId, name) => {
        const id = `room-${Date.now()}`
        set((state) => ({
          dataCenters: state.dataCenters.map((dc) =>
            dc.id === dataCenterId ? { ...dc, rooms: [...dc.rooms, { id, name, racks: [] }] } : dc,
          ),
        }))
        return id
      },

      updateRoom: (dataCenterId, roomId, name) => {
        set((state) => ({
          dataCenters: state.dataCenters.map((dc) =>
            dc.id === dataCenterId
              ? {
                  ...dc,
                  rooms: dc.rooms.map((room) => (room.id === roomId ? { ...room, name } : room)),
                }
              : dc,
          ),
        }))
      },

      deleteRoom: (dataCenterId, roomId) => {
        set((state) => ({
          dataCenters: state.dataCenters.map((dc) =>
            dc.id === dataCenterId ? { ...dc, rooms: dc.rooms.filter((room) => room.id !== roomId) } : dc,
          ),
        }))
      },

      addRack: (dataCenterId, roomId, name, totalUnits) => {
        const id = `rack-${Date.now()}`
        set((state) => ({
          dataCenters: state.dataCenters.map((dc) =>
            dc.id === dataCenterId
              ? {
                  ...dc,
                  rooms: dc.rooms.map((room) =>
                    room.id === roomId
                      ? {
                          ...room,
                          racks: [
                            ...room.racks,
                            {
                              id,
                              name,
                              totalUnits,
                              units: generateEmptyUnits(totalUnits),
                            },
                          ],
                        }
                      : room,
                  ),
                }
              : dc,
          ),
        }))
        return id
      },

      updateRack: (dataCenterId, roomId, rackId, name, totalUnits) => {
        set((state) => ({
          dataCenters: state.dataCenters.map((dc) =>
            dc.id === dataCenterId
              ? {
                  ...dc,
                  rooms: dc.rooms.map((room) =>
                    room.id === roomId
                      ? {
                          ...room,
                          racks: room.racks.map((rack) =>
                            rack.id === rackId
                              ? {
                                  ...rack,
                                  name,
                                  totalUnits,
                                  units:
                                    totalUnits > rack.totalUnits
                                      ? [...rack.units, ...generateEmptyUnits(totalUnits - rack.totalUnits)]
                                      : rack.units.slice(0, totalUnits),
                                }
                              : rack,
                          ),
                        }
                      : room,
                  ),
                }
              : dc,
          ),
        }))
      },

      deleteRack: (dataCenterId, roomId, rackId) => {
        set((state) => ({
          dataCenters: state.dataCenters.map((dc) =>
            dc.id === dataCenterId
              ? {
                  ...dc,
                  rooms: dc.rooms.map((room) =>
                    room.id === roomId ? { ...room, racks: room.racks.filter((rack) => rack.id !== rackId) } : room,
                  ),
                }
              : dc,
          ),
        }))
      },

      addDevice: (dataCenterId, roomId, rackId, startPosition, deviceInfo) => {
        const deviceId = deviceInfo.id || `dev-${Date.now()}`
        const deviceWithId = { ...deviceInfo, id: deviceId }

        // 存儲設備信息
        set((state) => ({
          devices: {
            ...state.devices,
            [deviceId]: deviceWithId,
          },
        }))

        // 更新機架單元
        set((state) => ({
          dataCenters: state.dataCenters.map((dc) =>
            dc.id === dataCenterId
              ? {
                  ...dc,
                  rooms: dc.rooms.map((room) =>
                    room.id === roomId
                      ? {
                          ...room,
                          racks: room.racks.map((rack) => {
                            if (rack.id !== rackId) return rack

                            // 更新機架單元
                            const updatedUnits = [...rack.units]
                            for (let i = 0; i < deviceInfo.size; i++) {
                              const position = startPosition + i
                              if (position <= rack.totalUnits) {
                                updatedUnits[position - 1] = {
                                  ...updatedUnits[position - 1],
                                  deviceId,
                                  deviceName: deviceInfo.name,
                                  deviceIp:
                                    deviceInfo.ips && deviceInfo.ips.length > 0 ? deviceInfo.ips[0].address : null,
                                  deviceSize: deviceInfo.size,
                                }
                              }
                            }

                            return {
                              ...rack,
                              units: updatedUnits,
                            }
                          }),
                        }
                      : room,
                  ),
                }
              : dc,
          ),
        }))

        return deviceId
      },

      updateDevice: (dataCenterId, roomId, rackId, deviceId, deviceInfo) => {
        // 更新設備信息
        set((state) => ({
          devices: {
            ...state.devices,
            [deviceId]: {
              ...state.devices[deviceId],
              ...deviceInfo,
            },
          },
        }))

        // 更新機架單元
        set((state) => ({
          dataCenters: state.dataCenters.map((dc) =>
            dc.id === dataCenterId
              ? {
                  ...dc,
                  rooms: dc.rooms.map((room) =>
                    room.id === roomId
                      ? {
                          ...room,
                          racks: room.racks.map((rack) => {
                            if (rack.id !== rackId) return rack

                            // 更新設備信息
                            const updatedUnits = rack.units.map((unit) => {
                              if (unit.deviceId !== deviceId) return unit

                              return {
                                ...unit,
                                deviceName: deviceInfo.name ?? unit.deviceName,
                                deviceIp:
                                  deviceInfo.ips && deviceInfo.ips.length > 0
                                    ? deviceInfo.ips[0].address
                                    : unit.deviceIp,
                              }
                            })

                            return {
                              ...rack,
                              units: updatedUnits,
                            }
                          }),
                        }
                      : room,
                  ),
                }
              : dc,
          ),
        }))
      },

      deleteDevice: (dataCenterId, roomId, rackId, deviceId) => {
        // 從設備存儲中刪除
        set((state) => {
          const newDevices = { ...state.devices }
          delete newDevices[deviceId]
          return { devices: newDevices }
        })

        // 從機架中刪除
        set((state) => ({
          dataCenters: state.dataCenters.map((dc) =>
            dc.id === dataCenterId
              ? {
                  ...dc,
                  rooms: dc.rooms.map((room) =>
                    room.id === roomId
                      ? {
                          ...room,
                          racks: room.racks.map((rack) => {
                            if (rack.id !== rackId) return rack

                            // 清除設備信息
                            const updatedUnits = rack.units.map((unit) => {
                              if (unit.deviceId !== deviceId) return unit

                              return {
                                ...unit,
                                deviceId: null,
                                deviceName: null,
                                deviceIp: null,
                                deviceSize: 0,
                                serviceId: null,
                                serviceName: null,
                              }
                            })

                            return {
                              ...rack,
                              units: updatedUnits,
                            }
                          }),
                        }
                      : room,
                  ),
                }
              : dc,
          ),
        }))
      },

      getDevice: (deviceId) => {
        return get().devices[deviceId]
      },

      findRack: (rackId) => {
        for (const dc of get().dataCenters) {
          for (const room of dc.rooms) {
            const rack = room.racks.find((r) => r.id === rackId)
            if (rack) {
              return {
                rack,
                datacenter: dc,
                room: { id: room.id, name: room.name },
              }
            }
          }
        }
        return null
      },
    }),
    {
      name: "data-center-storage", // 本地存儲的名稱
      partialize: (state) => ({ dataCenters: state.dataCenters, devices: state.devices }), // 存儲 dataCenters 和 devices
    },
  ),
)
