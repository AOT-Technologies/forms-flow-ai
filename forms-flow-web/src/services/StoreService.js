import thunk from "redux-thunk";
import {createBrowserHistory} from "history";
import {routerMiddleware} from "connected-react-router";
import {applyMiddleware, compose, createStore} from "redux";
import logger from "redux-logger";

import createRootReducer from "../modules";

const history = createBrowserHistory();

function configureStore(preloadedState){
  const enhancers = [];

  if (process.env.NODE_ENV === 'development') {
    enhancers.push(applyMiddleware(logger));
  }

  const middleware = [
    thunk,
    routerMiddleware(history)
  ];

  const composedEnhancers = compose(applyMiddleware(...middleware), ...enhancers);
  return createStore(
    createRootReducer(history),
    composedEnhancers
  );
}
export default {
  history,
  configureStore
}
