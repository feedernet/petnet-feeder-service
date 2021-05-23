import { PET_API_BASE } from "../constants";
import { updatePetSchedule } from "../constants/pet";
import { createAction } from "redux-api-middleware";

export const updatePetScheduleAction = (
  petId,
  eventId,
  name = null,
  time = null,
  portion = null,
  enabled = null
) => {
  const body = JSON.stringify({
    name,
    time,
    portion,
    enabled,
  });

  const meta = {
    method: "PUT",
    endpoint: `${PET_API_BASE}/${petId}/schedule/${eventId}`,
    body,
    petId,
  };
  return createAction({
    endpoint: meta.endpoint,
    types: [
      { type: updatePetSchedule.UPDATE_PET_SCHEDULE, meta },
      { type: updatePetSchedule.UPDATE_PET_SCHEDULE_SUCCESS, meta },
      { type: updatePetSchedule.UPDATE_PET_SCHEDULE_FAILURE, meta },
    ],
    method: meta.method,
    credentials: "include",
    body,
  });
};
