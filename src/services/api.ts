// frontend/src/services/api.ts
import axios from "axios";
import type { 
  DashboardSummaryResponse, 
  MachineDetailResponse, 
  SensorHistoryData,
  SensorDataPoint,
  AlertData,
  MachineStatus,
  PredictPayload,
  PredictResponseFE
} from "../types";

// Gunakan URL Railway Anda jika di production, atau localhost saat dev
const API_URL = import.meta.env.VITE_API_URL || "https://api-protek-production.up.railway.app/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- RAW TYPES DARI BACKEND ---
type RawMachine = {
  id: number;
  aset_id?: string;
  name: string;
  status: string;
  created_at?: string;
  updated_at?: string;
};

type RawAlert = {
  id: number;
  machine_id?: number;
  machine_name?: string;
  aset_id?: string;
  message: string;
  severity: string;
  timestamp: string;
};

type RawAlertsResponse = { alerts: RawAlert[] } | RawAlert[];

type RawSensor = {
  machineId?: number;
  timestamp: string;
  air_temperature_k: number;
  process_temperature_k: number;
  rotational_speed_rpm: number;
  torque_nm: number;
  tool_wear_min: number;
  type?: string;
};

type DashboardStatsResponse = {
  status?: string;
  summary?: {
    totalMachines: number;
    criticalMachines: number;
    todaysAlerts: number;
    systemHealth: number;
  };
  recentAlerts?: RawAlert[];
};

// --- INTERFACES (Di-export agar bisa dipakai di Komponen) ---

export interface SimulationResponse {
  status: "success" | "error";
  message: string;
  is_running?: boolean;
}

export interface TrendDataPoint {
  time: string;
  healthScore: number;
  machineId: string;
}

export interface DebugMatchItem {
  mesin: string;
  kode: string;
  status_saat_ini: string;
  prediksi_ml: {
    sisa_umur_rul: string;
    risiko_kerusakan: string;
    status_prediksi: string;
  } | string; 
}

export interface ChatResponse {
  reply: string;
  debug_match?: DebugMatchItem[]; 
}

// --- SERVICES ---

export const simulationService = {
  // 1. Start Simulasi
  start: async () => {
    const response = await api.post<SimulationResponse>("/simulation/start");
    return response.data;
  },

  // 2. Stop Simulasi
  stop: async () => {
    // Menggunakan GET sesuai controller backend Anda saat ini
    const response = await api.get<SimulationResponse>("/simulation/stop");
    return response.data;
  },

  // 3. Cek Status (Untuk tombol Start/Stop)
  getStatus: async () => {
    const response = await api.get<{ is_running: boolean }>("/simulation/status");
    return response.data;
  }
};

export const dashboardService = {
  getSummary: async () => {
    const [statsRes, alertsRes] = await Promise.all([
      api.get<DashboardStatsResponse>("/dashboard/stats"),
      api.get<RawAlertsResponse>("/alerts").catch(() => ({ data: [] as RawAlertsResponse })),
    ]);

    const summary = statsRes.data?.summary ?? {
      totalMachines: 0,
      criticalMachines: 0,
      todaysAlerts: 0,
      systemHealth: 0,
    };

    const recentAlerts = mapAlerts(alertsRes.data).slice(0, 5);

    const payload: DashboardSummaryResponse = {
      summary,
      recentAlerts,
    };

    return payload;
  },

  getTrend: async () => {
    const response = await api.get<TrendDataPoint[]>("/dashboard/trend");
    return response.data;
  },

  getMachines: async () => {
    const response = await api.get<RawMachine[]>("/machines");
    return response.data.map(mapMachineDetail);
  },

  getMachineDetail: async (asetId: string) => {
    const response = await api.get<RawMachine>(`/machines/${asetId}`);
    return mapMachineDetail(response.data);
  },

  // --- FIX PENTING: Menambahkan getSensors ---
  // Ini diperlukan oleh MachineHealthChart.tsx
  getSensors: async (asetId: string) => {
    // Mengambil data history sensor untuk grafik realtime
    const response = await api.get<RawSensor[]>(`/machines/${asetId}/history`);
    return mapSensorHistory(response.data);
  },

  // Method baru untuk mengambil data dari tabel sensor_data (realtime)
  getSensorData: async (asetId: string) => {
    const response = await api.get<RawSensor[]>(`/machines/${asetId}/history`);
    return mapSensorData(response.data);
  },

  getHistory: async (asetId: string) => {
    const response = await api.get<RawSensor[]>(`/machines/${asetId}/history`);
    return mapSensorHistory(response.data);
  },

  getAlerts: async () => {
    const response = await api.get<RawAlertsResponse>(`/alerts`);
    return mapAlerts(response.data);
  },

  getAlertDetail: async (alertId: number) => {
    const response = await api.get<AlertData>(`/alerts/${alertId}`);
    return response.data;
  },

  getPredict: async (payload: PredictPayload) => {
    const response = await api.post<PredictResponseFE>(`/predict`, payload);
    return response.data;
  },

  sendMessage: async (message: string) => {
    const response = await api.post<ChatResponse>('/chat', { message });
    return response.data;
  }
};

export default api;

// --- HELPER MAPPING ---
function mapMachineDetail(raw: RawMachine): MachineDetailResponse {
  return {
    id: raw.id,
    asetId: raw.aset_id || String(raw.id),
    name: raw.name,
    status: (raw.status || "HEALTHY") as MachineStatus,
    createdAt: raw.created_at || "",
    updatedAt: raw.updated_at || "",
  };
}

function mapAlerts(data: RawAlertsResponse): AlertData[] {
  const alertsArray = Array.isArray(data) ? data : data?.alerts || [];
  return alertsArray.map((item) => ({
    id: item.id,
    message: item.message,
    severity: item.severity?.toUpperCase?.() || "INFO",
    timestamp: item.timestamp,
    machine: {
      name: item.machine_name || `Machine ${item.machine_id ?? ""}`.trim(),
      asetId: item.aset_id || String(item.machine_id ?? item.id ?? "-")
    }
  }));
}

function mapSensorData(data: RawSensor[]): SensorDataPoint[] {
  return (data || []).map((item, idx) => ({
    id: idx,
    machine_id: item.machineId ?? 0,
    type: item.type || "SENSOR",
    air_temperature_K: item.air_temperature_k,
    process_temperature_K: item.process_temperature_k,
    rotational_speed_rpm: item.rotational_speed_rpm,
    torque_Nm: item.torque_nm,
    tool_wear_min: item.tool_wear_min,
    insertion_time: item.timestamp,
  }));
}

function mapSensorHistory(data: RawSensor[]): SensorHistoryData[] {
  const history: SensorHistoryData[] = [];
  (data || []).forEach((item, idx) => {
    const base = {
      machineId: item.machineId ?? 0,
      timestamp: item.timestamp,
    };
    history.push(
      { id: idx * 5 + 1, type: 'Air_Temp', value: item.air_temperature_k, ...base },
      { id: idx * 5 + 2, type: 'Process_Temp', value: item.process_temperature_k, ...base },
      { id: idx * 5 + 3, type: 'RPM', value: item.rotational_speed_rpm, ...base },
      { id: idx * 5 + 4, type: 'Torque', value: item.torque_nm, ...base },
      { id: idx * 5 + 5, type: 'Tool_Wear', value: item.tool_wear_min, ...base },
    );
  });
  return history;
}