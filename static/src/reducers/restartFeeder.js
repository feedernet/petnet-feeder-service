import { restartFeeder } from "../constants/feeder";

const restartFeederReducer = (
  state = { _loading: false, _requestFailed: false },
  action
) => {
  switch (action.type) {
    case restartFeeder.RESTART_FEEDER:
      return {
        ...state,
        _loading: true,
      };
    case restartFeeder.RESTART_FEEDER_SUCCESS:
      return {
        ...state,
        _requestFailed: false,
        _loading: false,
      };
    case restartFeeder.RESTART_FEEDER_FAILURE:
      return {
        ...state,
        _loading: false,
        _requestFailed: true,
      };
    default:
      return state;
  }
};

export default restartFeederReducer;
