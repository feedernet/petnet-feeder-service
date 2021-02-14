import { createStore, applyMiddleware } from "redux";
import { apiMiddleware } from "redux-api-middleware";
import thunkMiddleware from "redux-thunk";
import { createLogger } from "redux-logger";

import reducers from "./reducers";

const middleware = [thunkMiddleware, apiMiddleware];

if (process.env.NODE_ENV === "development") {
  middleware.push(createLogger());
}

const storeCreator = (preloadedState) =>
  createStore(reducers, preloadedState, applyMiddleware(...middleware));

const emptyStore = storeCreator({});
export default storeCreator(emptyStore.getState());
