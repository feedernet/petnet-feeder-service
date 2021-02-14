import { FEEDER_API_BASE } from "../constants";
import { getFeedHistory } from "../constants/feeder";
import { createAction } from "redux-api-middleware";

export const getFeedHistoryAction = (
  deviceId = "",
  pageSize = 10,
  page = 1
) => {
  let url = FEEDER_API_BASE;
  if (deviceId !== "") {
    url += `/${deviceId}`;
  }

  const meta = {
    method: "GET",
    endpoint: `${url}/history?size=${pageSize}&page=${page}`,
  };
  return createAction({
    endpoint: meta.endpoint,
    types: [
      { type: getFeedHistory.GET_FEED_HISTORY, meta },
      { type: getFeedHistory.GET_FEED_HISTORY_SUCCESS, meta },
      { type: getFeedHistory.GET_FEED_HISTORY_FAILURE, meta },
    ],
    method: meta.method,
    credentials: "include",
  });
};
