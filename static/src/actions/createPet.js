import { PET_API_BASE } from "../constants";
import { createPet } from "../constants/pet";
import { createAction } from "redux-api-middleware";

export const createPetAction = (
  name,
  animal_type,
  weight,
  birthday,
  activity_level,
  image = null,
  device_hid = null
) => {
  const body = JSON.stringify({
    name,
    animal_type,
    weight,
    birthday,
    image,
    activity_level,
    device_hid,
  });

  const meta = {
    method: "POST",
    endpoint: `${PET_API_BASE}`,
    body,
  };
  return createAction({
    endpoint: meta.endpoint,
    types: [
      { type: createPet.CREATE_PET, meta },
      { type: createPet.CREATE_PET_SUCCESS, meta },
      { type: createPet.CREATE_PET_FAILURE, meta },
    ],
    method: meta.method,
    credentials: "include",
    body,
  });
};
