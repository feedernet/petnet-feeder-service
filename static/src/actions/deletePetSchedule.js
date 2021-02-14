import { PET_API_BASE } from "../constants";
import { deletePetSchedule } from "../constants/pet";
import { createAction } from "redux-api-middleware";

export const deletePetScheduleAction = (petId, eventId) => {
  const meta = {
    method: "DELETE",
    endpoint: `${PET_API_BASE}/${petId}/schedule/${eventId}`,
    petId,
  };
  return createAction({
    endpoint: meta.endpoint,
    types: [
      { type: deletePetSchedule.DELETE_PET_SCHEDULE, meta },
      { type: deletePetSchedule.DELETE_PET_SCHEDULE_SUCCESS, meta },
      { type: deletePetSchedule.DELETE_PET_SCHEDULE_FAILURE, meta },
    ],
    method: meta.method,
    credentials: "include",
  });
};
