import { PET_API_BASE } from "../constants";
import { getPets } from "../constants/pet";
import { createAction } from "redux-api-middleware";

export const getPetsAction = () => {
  const meta = {
    method: "GET",
    endpoint: `${PET_API_BASE}/`,
  };
  return createAction({
    endpoint: meta.endpoint,
    types: [
      { type: getPets.GET_PETS, meta },
      { type: getPets.GET_PETS_SUCCESS, meta },
      { type: getPets.GET_PETS_FAILURE, meta },
    ],
    method: meta.method,
    credentials: "include",
  });
};
