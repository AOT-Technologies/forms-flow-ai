import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render as rtlRender, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import StoreService from "../../../services/StoreService";
import HistoryList from "../../../components/Application/ApplicationHistory";
import * as redux from "react-redux";
import { createMemoryHistory } from "history";
import { Router, Route } from "react-router";

let store;
jest.mock("@formsflow/service", () => ({
  __esModule: true,
  default: jest.fn(() => ({})),
  RequestService: {
    httpGETRequest: () => Promise.resolve(jest.fn(() => ({ data: {} }))),
  },
  StorageService: {
    get: () => jest.fn(() => {}),
    User: {
      AUTH_TOKEN: "",
    },
  },
}));

function renderWithRouterMatch(
  Ui,
  extraProps,
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
            render={(props) => <Ui {...props} {...extraProps} />}
          />
        </Router>
      </Provider>
    ),
  };
}

beforeEach(() => {
  store = StoreService.configureStore();
});

describe("Integration test for HistoryList component", () => {
  test("Should render the history list table when the valid props are passed", async () => {
    const spy = jest.spyOn(redux, "useSelector");
    spy.mockImplementation((callback) =>
      callback({
        taskAppHistory: {
          appHistory: [
            {
              applicationStatus: "New",
              created: "2021-10-11 06:59:23.433982",
              formUrl: "",
            },
          ],
          isHistoryListLoading: false,
        },
      })
    );

    renderWithRouterMatch(
      HistoryList,
      { applicationId: 100 },
      {
        path: "/",
        route: "/",
      }
    );
    expect(screen.getByText("New")).toBeInTheDocument();
    expect(screen.queryByText("View Submission")).toBeInTheDocument();
  });

  test("Should not render the history list table when the invalid props are passed", async () => {
    const spy = jest.spyOn(redux, "useSelector");
    spy.mockImplementation((callback) =>
      callback({
        taskAppHistory: {
          appHistory: [],
          isHistoryListLoading: false,
        },
      })
    );

    renderWithRouterMatch(
      HistoryList,
      { applicationId: 101 },
      {
        path: "/",
        route: "/",
      }
    );
    expect(screen.queryByText("New")).not.toBeInTheDocument();
    expect(screen.queryByText("View Submission")).not.toBeInTheDocument();
    expect(
      screen.getByText("No Submission History found")
    ).toBeInTheDocument();
  });
});
