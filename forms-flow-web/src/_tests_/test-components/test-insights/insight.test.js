import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { Provider } from "react-redux";
import { appState } from "../../test-redux-states/redux-state-sample";
import Insights from "../../../components/Insights/Insights";
import StoreService from "../../../services/StoreService";
import { mock1 } from "./constant";
import { Router, Route } from "react-router";
import { render as rtlRender } from "@testing-library/react";
import { createMemoryHistory } from "history";

const store = StoreService.configureStore();
jest.mock("@formsflow/service", () => ({
  __esModule: true,
  default: jest.fn(() => ({})),
  RequestService: {
    httpGETRequest: () => Promise.resolve(jest.fn(() => ({ data: {} }))),
  },
}));

function renderWithRouterMatch(
  Ui,
  additionalProps,
  {
    path = "/",
    route = "/",
    history = createMemoryHistory({ initialEntries: [route] }),
  } = {}
) {
  return {
    ...rtlRender(
      <Provider store={store}>
        <Router history={history}>
          <Route path={path} render={() => <Ui {...additionalProps} />} />
        </Router>
      </Provider>
    ),
  };
}

test("Render Insight  Component with insights prop passed", () => {
  renderWithRouterMatch(Insights, {
    isInsightLoading: appState.insights.isInsightLoading,
    dashboards: appState.insights.dashboardsList,
    activeDashboard: appState.insights.dashboardDetail,
  });
});
test("Render Insight  Component with insights prop passed", () => {
  renderWithRouterMatch(Insights, {
    isInsightLoading: mock1.isInsightLoading,
    dashboards: mock1.dashboardsList,
    activeDashboard: mock1.dashboardDetail,
  });
});
