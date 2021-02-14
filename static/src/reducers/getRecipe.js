import { getRecipe } from "../constants/feeder";

const getRecipeReducer = (
  state = { _loading: false, _requestFailed: false, recipes: {} },
  action
) => {
  switch (action.type) {
    case getRecipe.GET_RECIPE:
      return {
        ...state,
        _loading: true,
      };
    case getRecipe.GET_RECIPE_SUCCESS:
      const recipes = state.recipes;
      recipes[action.meta.deviceId] = action.payload;
      return {
        ...state,
        _requestFailed: false,
        _loading: false,
        recipes: recipes,
      };
    case getRecipe.GET_RECIPE_FAILURE:
      return {
        ...state,
        _loading: false,
        _requestFailed: true,
      };
    default:
      return state;
  }
};

export default getRecipeReducer;
