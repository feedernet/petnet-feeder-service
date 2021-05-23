import {
  getPetSchedule,
  updatePetSchedule,
  deletePetSchedule,
  createPetSchedule,
} from "../constants/pet";

const getPetScheduleReducer = (
  state = { _loading: false, _requestFailed: false, schedules: {} },
  action
) => {
  switch (action.type) {
    case getPetSchedule.GET_PET_SCHEDULE:
    case createPetSchedule.CREATE_PET_SCHEDULE:
    case updatePetSchedule.UPDATE_PET_SCHEDULE:
    case deletePetSchedule.DELETE_PET_SCHEDULE:
      return {
        ...state,
        _loading: true,
      };
    case getPetSchedule.GET_PET_SCHEDULE_SUCCESS:
    case createPetSchedule.CREATE_PET_SCHEDULE_SUCCESS:
    case updatePetSchedule.UPDATE_PET_SCHEDULE_SUCCESS:
    case deletePetSchedule.DELETE_PET_SCHEDULE_SUCCESS:
      const schedules = state.schedules;
      schedules[action.meta.petId] = action.payload.events;
      return {
        ...state,
        _requestFailed: false,
        _loading: false,
        schedules,
      };
    case getPetSchedule.GET_PET_SCHEDULE_FAILURE:
    case createPetSchedule.CREATE_PET_SCHEDULE_FAILURE:
    case updatePetSchedule.UPDATE_PET_SCHEDULE_FAILURE:
    case deletePetSchedule.DELETE_PET_SCHEDULE_FAILURE:
      return {
        ...state,
        _loading: false,
        _requestFailed: true,
      };
    default:
      return state;
  }
};

export default getPetScheduleReducer;
