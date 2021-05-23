import { FEEDER_API_BASE } from "../constants";
import { createRecipe } from "../constants/feeder";
import { createAction } from "redux-api-middleware";

export const setRecipeAction = (
  deviceId,
  g_per_tbsp = null,
  tbsp_per_feeding = null,
  name = null,
  budget_tbsp = null
) => {
  const body = JSON.stringify({
    g_per_tbsp,
    tbsp_per_feeding,
    name,
    budget_tbsp,
  });

  const meta = {
    method: "PUT",
    endpoint: `${FEEDER_API_BASE}/${deviceId}/recipe`,
    body,
  };
  return createAction({
    endpoint: meta.endpoint,
    types: [
      { type: createRecipe.CREATE_RECIPE, meta },
      { type: createRecipe.CREATE_RECIPE_SUCCESS, meta },
      { type: createRecipe.CREATE_RECIPE_FAILURE, meta },
    ],
    method: meta.method,
    credentials: "include",
    body,
  });
};
