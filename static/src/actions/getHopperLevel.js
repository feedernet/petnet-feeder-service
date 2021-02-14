import { FEEDER_API_BASE } from "../constants";
import { getHopperLevel } from "../constants/feeder";
import { createAction } from "redux-api-middleware";

export const getHopperLevelAction = (deviceId) => {
  const meta = {
    method: "GET",
    endpoint: `${FEEDER_API_BASE}/${deviceId}/hopper`,
    deviceId,
  };
  return createAction({
    endpoint: meta.endpoint,
    types: [
      { type: getHopperLevel.GET_HOPPER_LEVEL, meta },
      { type: getHopperLevel.GET_HOPPER_LEVEL_SUCCESS, meta },
      { type: getHopperLevel.GET_HOPPER_LEVEL_FAILURE, meta },
    ],
    method: meta.method,
    credentials: "include",
  });
};
