import { setHopperLevel } from "../constants/feeder";

const setHopperLevelReducer = (
  state = { _loading: false, _requestFailed: false },
  action
) => {
  switch (action.type) {
    case setHopperLevel.SET_HOPPER_LEVEL:
      return {
        ...state,
        _loading: true,
      };
    case setHopperLevel.SET_HOPPER_LEVEL_SUCCESS:
      return {
        ...state,
        _requestFailed: false,
        _loading: false,
      };
    case setHopperLevel.SET_HOPPER_LEVEL_FAILURE:
      return {
        ...state,
        _loading: false,
        _requestFailed: true,
        level: null,
      };
    default:
      return state;
  }
};

export default setHopperLevelReducer;
