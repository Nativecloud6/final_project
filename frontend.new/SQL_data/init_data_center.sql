CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uuid TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  passwordHash TEXT NOT NULL,
  userLevel TEXT DEFAULT 'user',
  token TEXT
);


CREATE TABLE data_centers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE rooms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  data_center_id TEXT,
  FOREIGN KEY (data_center_id) REFERENCES data_centers(id)
);

CREATE TABLE racks (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  total_units INTEGER NOT NULL,
  room_id TEXT,
  FOREIGN KEY (room_id) REFERENCES rooms(id)
);

CREATE TABLE devices (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  model TEXT,
  size INTEGER,
  status TEXT,
  service_id TEXT,
  service_name TEXT,
  installation_date TEXT,
  last_updated TEXT,
  notes TEXT,
  power_consumption INTEGER
);

CREATE TABLE ip_addresses (
  id TEXT PRIMARY KEY,
  address TEXT NOT NULL,
  subnet TEXT NOT NULL,
  gateway TEXT,
  status TEXT,
  device_id TEXT,
  device_name TEXT,
  service_id TEXT,
  service_name TEXT,
  last_updated TEXT
);

CREATE TABLE ip_subnets (
  id TEXT PRIMARY KEY,
  subnet TEXT NOT NULL,
  description TEXT,
  total_ips INTEGER,
  used_ips INTEGER,
  available_ips INTEGER,
  reserved_ips INTEGER
);

CREATE TABLE services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT,
  owner TEXT,
  department TEXT,
  criticality TEXT
);

CREATE TABLE device_ips (
  device_id TEXT,
  ip_id TEXT,
  FOREIGN KEY (device_id) REFERENCES devices(id),
  FOREIGN KEY (ip_id) REFERENCES ip_addresses(id),
  PRIMARY KEY (device_id, ip_id)
);

CREATE TABLE rack_units (
  rack_id TEXT,
  position INTEGER,
  device_id TEXT,
  device_name TEXT,
  device_ip TEXT,
  device_size INTEGER,
  service_id TEXT,
  service_name TEXT,
  PRIMARY KEY (rack_id, position),
  FOREIGN KEY (rack_id) REFERENCES racks(id),
  FOREIGN KEY (device_id) REFERENCES devices(id)
);

