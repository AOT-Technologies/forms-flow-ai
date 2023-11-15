import Index from "../../../components/ServiceFlow/index";
import React from "react";
import { render as rtlRender, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { Provider } from "react-redux";
import { Router, Route } from "react-router";
import { createMemoryHistory } from "history";
import * as redux from "react-redux";
import StoreService from "../../../services/StoreService";
import { initialstate } from "./constants";
import { MULTITENANCY_ENABLED } from "../../../constants/constants";
jest.mock("@formsflow/service", () => ({
  __esModule: true,
  default: jest.fn(() => ({})),
  RequestService: {
    httpGETRequest: () => Promise.resolve(jest.fn(() => ({ data: {} }))),
    httpPOSTRequestWithHAL: () =>
      Promise.resolve(jest.fn(() => ({ data: {} }))),
  },
  StorageService: {
    get: jest.fn(() => ""),
    User: {
      AUTH_TOKEN: "",
    },
  },
}));
let store;
beforeEach(() => {
  store = StoreService.configureStore();
});

function renderWithRouterMatch(
  ui,
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
          <Route path={path} component={ui} />
        </Router>
      </Provider>
    ),
  };
}

it("should render the serviceflow index component without breaking", async () => {
  if (!MULTITENANCY_ENABLED) {
    const spy = jest.spyOn(redux, "useSelector");
    spy.mockImplementation((callback) => callback(initialstate));
    renderWithRouterMatch(Index, {
      path: "/task",
      route: "/task",
    });
    expect(screen.getByText("List View")).toBeInTheDocument();
    expect(screen.getByText("Card View")).toBeInTheDocument();
  }
});
