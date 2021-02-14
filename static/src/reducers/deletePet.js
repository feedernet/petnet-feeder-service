import { deletePet } from "../constants/pet";

const deletePetReducer = (
  state = { _loading: false, _requestFailed: false },
  action
) => {
  switch (action.type) {
    case deletePet.DELETE_PET:
      return {
        ...state,
        _loading: true,
      };
    case deletePet.DELETE_PET_SUCCESS:
      return {
        ...state,
        _requestFailed: false,
        _loading: false,
      };
    case deletePet.DELETE_PET_FAILURE:
      return {
        ...state,
        _loading: false,
        _requestFailed: true,
      };
    default:
      return state;
  }
};

export default deletePetReducer;
