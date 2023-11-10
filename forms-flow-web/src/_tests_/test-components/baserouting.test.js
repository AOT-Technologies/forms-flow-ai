import React from "react";
import { render as rtlRender, screen } from "@testing-library/react";
import BaseRouting from "../../../src/components/BaseRouting";
import "@testing-library/jest-dom/extend-expect";
import { Provider } from "react-redux";
import { Router, Route } from "react-router";
import { createMemoryHistory } from "history";
import configureStore from "redux-mock-store";
jest.mock("@formsflow/service", () => ({
  __esModule: true,
  default: jest.fn(() => ({})),
  RequestService: {
    httpGETRequest: () => Promise.resolve(jest.fn(() => ({ data: {} }))),
    httpPOSTRequestWithHAL: () =>
      Promise.resolve(jest.fn(() => ({ data: {} }))),
  },
  KeycloakService: {
    getInstance: () => Promise.resolve(jest.fn(() => {})),
  },
  StorageService: {
    get: () => jest.fn(() => {}),
    User: {
      AUTH_TOKEN: "",
    },
  },
}));
let store;
let mockStore = configureStore([]);

function renderWithRouterMatch(
  Ui,
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
          <Route
            path={path}
            render={(props) => (
              <Ui
                {...props}
                getKcInstance={jest.fn}
                subscribe={jest.fn}
                publish={jest.fn}
              />
            )}
          />
        </Router>
      </Provider>
    ),
  };
}

it("should render the Baserouting component without breaking", async () => {
  store = mockStore({
    user: {
      isAuthenticated: true,
      roles: ["formsflow-client"],
      selectLanguages: [{ name: "en", value: "English" }],
    },
    forms: {
      error: "",
      isActive: true,
    },
    formDelete: {
      formDelete: {
        modalOpen: false,
        formId: "",
        formName: "",
      },
    },
    bpmForms: {
      isActive: true,
    },
    formCheckList: {
      designerFormLoading: false,
      formUploadFormList: [],
      searchFormLoading: true,
    },
    process: {
      applicationCountResponse: false,
      formProcessList: [],
    },
  });
  store.dispatch = jest.fn();
  renderWithRouterMatch(BaseRouting, {
    path: "/",
    route: "/",
  });
  expect(screen.getAllByText("Forms")).toHaveLength(1);
});

it("should not render the Baserouting component without authenticating breaking", async () => {
  store = mockStore({
    user: {
      isAuthenticated: false,
      roles: [],
    },
  });
  store.dispatch = jest.fn();
  renderWithRouterMatch(BaseRouting, {
    path: "/",
    route: "/",
  });
  expect(screen.queryByText("Forms")).not.toBeInTheDocument();
});
