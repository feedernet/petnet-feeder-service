import { PET_API_BASE } from "../constants";
import { createPetSchedule } from "../constants/pet";
import { createAction } from "redux-api-middleware";

export const createPetScheduleAction = (
  petId,
  name = null,
  time = null,
  portion = null
) => {
  const body = JSON.stringify({
    name,
    time,
    portion,
  });

  const meta = {
    method: "POST",
    endpoint: `${PET_API_BASE}/${petId}/schedule`,
    body,
    petId,
  };
  return createAction({
    endpoint: meta.endpoint,
    types: [
      { type: createPetSchedule.CREATE_PET_SCHEDULE, meta },
      { type: createPetSchedule.CREATE_PET_SCHEDULE_SUCCESS, meta },
      { type: createPetSchedule.CREATE_PET_SCHEDULE_FAILURE, meta },
    ],
    method: meta.method,
    credentials: "include",
    body,
  });
};
