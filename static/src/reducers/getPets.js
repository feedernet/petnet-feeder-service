import { getPets } from "../constants/pet";

const getPetsReducer = (
  state = { _loading: false, _requestFailed: false, pets: [] },
  action
) => {
  switch (action.type) {
    case getPets.GET_PETS:
      return {
        ...state,
        _loading: true,
      };
    case getPets.GET_PETS_SUCCESS:
      return {
        ...state,
        _requestFailed: false,
        _loading: false,
        pets: action.payload,
      };
    case getPets.GET_PETS_FAILURE:
      return {
        ...state,
        _loading: false,
        _requestFailed: true,
        pets: [],
      };
    default:
      return state;
  }
};

export default getPetsReducer;
