import { modifyFeeder } from "../constants/feeder";

const modifyFeederReducer = (
  state = { _loading: false, _requestFailed: false, device: {} },
  action
) => {
  switch (action.type) {
    case modifyFeeder.MOD_FEEDER:
      return {
        ...state,
        _loading: true,
      };
    case modifyFeeder.MOD_FEEDER_SUCCESS:
      return {
        ...state,
        _requestFailed: false,
        _loading: false,
        device: action.payload,
      };
    case modifyFeeder.MOD_FEEDER_FAILURE:
      return {
        ...state,
        _loading: false,
        _requestFailed: true,
        device: {},
      };
    default:
      return state;
  }
};

export default modifyFeederReducer;
