import {getPetSchedule} from "../constants/pet";

const getPetScheduleReducer = (state = {_loading: false, _requestFailed: false, schedule: {}}, action) => {
    switch (action.type) {
    case getPetSchedule.GET_PET_SCHEDULE:
        return {
            ...state,
            _loading: true
        };
    case getPetSchedule.GET_PET_SCHEDULE_SUCCESS:
        return {
            ...state,
            _requestFailed: false,
            _loading: false,
            schedule: action.payload
        };
    case getPetSchedule.GET_PET_SCHEDULE_FAILURE:
        return {
            ...state,
            _loading: false,
            _requestFailed: true
        };
    default:
        return state;
    }
};

export default getPetScheduleReducer;