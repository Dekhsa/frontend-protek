/**
 * Mock Data untuk Frontend
 *
 * File ini digunakan untuk development/testing
 * Pada production, data akan diambil dari API Backend
 */
import type {
  AlertData,
  DashboardSummaryResponse,
  MachineDetailResponse,
  MachineStatus,
} from "@/types";

const machineNames: Record<string, string> = {
  "M-14850": "CNC Grinder 01",
  "M-15200": "Lathe Machine 02",
  "M-14900": "Drill Press 03",
  "M-15500": "Milling Machine 04",
  "M-16100": "Assembly Robot 05",
};

export const mockMachines: MachineDetailResponse[] = [
  {
    id: 1,
    asetId: "M-14850",
    name: machineNames["M-14850"],
    status: "CRITICAL" as MachineStatus,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    asetId: "M-15200",
    name: machineNames["M-15200"],
    status: "WARNING" as MachineStatus,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    asetId: "M-14900",
    name: machineNames["M-14900"],
    status: "HEALTHY" as MachineStatus,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 4,
    asetId: "M-15500",
    name: machineNames["M-15500"],
    status: "HEALTHY" as MachineStatus,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 5,
    asetId: "M-16100",
    name: machineNames["M-16100"],
    status: "OFFLINE" as MachineStatus,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const mockAlerts: AlertData[] = [
  {
    id: 1,
    message: "Tool Wear Failure",
    severity: "CRITICAL",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    machine: {
      asetId: "M-14850",
      name: machineNames["M-14850"],
    },
  },
  {
    id: 2,
    message: "Overheat detected",
    severity: "WARNING",
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    machine: {
      asetId: "M-15200",
      name: machineNames["M-15200"],
    },
  },
  {
    id: 3,
    message: "Power fluctuation",
    severity: "INFO",
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    machine: {
      asetId: "M-14900",
      name: machineNames["M-14900"],
    },
  },
];

export const mockDashboardSummary: DashboardSummaryResponse = {
  summary: {
    totalMachines: mockMachines.length,
    criticalMachines: mockMachines.filter((m) => m.status === "CRITICAL").length,
    todaysAlerts: mockAlerts.length,
    systemHealth: 82,
  },
  recentAlerts: mockAlerts,
};

// Simple health trend data for charts
export const healthTrendData = [
  { time: '00:00', value: 80 },
  { time: '04:00', value: 78 },
  { time: '08:00', value: 75 },
  { time: '12:00', value: 70 },
  { time: '16:00', value: 65 },
  { time: '20:00', value: 60 },
];

// Maintenance history (sample)
export const maintenanceHistory: { id: string; machineId: string; date: string; type: string; description: string }[] = [];

// Export untuk backward compatibility
export const alerts = mockAlerts;
export const dashboardStats = mockDashboardSummary;
export const machines = mockMachines;
