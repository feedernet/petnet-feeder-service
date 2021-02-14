import { createPet } from "../constants/pet";

const createPetReducer = (
  state = { _loading: false, _requestFailed: false, pet: {} },
  action
) => {
  switch (action.type) {
    case createPet.CREATE_PET:
      return {
        ...state,
        _loading: true,
      };
    case createPet.CREATE_PET_SUCCESS:
      return {
        ...state,
        _requestFailed: false,
        _loading: false,
        pet: action.payload,
      };
    case createPet.CREATE_PET_FAILURE:
      return {
        ...state,
        _loading: false,
        _requestFailed: true,
        pet: {},
      };
    default:
      return state;
  }
};

export default createPetReducer;
