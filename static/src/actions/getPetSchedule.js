import { PET_API_BASE } from "../constants";
import { getPetSchedule } from "../constants/pet";
import { createAction } from "redux-api-middleware";

export const getPetScheduleAction = (petId) => {
  const meta = {
    method: "GET",
    endpoint: `${PET_API_BASE}/${petId}/schedule`,
    petId,
  };
  return createAction({
    endpoint: meta.endpoint,
    types: [
      { type: getPetSchedule.GET_PET_SCHEDULE, meta },
      { type: getPetSchedule.GET_PET_SCHEDULE_SUCCESS, meta },
      { type: getPetSchedule.GET_PET_SCHEDULE_FAILURE, meta },
    ],
    method: meta.method,
    credentials: "include",
  });
};
