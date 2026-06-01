import { FEEDER_API_BASE } from "../constants";

export const getFeeders = async () => {
  const res = await fetch(`${FEEDER_API_BASE}/`, { credentials: "include" });
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
};

export const getFeederTelemetry = async (deviceId) => {
  const res = await fetch(`${FEEDER_API_BASE}/${deviceId}/telemetry`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
};

export const triggerFeeding = async ({ deviceId, portion }) => {
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
}) => {
  const res = await fetch(`${FEEDER_API_BASE}/${deviceId}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, timezone, frontButton, currentRecipe, black }),
  });
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
};

export const deleteFeeder = async (deviceId) => {
  const res = await fetch(`${FEEDER_API_BASE}/${deviceId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error(res.statusText);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
};

export const restartFeeder = async (deviceId) => {
  const res = await fetch(`${FEEDER_API_BASE}/${deviceId}/restart`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) throw new Error(res.statusText);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
};

export const getHopperLevel = async (deviceId) => {
  const res = await fetch(`${FEEDER_API_BASE}/${deviceId}/hopper`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
};

export const setHopperLevel = async ({ deviceId, level }) => {
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

export const getRecipe = async (deviceId) => {
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
}) => {
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
} = {}) => {
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
