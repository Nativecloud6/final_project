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

// 初始子網數據
const initialIPSubnets: IPSubnet[] = [
  {
    id: "subnet-1",
    subnet: "192.168.1.0/24",
    description: "Primary Network",
    totalIPs: 254,
    usedIPs: 120,
    availableIPs: 124,
    reservedIPs: 10,
  },
  {
    id: "subnet-2",
    subnet: "192.168.2.0/24",
    description: "Secondary Network",
    totalIPs: 254,
    usedIPs: 85,
    availableIPs: 159,
    reservedIPs: 10,
  },
  {
    id: "subnet-3",
    subnet: "10.0.0.0/24",
    description: "Management Network",
    totalIPs: 254,
    usedIPs: 45,
    availableIPs: 199,
    reservedIPs: 10,
  },
]

// 初始服務數據
const initialServices: ServiceInfo[] = [
  {
    id: "service-1",
    name: "Web Application",
    description: "Main company web application",
    status: "Active",
    criticality: "High",
    owner: "John Doe",
    department: "IT",
    devices: [],
  },
  {
    id: "service-2",
    name: "Database Cluster",
    description: "Primary database cluster",
    status: "Active",
    criticality: "Critical",
    owner: "Jane Smith",
    department: "IT",
    devices: [],
  },
  {
    id: "service-3",
    name: "Email Server",
    description: "Corporate email server",
    status: "Maintenance",
    criticality: "Medium",
    owner: "Mike Johnson",
    department: "IT",
    devices: [],
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
  serviceId?: string | null
}

// IP 子網信息接口
interface IPSubnet {
  id: string
  subnet: string
  description: string
  totalIPs: number
  usedIPs: number
  availableIPs: number
  reservedIPs: number
}

// 服務信息接口
interface ServiceInfo {
  id: string
  name: string
  description: string
  status: "Active" | "Inactive" | "Maintenance" | "Planned"
  criticality: "Low" | "Medium" | "High" | "Critical"
  owner?: string
  department?: string
  devices: string[] // 設備 ID 列表
}

// 存儲設備數據的映射
interface DeviceStore {
  [deviceId: string]: DeviceInfo
}

// 存儲服務數據的映射
interface ServiceStore {
  [serviceId: string]: ServiceInfo
}

interface DataCenterStore {
  dataCenters: DataCenter[]
  devices: DeviceStore
  services: ServiceStore
  ipSubnets: IPSubnet[]
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

  // IP 子網操作
  addSubnet: (subnet: string, description: string, cidr: string, gateway?: string, reservedCount?: number) => string
  updateSubnet: (id: string, data: Partial<IPSubnet>) => void
  deleteSubnet: (id: string) => void
  getSubnets: () => IPSubnet[]

  // 服務操作
  addService: (serviceInfo: Omit<ServiceInfo, "id" | "devices">) => string
  updateService: (id: string, data: Partial<ServiceInfo>) => void
  deleteService: (id: string) => void
  getService: (id: string) => ServiceInfo | undefined
  getAllServices: () => ServiceInfo[]
  assignDeviceToService: (deviceId: string, serviceId: string) => void
  removeDeviceFromService: (deviceId: string, serviceId: string) => void
}

export const useDataCenterStore = create<DataCenterStore>()(
  persist(
    (set, get) => {
      // 將初始服務數據轉換為映射
      const initialServicesMap: ServiceStore = {}
      initialServices.forEach((service) => {
        initialServicesMap[service.id] = service
      })

      return {
        dataCenters: initialDataCenters,
        devices: {},
        services: initialServicesMap,
        ipSubnets: initialIPSubnets,

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

          // 如果設備有關聯的服務，將設備添加到服務的設備列表中
          if (deviceInfo.serviceId) {
            set((state) => {
              const service = state.services[deviceInfo.serviceId!]
              if (service) {
                return {
                  services: {
                    ...state.services,
                    [deviceInfo.serviceId!]: {
                      ...service,
                      devices: [...service.devices, deviceId],
                    },
                  },
                }
              }
              return state
            })
          }

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
                                    serviceId: deviceInfo.serviceId || null,
                                    serviceName:
                                      deviceInfo.serviceId && state.services[deviceInfo.serviceId]
                                        ? state.services[deviceInfo.serviceId].name
                                        : null,
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
          const oldDevice = get().devices[deviceId]
          const oldServiceId = oldDevice?.serviceId
          const newServiceId = deviceInfo.serviceId

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

          // 處理服務關聯的變更
          if (oldServiceId !== newServiceId) {
            set((state) => {
              const newState = { ...state }

              // 從舊服務中移除設備
              if (oldServiceId && newState.services[oldServiceId]) {
                newState.services[oldServiceId] = {
                  ...newState.services[oldServiceId],
                  devices: newState.services[oldServiceId].devices.filter((id) => id !== deviceId),
                }
              }

              // 添加設備到新服務
              if (newServiceId && newState.services[newServiceId]) {
                newState.services[newServiceId] = {
                  ...newState.services[newServiceId],
                  devices: [...newState.services[newServiceId].devices, deviceId],
                }
              }

              return newState
            })
          }

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
                                  serviceId: deviceInfo.serviceId || null,
                                  serviceName:
                                    deviceInfo.serviceId && state.services[deviceInfo.serviceId]
                                      ? state.services[deviceInfo.serviceId].name
                                      : null,
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
          const device = get().devices[deviceId]
          const serviceId = device?.serviceId

          // 從設備存儲中刪除
          set((state) => {
            const newDevices = { ...state.devices }
            delete newDevices[deviceId]
            return { devices: newDevices }
          })

          // 從服務中移除設備
          if (serviceId) {
            set((state) => {
              const service = state.services[serviceId]
              if (service) {
                return {
                  services: {
                    ...state.services,
                    [serviceId]: {
                      ...service,
                      devices: service.devices.filter((id) => id !== deviceId),
                    },
                  },
                }
              }
              return state
            })
          }

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

        // IP 子網操作
        addSubnet: (subnet, description, cidr, gateway, reservedCount = 10) => {
          const id = `subnet-${Date.now()}`
          const cidrNum = Number.parseInt(cidr, 10)
          const totalIPs = Math.pow(2, 32 - cidrNum)
          const usableIPs = totalIPs - 2 // 減去網絡地址和廣播地址

          const newSubnet: IPSubnet = {
            id,
            subnet: `${subnet}/${cidr}`,
            description,
            totalIPs: usableIPs,
            usedIPs: 0,
            availableIPs: usableIPs - reservedCount,
            reservedIPs: reservedCount,
          }

          set((state) => {
            const currentSubnets = state.ipSubnets || []
            return {
              ipSubnets: [...currentSubnets, newSubnet],
            }
          })

          return id
        },

        updateSubnet: (id, data) => {
          set((state) => {
            const currentSubnets = state.ipSubnets || []
            return {
              ipSubnets: currentSubnets.map((subnet) => (subnet.id === id ? { ...subnet, ...data } : subnet)),
            }
          })
        },

        deleteSubnet: (id) => {
          set((state) => {
            const currentSubnets = state.ipSubnets || []
            return {
              ipSubnets: currentSubnets.filter((subnet) => subnet.id !== id),
            }
          })
        },

        getSubnets: () => {
          return get().ipSubnets || []
        },

        // 服務操作
        addService: (serviceInfo) => {
          const id = `service-${Date.now()}`
          const newService: ServiceInfo = {
            ...serviceInfo,
            id,
            devices: [],
          }

          set((state) => ({
            services: {
              ...state.services,
              [id]: newService,
            },
          }))

          return id
        },

        updateService: (id, data) => {
          set((state) => {
            const service = state.services[id]
            if (!service) return state

            return {
              services: {
                ...state.services,
                [id]: {
                  ...service,
                  ...data,
                },
              },
            }
          })
        },

        deleteService: (id) => {
          // 獲取服務中的所有設備
          const service = get().services[id]
          const deviceIds = service?.devices || []

          // 從設備中移除服務關聯
          deviceIds.forEach((deviceId) => {
            set((state) => {
              const device = state.devices[deviceId]
              if (device && device.serviceId === id) {
                return {
                  devices: {
                    ...state.devices,
                    [deviceId]: {
                      ...device,
                      serviceId: null,
                    },
                  },
                }
              }
              return state
            })
          })

          // 從機架單元中移除服務關聯
          set((state) => ({
            dataCenters: state.dataCenters.map((dc) => ({
              ...dc,
              rooms: dc.rooms.map((room) => ({
                ...room,
                racks: room.racks.map((rack) => ({
                  ...rack,
                  units: rack.units.map((unit) => {
                    if (unit.serviceId === id) {
                      return {
                        ...unit,
                        serviceId: null,
                        serviceName: null,
                      }
                    }
                    return unit
                  }),
                })),
              })),
            })),
          }))

          // 刪除服務
          set((state) => {
            const newServices = { ...state.services }
            delete newServices[id]
            return { services: newServices }
          })
        },

        getService: (id) => {
          return get().services[id]
        },

        getAllServices: () => {
          const services = get().services
          return Object.values(services)
        },

        assignDeviceToService: (deviceId, serviceId) => {
          const device = get().devices[deviceId]
          const service = get().services[serviceId]

          if (!device || !service) return

          // 更新設備的服務關聯
          set((state) => ({
            devices: {
              ...state.devices,
              [deviceId]: {
                ...device,
                serviceId,
              },
            },
          }))

          // 將設備添加到服務的設備列表中
          set((state) => ({
            services: {
              ...state.services,
              [serviceId]: {
                ...service,
                devices: service.devices.includes(deviceId) ? service.devices : [...service.devices, deviceId],
              },
            },
          }))

          // 更新機架單元中的服務信息
          set((state) => ({
            dataCenters: state.dataCenters.map((dc) => ({
              ...dc,
              rooms: dc.rooms.map((room) => ({
                ...room,
                racks: room.racks.map((rack) => ({
                  ...rack,
                  units: rack.units.map((unit) => {
                    if (unit.deviceId === deviceId) {
                      return {
                        ...unit,
                        serviceId,
                        serviceName: service.name,
                      }
                    }
                    return unit
                  }),
                })),
              })),
            })),
          }))
        },

        removeDeviceFromService: (deviceId, serviceId) => {
          const device = get().devices[deviceId]
          const service = get().services[serviceId]

          if (!device || !service || device.serviceId !== serviceId) return

          // 更新設備的服務關聯
          set((state) => ({
            devices: {
              ...state.devices,
              [deviceId]: {
                ...device,
                serviceId: null,
              },
            },
          }))

          // 從服務的設備列表中移除設備
          set((state) => ({
            services: {
              ...state.services,
              [serviceId]: {
                ...service,
                devices: service.devices.filter((id) => id !== deviceId),
              },
            },
          }))

          // 更新機架單元中的服務信息
          set((state) => ({
            dataCenters: state.dataCenters.map((dc) => ({
              ...dc,
              rooms: dc.rooms.map((room) => ({
                ...room,
                racks: room.racks.map((rack) => ({
                  ...rack,
                  units: rack.units.map((unit) => {
                    if (unit.deviceId === deviceId) {
                      return {
                        ...unit,
                        serviceId: null,
                        serviceName: null,
                      }
                    }
                    return unit
                  }),
                })),
              })),
            })),
          }))
        },
      }
    },
    {
      name: "data-center-storage", // 本地存儲的名稱
      partialize: (state) => ({
        dataCenters: state.dataCenters,
        devices: state.devices,
        ipSubnets: state.ipSubnets,
        services: state.services,
      }), // 存儲 dataCenters、devices、ipSubnets 和 services
    },
  ),
)
