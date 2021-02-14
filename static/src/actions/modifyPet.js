import { PET_API_BASE } from "../constants";
import { modifyPet } from "../constants/pet";
import { createAction } from "redux-api-middleware";

export const modifyPetAction = (
  pet_id,
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
    method: "PUT",
    endpoint: `${PET_API_BASE}/${pet_id}`,
    body,
  };
  return createAction({
    endpoint: meta.endpoint,
    types: [
      { type: modifyPet.MOD_PET, meta },
      { type: modifyPet.MOD_PET_SUCCESS, meta },
      { type: modifyPet.MOD_PET_FAILURE, meta },
    ],
    method: meta.method,
    credentials: "include",
    body,
  });
};
