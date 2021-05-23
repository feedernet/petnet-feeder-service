import { modifyPet } from "../constants/pet";

const modifyPetReducer = (
  state = { _loading: false, _requestFailed: false, pet: {} },
  action
) => {
  switch (action.type) {
    case modifyPet.MOD_PET:
      return {
        ...state,
        _loading: true,
      };
    case modifyPet.MOD_PET_SUCCESS:
      return {
        ...state,
        _requestFailed: false,
        _loading: false,
        pet: action.payload,
      };
    case modifyPet.MOD_PET_FAILURE:
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

export default modifyPetReducer;
