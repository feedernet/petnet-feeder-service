import { FEEDER_API_BASE } from "../constants";

export interface Feeder {
  device_hid: string;
  name: string;
  timezone: string;
  frontButton: boolean;
  currentRecipe: string | null;
  black: boolean;
}

export interface Recipe {
  g_per_tbsp: number | null;
  tbsp_per_feeding: number | null;
  name: string | null;
  budget_tbsp: number | null;
}

export interface FeedHistoryPage {
  events: unknown[];
  page: number;
  size: number;
  total: number;
}

export const getFeeders = async (): Promise<Feeder[]> => {
  const res = await fetch(`${FEEDER_API_BASE}/`, { credentials: "include" });
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
};

export const getFeederTelemetry = async (deviceId: string): Promise<unknown> => {
  const res = await fetch(`${FEEDER_API_BASE}/${deviceId}/telemetry`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
};

export const triggerFeeding = async ({ deviceId, portion }: { deviceId: string; portion: number }): Promise<unknown> => {
  const res = await fetch(`${FEEDER_API_BASE}/${deviceId}/feed`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ portion }),
  });
  if (!res.ok) throw new Error(res.statusText);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
};

export const modifyFeeder = async ({
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
  currentRecipe?: string | null;
  black?: boolean | null;
}): Promise<Feeder> => {
  const res = await fetch(`${FEEDER_API_BASE}/${deviceId}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, timezone, frontButton, currentRecipe, black }),
  });
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
};

export const deleteFeeder = async (deviceId: string): Promise<unknown> => {
  const res = await fetch(`${FEEDER_API_BASE}/${deviceId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error(res.statusText);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
};

export const restartFeeder = async (deviceId: string): Promise<unknown> => {
  const res = await fetch(`${FEEDER_API_BASE}/${deviceId}/restart`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) throw new Error(res.statusText);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
};

export const getHopperLevel = async (deviceId: string): Promise<{ level: number }> => {
  const res = await fetch(`${FEEDER_API_BASE}/${deviceId}/hopper`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
};

export const setHopperLevel = async ({ deviceId, level }: { deviceId: string; level: number }): Promise<unknown> => {
  const res = await fetch(`${FEEDER_API_BASE}/${deviceId}/hopper`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ level }),
  });
  if (!res.ok) throw new Error(res.statusText);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
};

export const getRecipe = async (deviceId: string): Promise<Recipe> => {
  const res = await fetch(`${FEEDER_API_BASE}/${deviceId}/recipe`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
};

export const setRecipe = async ({
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
}): Promise<Recipe> => {
  const res = await fetch(`${FEEDER_API_BASE}/${deviceId}/recipe`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ g_per_tbsp, tbsp_per_feeding, name, budget_tbsp }),
  });
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
};

export const getFeedHistory = async ({
  deviceId = "",
  pageSize = 10,
  page = 1,
}: {
  deviceId?: string;
  pageSize?: number;
  page?: number;
} = {}): Promise<FeedHistoryPage> => {
  let url = FEEDER_API_BASE;
  if (deviceId !== "") {
    url += `/${deviceId}`;
  }
  const res = await fetch(`${url}/history?size=${pageSize}&page=${page}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
};
