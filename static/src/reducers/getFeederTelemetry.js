import { getFeederTelemetry } from "../constants/feeder";

const getFeederTelemetryReducer = (
  state = { _loading: false, _requestFailed: false, data: {} },
  action
) => {
  switch (action.type) {
    case getFeederTelemetry.GET_FEEDER_TELEMETRY:
      return {
        ...state,
        _loading: true,
      };
    case getFeederTelemetry.GET_FEEDER_TELEMETRY_SUCCESS:
      return {
        ...state,
        _requestFailed: false,
        _loading: false,
        data: action.payload,
      };
    case getFeederTelemetry.GET_FEEDER_TELEMETRY_FAILURE:
      return {
        ...state,
        _loading: false,
        _requestFailed: true,
        data: {},
      };
    default:
      return state;
  }
};

export default getFeederTelemetryReducer;
