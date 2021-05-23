import { createRecipe } from "../constants/feeder";

const setRecipeReducer = (
  state = { _loading: false, _requestFailed: false, recipe: {} },
  action
) => {
  switch (action.type) {
    case createRecipe.CREATE_RECIPE:
      return {
        ...state,
        _loading: true,
      };
    case createRecipe.CREATE_RECIPE_SUCCESS:
      return {
        ...state,
        _requestFailed: false,
        _loading: false,
        recipe: action.payload,
      };
    case createRecipe.CREATE_RECIPE_FAILURE:
      return {
        ...state,
        _loading: false,
        _requestFailed: true,
        recipe: {},
      };
    default:
      return state;
  }
};

export default setRecipeReducer;
