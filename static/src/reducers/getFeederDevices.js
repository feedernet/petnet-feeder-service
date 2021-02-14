import { getFeeders } from "../constants/feeder";

const getFeederDevicesReducer = (
  state = { _loading: false, _requestFailed: false, feeders: [] },
  action
) => {
  switch (action.type) {
    case getFeeders.GET_FEEDERS:
      return {
        ...state,
        _loading: true,
      };
    case getFeeders.GET_FEEDERS_SUCCESS:
      return {
        ...state,
        _requestFailed: false,
        _loading: false,
        feeders: action.payload,
      };
    case getFeeders.GET_FEEDERS_FAILURE:
      return {
        ...state,
        _loading: false,
        _requestFailed: true,
        feeders: [],
      };
    default:
      return state;
  }
};

export default getFeederDevicesReducer;
