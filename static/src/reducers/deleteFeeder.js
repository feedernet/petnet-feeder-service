import { deleteFeeder } from "../constants/feeder";

const deleteFeederReducer = (
  state = { _loading: false, _requestFailed: false },
  action
) => {
  switch (action.type) {
    case deleteFeeder.DELETE_FEEDER:
      return {
        ...state,
        _loading: true,
      };
    case deleteFeeder.DELETE_FEEDER_SUCCESS:
      return {
        ...state,
        _requestFailed: false,
        _loading: false,
      };
    case deleteFeeder.DELETE_FEEDER_FAILURE:
      return {
        ...state,
        _loading: false,
        _requestFailed: true,
      };
    default:
      return state;
  }
};

export default deleteFeederReducer;
