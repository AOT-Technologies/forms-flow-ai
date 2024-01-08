import { createBrowserHistory } from "history";
import { routerMiddleware } from "connected-react-router";
import logger from "redux-logger";
import { configureStore as configureStoreApp } from '@reduxjs/toolkit';
import createRootReducer from "../modules";

const history = createBrowserHistory();

// eslint-disable-next-line no-unused-vars
function configureStore(preloadedState) {
  const enhancers = [routerMiddleware(history)];

  const node_env =
    (window._env_ && window._env_.NODE_ENV) || process.env.NODE_ENV;
  if (node_env === "development") {
    enhancers.push(logger);
  }
 // thunk midleware will come default in redux toolkit
  // const middleware = [thunk, ];

  // const composedEnhancers = compose(
  //   applyMiddleware(...middleware),
  //   ...enhancers
  // );
  return configureStoreApp({reducer:createRootReducer(history), 
    middleware: (getDefaultMiddleware) =>
     getDefaultMiddleware({ serializableCheck: false,}).concat(enhancers)
     });
}

const StoreService = {
  history,
  configureStore,
};

export default StoreService;
