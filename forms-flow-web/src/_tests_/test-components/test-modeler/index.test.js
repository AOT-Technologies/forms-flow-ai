import React from "react";
import { render as rtlRender, screen } from "@testing-library/react";
import Index from "../../../components/Modeler/index";
import "@testing-library/jest-dom/extend-expect";
import { Provider } from "react-redux";
import StoreService from "../../../services/StoreService";
import { Router, Route } from "react-router";
import { createMemoryHistory } from "history";
import * as redux from "react-redux";
jest.mock("@formsflow/service", () => ({
  __esModule: true,
  default: jest.fn(() => ({})),
  RequestService: {
    httpGETRequest: () => Promise.resolve(jest.fn(() => ({ data: {} }))),
    httpPUTRequest: () => Promise.resolve(jest.fn(() => ({ data: {} }))),
  },
  StorageService: {
    get: () => jest.fn(() => {}),
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

it("should render the Process-index component without breaking", () => {
  const spy = jest.spyOn(redux, "useSelector");
  spy.mockReturnValue({ user: { isAuthenticated: true } });
  renderWithRouterMatch(Index, {
    path: "/",
    route: "/",
  });
  expect(screen.getByTestId("Process-index")).toBeInTheDocument();
});
it("should render the loading component without breaking when not authenticated", () => {
  renderWithRouterMatch(Index, {
    path: "/",
    route: "/",
  });
  expect(screen.getByTestId("loading-component")).toBeInTheDocument();
});

it("should render the Process list component without breaking", () => {
  const spy = jest.spyOn(redux, "useSelector");
  spy.mockImplementation((callback) =>
    callback({
      bpmForms: {
        applicationCount: 0,
        applicationCountResponse: false,
        authorizationDetails: {},
        bpmnSearchText: "",
        dmnProcessList: [],
        dmnSearchText: "",
        formAuthVerifyLoadin: false,
        formPreviousData: [],
        formProcessError: false,
        formProcessList: [],
        formStatusLoading: false,
        isApplicationCountLoading: false,
        isBpmnModel: true,
        isProcessDiagramLoading: false,
        isProcessLoading: false,
        processActivityList: null,
        processActivityLoadError: false,
        processDiagramXML: "" ,
        processList: [],
        processLoadError: false,
        processStatusList: [],
        unPublishApiError: false,
        workflowAssociated: null
    },       
    })
  );
  renderWithRouterMatch(Index, {
    path: "/processes",
    route: "/processes",
  });
});


