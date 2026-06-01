import { PET_API_BASE } from "../constants";

export interface Pet {
  pet_id: number;
  name: string;
  animal_type: string;
  weight: number;
  birthday: string | null;
  activity_level: string;
  image: string | null;
  device_hid: string | null;
}

export interface ScheduleEvent {
  event_id: number;
  name: string | null;
  time: string | null;
  portion: number | null;
  enabled: boolean;
}

export interface PetSchedule {
  events: ScheduleEvent[];
}

export const getPets = async (): Promise<Pet[]> => {
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
}: {
  name: string;
  animal_type: string;
  weight: number;
  birthday: string | null;
  activity_level: string;
  image?: string | null;
  device_hid?: string | null;
}): Promise<Pet> => {
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
}: {
  pet_id: number;
  name: string;
  animal_type: string;
  weight: number;
  birthday: string | null;
  activity_level: string;
  image?: string | null;
  device_hid?: string | null;
}): Promise<Pet> => {
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

export const deletePet = async (petId: number): Promise<unknown> => {
  const res = await fetch(`${PET_API_BASE}/${petId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error(res.statusText);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
};

export const getPetSchedule = async (petId: number): Promise<PetSchedule> => {
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
}: {
  petId: number;
  name?: string | null;
  time?: string | null;
  portion?: number | null;
}): Promise<ScheduleEvent> => {
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
}: {
  petId: number;
  eventId: number;
  name?: string | null;
  time?: string | null;
  portion?: number | null;
  enabled?: boolean | null;
}): Promise<ScheduleEvent> => {
  const res = await fetch(`${PET_API_BASE}/${petId}/schedule/${eventId}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, time, portion, enabled }),
  });
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
};

export const deletePetSchedule = async ({ petId, eventId }: { petId: number; eventId: number }): Promise<unknown> => {
  const res = await fetch(`${PET_API_BASE}/${petId}/schedule/${eventId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error(res.statusText);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
};
