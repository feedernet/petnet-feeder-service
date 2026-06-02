import { FEEDER_API_BASE } from "../constants";
import { apiFetch } from "./client";

export interface Feeder {
  hid: string;
  name: string;
  timezone: string;
  frontButton: boolean;
  currentRecipe: number | null;
  black: boolean;
}

export interface Recipe {
  g_per_tbsp: number | null;
  tbsp_per_feeding: number | null;
  name: string | null;
  budget_tbsp: number | null;
}

export interface FeedHistoryPage {
  data: unknown[];
  page: number;
  size: number;
  totalSize: number;
  totalPages: number;
}

export const getFeeders = (): Promise<Feeder[]> =>
  apiFetch(`${FEEDER_API_BASE}/`);

export const getFeederTelemetry = (deviceId: string): Promise<unknown> =>
  apiFetch(`${FEEDER_API_BASE}/${deviceId}/telemetry`);

export const triggerFeeding = ({ deviceId, portion }: { deviceId: string; portion: number }): Promise<unknown> =>
  apiFetch(`${FEEDER_API_BASE}/${deviceId}/feed`, {
    method: "POST",
    body: JSON.stringify({ portion }),
  });

export const modifyFeeder = ({
  deviceId,
  name = null,
  timezone = null,
  frontButton = null,
  currentRecipe = null,
  black = null,
}: {
  deviceId: string;
  name?: string | null;
  timezone?: string | null;
  frontButton?: boolean | null;
  currentRecipe?: number | null;
  black?: boolean | null;
}): Promise<Feeder> =>
  apiFetch(`${FEEDER_API_BASE}/${deviceId}`, {
    method: "PUT",
    body: JSON.stringify({ name, timezone, frontButton, currentRecipe, black }),
  });

export const deleteFeeder = (deviceId: string): Promise<unknown> =>
  apiFetch(`${FEEDER_API_BASE}/${deviceId}`, { method: "DELETE" });

export const restartFeeder = (deviceId: string): Promise<unknown> =>
  apiFetch(`${FEEDER_API_BASE}/${deviceId}/restart`, { method: "POST" });

export const getHopperLevel = (deviceId: string): Promise<{ level: number }> =>
  apiFetch(`${FEEDER_API_BASE}/${deviceId}/hopper`);

export const setHopperLevel = ({ deviceId, level }: { deviceId: string; level: number }): Promise<unknown> =>
  apiFetch(`${FEEDER_API_BASE}/${deviceId}/hopper`, {
    method: "POST",
    body: JSON.stringify({ level }),
  });

export const getRecipe = (deviceId: string): Promise<Recipe> =>
  apiFetch(`${FEEDER_API_BASE}/${deviceId}/recipe`);

export const setRecipe = ({
  deviceId,
  g_per_tbsp = null,
  tbsp_per_feeding = null,
  name = null,
  budget_tbsp = null,
}: {
  deviceId: string;
  g_per_tbsp?: number | null;
  tbsp_per_feeding?: number | null;
  name?: string | null;
  budget_tbsp?: number | null;
}): Promise<Recipe> =>
  apiFetch(`${FEEDER_API_BASE}/${deviceId}/recipe`, {
    method: "PUT",
    body: JSON.stringify({ g_per_tbsp, tbsp_per_feeding, name, budget_tbsp }),
  });

export const getFeedHistory = ({
  deviceId = "",
  pageSize = 10,
  page = 1,
}: {
  deviceId?: string;
  pageSize?: number;
  page?: number;
} = {}): Promise<FeedHistoryPage> => {
  const base = deviceId !== "" ? `${FEEDER_API_BASE}/${deviceId}` : FEEDER_API_BASE;
  return apiFetch(`${base}/history?size=${pageSize}&page=${page}`);
};
