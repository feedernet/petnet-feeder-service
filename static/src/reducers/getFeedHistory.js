import { getFeedHistory } from "../constants/feeder";

const getFeedHistoryReducer = (
  state = {
    _loading: false,
    _requestFailed: false,
    history: [],
    totalPages: 0,
  },
  action
) => {
  switch (action.type) {
    case getFeedHistory.GET_FEED_HISTORY:
      return {
        ...state,
        _loading: true,
      };
    case getFeedHistory.GET_FEED_HISTORY_SUCCESS:
      return {
        ...state,
        _requestFailed: false,
        _loading: false,
        history: action.payload.data,
        totalPages: action.payload.totalPages,
      };
    case getFeedHistory.GET_FEED_HISTORY_FAILURE:
      return {
        ...state,
        _loading: false,
        _requestFailed: true,
        history: [],
        totalPages: 0,
      };
    default:
      return state;
  }
};

export default getFeedHistoryReducer;
