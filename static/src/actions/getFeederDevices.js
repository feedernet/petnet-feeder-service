import { FEEDER_API_BASE } from "../constants";
import { getFeeders } from "../constants/feeder";
import { createAction } from "redux-api-middleware";

export const getFeederDevices = () => {
  const meta = {
    method: "GET",
    endpoint: `${FEEDER_API_BASE}/`,
  };
  return createAction({
    endpoint: meta.endpoint,
    types: [
      { type: getFeeders.GET_FEEDERS, meta },
      { type: getFeeders.GET_FEEDERS_SUCCESS, meta },
      { type: getFeeders.GET_FEEDERS_FAILURE, meta },
    ],
    method: meta.method,
    credentials: "include",
  });
};
