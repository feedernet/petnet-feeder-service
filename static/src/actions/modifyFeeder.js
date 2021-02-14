import { FEEDER_API_BASE } from "../constants";
import { modifyFeeder } from "../constants/feeder";
import { createAction } from "redux-api-middleware";

export const modifyFeederAction = (
  deviceId = "",
  name = null,
  timezone = null,
  frontButton = null,
  currentRecipe = null,
  black = null
) => {
  const body = JSON.stringify({
    name,
    timezone,
    frontButton,
    currentRecipe,
    black,
  });

  const meta = {
    method: "PUT",
    endpoint: `${FEEDER_API_BASE}/${deviceId}`,
    body,
  };
  return createAction({
    endpoint: meta.endpoint,
    types: [
      { type: modifyFeeder.MOD_FEEDER, meta },
      { type: modifyFeeder.MOD_FEEDER_SUCCESS, meta },
      { type: modifyFeeder.MOD_FEEDER_FAILURE, meta },
    ],
    method: meta.method,
    credentials: "include",
    body,
  });
};
