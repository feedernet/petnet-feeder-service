import { PET_API_BASE } from "../constants";

export const getPets = async () => {
  const res = await fetch(`${PET_API_BASE}/`, { credentials: "include" });
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
};

export const createPet = async ({
  name,
  animal_type,
  weight,
  birthday,
  activity_level,
  image = null,
  device_hid = null,
}) => {
  const res = await fetch(`${PET_API_BASE}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      animal_type,
      weight,
      birthday,
      image,
      activity_level,
      device_hid,
    }),
  });
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
};

export const modifyPet = async ({
  pet_id,
  name,
  animal_type,
  weight,
  birthday,
  activity_level,
  image = null,
  device_hid = null,
}) => {
  const res = await fetch(`${PET_API_BASE}/${pet_id}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      animal_type,
      weight,
      birthday,
      image,
      activity_level,
      device_hid,
    }),
  });
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
};

export const deletePet = async (petId) => {
  const res = await fetch(`${PET_API_BASE}/${petId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error(res.statusText);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
};

export const getPetSchedule = async (petId) => {
  const res = await fetch(`${PET_API_BASE}/${petId}/schedule`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
};

export const createPetSchedule = async ({
  petId,
  name = null,
  time = null,
  portion = null,
}) => {
  const res = await fetch(`${PET_API_BASE}/${petId}/schedule`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, time, portion }),
  });
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
};

export const updatePetSchedule = async ({
  petId,
  eventId,
  name = null,
  time = null,
  portion = null,
  enabled = null,
}) => {
  const res = await fetch(`${PET_API_BASE}/${petId}/schedule/${eventId}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, time, portion, enabled }),
  });
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
};

export const deletePetSchedule = async ({ petId, eventId }) => {
  const res = await fetch(`${PET_API_BASE}/${petId}/schedule/${eventId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error(res.statusText);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
};
