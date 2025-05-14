## API部份
使用 FastAPI 建構的後端，完整實作 API 規範中的「資料中心、機房、機櫃、設備」管理功能。

IP 模組已完成基礎架構（建立／分配／釋放），碰撞檢測邏輯待後續併入即可。

- 建立／列出／刪除 資料中心、機房、機櫃
- 建立／安裝／卸載／搜尋 設備
- 提供靜態前端 + `/api` JSON 介面

---

### 環境準備

- Python 3.10+
- Node.js & npm
- Git

---

### 使用方式

1. 啟動伺服器：
   ```
   uvicorn backend.main:app --reload
   ```
4. 開啟 API 界面：
   ```
   http://localhost:8000/docs
   ```


---

### 結構

```
final_project/
├── backend/
│ ├── controllers/ # 業務邏輯
│ │ ├── datacenter_controller.py
│ │ ├── room_controller.py
│ │ ├── rack_controller.py
│ │ ├── device_controller.py
│ │ ├── ip_controller.py # IP 管理
│ │ └── query_controller.py
│ ├── routes/ # FastAPI 路由
│ │ ├── datacenter_routes.py
│ │ ├── room_routes.py
│ │ ├── rack_routes.py
│ │ ├── device_routes.py
│ │ ├── ip_routes.py # IP 相關 API
│ │ └── query_routes.py
│ ├── schemas/ # Pydantic 與 ORM 定義
│ │ ├── datacenter.py
│ │ ├── room.py
│ │ ├── rack.py
│ │ ├── device.py
│ │ ├── ip.py # IP 請求／回應模型
│ │ ├── query.py
│ │ ├── auth.py
│ │ ├── database.py
│ │ └── models.py
│ ├── main.py # FastAPI 應用入口
│ └── dc_mvp.db # SQLite 資料庫（加入 .gitignore）
├── frontend/           
└── README.md           
```

---

- **資料中心**
  - GET  `/api/data-centers`
  - POST `/api/data-centers`
  - DELETE `/api/data-centers/{id}`

- **機房**
  - POST `/api/data-centers/{dc_id}/rooms`
  - DELETE `/api/rooms/{room_id}`

- **機櫃**
  - POST `/api/rooms/{room_id}/racks`
  - DELETE `/api/racks/{rack_id}`

- **設備**
  - POST `/api/devices`
  - POST `/api/devices/{id}/install`
  - POST `/api/devices/{id}/uninstall`
  - GET  `/api/devices/search`

- **IP 管理**
  - POST `/api/ips`
  - POST `/api/ips/allocate`
  - POST `/api/ips/release`

- **認證**
  - POST `/api/login`

---
