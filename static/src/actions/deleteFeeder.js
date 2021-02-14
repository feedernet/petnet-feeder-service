import { FEEDER_API_BASE } from "../constants";
import { deleteFeeder } from "../constants/feeder";
import { createAction } from "redux-api-middleware";

export const deleteFeederAction = (deviceId) => {
  const meta = {
    method: "DELETE",
    endpoint: `${FEEDER_API_BASE}/${deviceId}`,
  };
  return createAction({
    endpoint: meta.endpoint,
    types: [
      { type: deleteFeeder.DELETE_FEEDER, meta },
      { type: deleteFeeder.DELETE_FEEDER, meta },
      { type: deleteFeeder.DELETE_FEEDER, meta },
    ],
    method: meta.method,
    credentials: "include",
  });
};
