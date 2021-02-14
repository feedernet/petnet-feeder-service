import { getHopperLevel } from "../constants/feeder";

const getHopperLevelReducer = (
  state = { _loading: false, _requestFailed: false, levels: {} },
  action
) => {
  switch (action.type) {
    case getHopperLevel.GET_HOPPER_LEVEL:
      return {
        ...state,
        _loading: true,
      };
    case getHopperLevel.GET_HOPPER_LEVEL_SUCCESS:
      const levels = state.levels;
      levels[action.meta.deviceId] = action.payload.level;
      return {
        ...state,
        _requestFailed: false,
        _loading: false,
        levels,
      };
    case getHopperLevel.GET_HOPPER_LEVEL_FAILURE:
      return {
        ...state,
        _loading: false,
        _requestFailed: true,
      };
    default:
      return state;
  }
};

export default getHopperLevelReducer;
