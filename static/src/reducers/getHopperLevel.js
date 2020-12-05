import {getHopperLevel} from "../constants/feeder";

const getHopperLevelReducer = (state = {_loading: false, _requestFailed: false, level: null}, action) => {
    switch (action.type) {
    case getHopperLevel.GET_HOPPER_LEVEL:
        return {
            ...state,
            _loading: true
        };
    case getHopperLevel.GET_HOPPER_LEVEL_SUCCESS:
        return {
            ...state,
            _requestFailed: false,
            _loading: false,
            level: action.payload.level
        };
    case getHopperLevel.GET_HOPPER_LEVEL_FAILURE:
        return {
            ...state,
            _loading: false,
            _requestFailed: true,
            level: null
        };
    default:
        return state;
    }
};

export default getHopperLevelReducer;