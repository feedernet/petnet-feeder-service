import { PET_API_BASE } from "../constants";
import { apiFetch } from "./client";

export interface Pet {
  id: number;
  name: string;
  animal_type: string;
  weight: number;
  birthday: number | null;
  activity_level: number | null;
  image: string | null;
  device_hid: string | null;
}

export interface ScheduleEvent {
  event_id: number;
  name: string | null;
  time: number | null;
  portion: number | null;
  enabled: boolean;
}

export interface PetSchedule {
  events: ScheduleEvent[];
}

export const getPets = (): Promise<Pet[]> => apiFetch(`${PET_API_BASE}/`);

export const createPet = ({
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
}): Promise<Pet> =>
  apiFetch(`${PET_API_BASE}`, {
    method: "POST",
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

export const modifyPet = ({
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
}): Promise<Pet> =>
  apiFetch(`${PET_API_BASE}/${pet_id}`, {
    method: "PUT",
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

export const deletePet = (petId: number): Promise<unknown> =>
  apiFetch(`${PET_API_BASE}/${petId}`, { method: "DELETE" });

export const getPetSchedule = (petId: number): Promise<PetSchedule> =>
  apiFetch(`${PET_API_BASE}/${petId}/schedule`);

export const createPetSchedule = ({
  petId,
  name = null,
  time = null,
  portion = null,
}: {
  petId: number;
  name?: string | null;
  time?: string | null;
  portion?: number | null;
}): Promise<ScheduleEvent> =>
  apiFetch(`${PET_API_BASE}/${petId}/schedule`, {
    method: "POST",
    body: JSON.stringify({ name, time, portion }),
  });

export const updatePetSchedule = ({
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
}): Promise<ScheduleEvent> =>
  apiFetch(`${PET_API_BASE}/${petId}/schedule/${eventId}`, {
    method: "PUT",
    body: JSON.stringify({ name, time, portion, enabled }),
  });

export const deletePetSchedule = ({
  petId,
  eventId,
}: {
  petId: number;
  eventId: number;
}): Promise<unknown> =>
  apiFetch(`${PET_API_BASE}/${petId}/schedule/${eventId}`, {
    method: "DELETE",
  });
