/* eslint-disable no-import-assign */
import React from "react";
import Navbar from "../../containers/NavBar";
import "@testing-library/jest-dom/extend-expect";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { Router, Route } from "react-router";
import { createMemoryHistory } from "history";
import { render as rtlRender, screen, waitFor } from "@testing-library/react";
import * as redux from "react-redux";
import * as constants from "../../constants/constants";

let store;
let mockStore = configureStore([]);
beforeEach(() => {
  store = mockStore({});
  store.dispatch = jest.fn();
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

it("should render Navbar without breaking", () => {
  const mockstate = {
    user: {
      isAuthenticated: true,
      roles: ["formsflow-reviewer"],
      selectLanguages: [],
    },
  };
  const spy = jest.spyOn(redux, "useSelector");
  spy.mockImplementation((callback) => callback(mockstate));
  renderWithRouterMatch(Navbar, {
    path: "/task",
    route: "/task",
  });
  expect(screen.getByText("Forms")).toBeInTheDocument();
  expect(screen.getByTestId("Dashboards")).toBeInTheDocument();
});

it("should render the application title in multitenant environment", async () => {
  constants.MULTITENANCY_ENABLED = true;
  const mockState = {
    user: {
      isAuthenticated: true,
      roles: ["formsflow-reviewer"],
    },
    tenants: {
      tenantId: "test-tenant",
      tenantDetail: {},
      isTenantDetailLoading: false,
      tenantData: {
        created_by: "None",
        created_on: "2022-06-03 04:59:31.383299",
        details: {
          applicationTitle: "test-tenant",
          skipKeycloakSteps: false,
        },
        id: "118",
        key: "test-tenant",
        name: "test-tenant",
      },
      isTenantDataLoading: false,
    },
  };
  const spy = jest.spyOn(redux, "useSelector");
  spy.mockImplementation((callback) => callback(mockState));
  renderWithRouterMatch(Navbar, {
    path: "/",
    route: "/",
  });
  await waitFor(() => screen.getByText("test-tenant"));
  expect(screen.getByText("test-tenant")).toBeInTheDocument();
});

it("Should render application name from the config", async () => {
  constants.APPLICATION_NAME = "test-application-name";
  constants.MULTITENANCY_ENABLED = false;
  const mockState = {
    user: {
      isAuthenticated: true,
      roles: ["formsflow-reviewer"],
    },
  };
  const spy = jest.spyOn(redux, "useSelector");
  spy.mockImplementation((callback) => callback(mockState));
  renderWithRouterMatch(Navbar, {
    path: "/",
    route: "/",
  });
  expect(screen.getByText("test-application-name")).toBeInTheDocument();
});
