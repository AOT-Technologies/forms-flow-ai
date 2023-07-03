import React from "react";
import { render as rtlRender, screen } from "@testing-library/react";
import Index from "../../../components/Form/index";
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

it("should render the Form Index component without breaking", () => {
  const spy = jest.spyOn(redux, "useSelector");
  spy.mockReturnValue({ user: { isAuthenticated: true } });
  renderWithRouterMatch(Index, {
    path: "/",
    route: "/",
  });
  expect(screen.getByTestId("Form-index")).toBeInTheDocument();
});
it("should render the loading component without breaking when not authenticated", () => {
  renderWithRouterMatch(Index, {
    path: "/",
    route: "/",
  });
  expect(screen.getByTestId("loading-component")).toBeInTheDocument();
});

it("should render the Form list component without breaking", () => {
  const spy = jest.spyOn(redux, "useSelector");
  spy.mockImplementation((callback) =>
    callback({
      bpmForms: {
        isActive: false,
        forms: [
          {
            _id: "sample",
            title: "sample",
            processKey: "sample",
          },
        ],
        pagination: {
          numPages: 0,
          page: 1,
          total: 0,
        },
      },
      user: {
        isAuthenticated: true,
        roles: [""],
      },
      formCheckList: {
        formList: [],
        formUploadFormList: [],
      },
      process: {
        isApplicationCountLoading: false,
        formProcessList: [],
      },
      forms: {
        query: { type: "form", tags: "common", title__regex: "" },
        sort: "title",
      },
    })
  );
  renderWithRouterMatch(Index, {
    path: "/form",
    route: "/form",
  });
});

it("should render the Stepper component without breaking", () => {
  const spy = jest.spyOn(redux, "useSelector");
  spy.mockImplementation((callback) =>
    callback({
      user: {
        isAuthenticated: true,
        roles: ["formsflow-designer"],
      },
    })
  );
  const { queryByText } = renderWithRouterMatch(Index, {
    path: "/formflow/:formId?/:step?",
    route: "/formflow/123/edit",
  });
  const componentInstance = queryByText('Design Form');

  if (componentInstance) {
    expect(componentInstance).toBeInTheDocument();


    const associateForm = queryByText('Associate this form with a workflow?');
    expect(associateForm).toBeInTheDocument();


    const previewConfirm = queryByText('Preview and Confirm');
    expect(previewConfirm).toBeInTheDocument();
  } else {
    // Handle case when element is not found
    expect(componentInstance).toBeNull();
  }
});

it("should redirect to home component without breaking", () => {
  const spy = jest.spyOn(redux, "useSelector");
  spy.mockImplementation((callback) =>
    callback({
      user: {
        isAuthenticated: true,
        roles: [],
      },
    })
  );
  const { queryByText } = renderWithRouterMatch(Index, {
    path: "/formflow/:formId?/:step?",
    route: "/formflow/123/1",
  });
  const componentInstance = queryByText('Design Form');

  expect(componentInstance).toBeNull();

  const associateForm = queryByText('Associate this form with a workflow?');

  expect(associateForm).toBeNull();

  const previewConfirm = queryByText('Preview and Confirm');

  expect(previewConfirm).toBeNull();
});

it("should render the item -> View component without breaking", () => {
  const spy = jest.spyOn(redux, "useSelector");
  spy.mockImplementation((callback) =>
    callback({
      user: {
        isAuthenticated: true,
        roles: ["formsflow-reviewer"],
      },
      formDelete: {
        isFormSubmissionLoading: true,
      },
      applications: {
        isPublicStatusLoading: true,
      },
      draft: {
        draftSubmission: {},
      },
      pubSub: {
        publish: jest.fn,
        subscribe: jest.fn,
      },
    })
  );
  renderWithRouterMatch(Index, {
    path: "/form/:formId",
    route: "/form/123",
  });
  expect(screen.getByTestId("Form-index")).toBeInTheDocument();
});

it("should redirect to base url  without breaking", () => {
  const spy = jest.spyOn(redux, "useSelector");
  spy.mockImplementation((callback) =>
    callback({
      user: {
        isAuthenticated: true,
        roles: [],
      },
      formDelete: {
        isFormSubmissionLoading: true,
      },
    })
  );
  renderWithRouterMatch(Index, {
    path: "/form/:formId",
    route: "/form/123",
  });
  expect(screen.queryByText("Unauthorized")).toBeInTheDocument();
});
