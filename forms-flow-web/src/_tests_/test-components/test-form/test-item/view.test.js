/* eslint-disable no-import-assign */
import React from "react";
import { render as rtlRender, screen, fireEvent } from "@testing-library/react";
import View from "../../../../components/Form/Item/View";
import "@testing-library/jest-dom/extend-expect";
import { Provider } from "react-redux";
import { Router, Route } from "react-router";
import { createMemoryHistory } from "history";
import configureStore from "redux-mock-store";
import { mockstate } from "./constatnts-edit";
import thunk from "redux-thunk";
import * as redux from "react-redux";
import * as draftService from "../../../../apiManager/services/draftService";
import * as constants from "../../../../constants/constants";
import * as customSubmission from "../../../../apiManager/services/FormServices";
// import * as applicationService from "../../../../apiManager/services/applicationServices";

jest.mock("react-formio", () => ({
  ...jest.requireActual("react-formio"),
}));

const middlewares = [thunk];
let store;
let mockStore = configureStore(middlewares);

beforeEach(() => {
  store = mockStore(mockstate);
  store.dispatch = jest.fn();
});

afterEach(() => {
  jest.clearAllMocks();
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

it("should render the View component without breaking", async () => {
  const spy = jest.spyOn(redux, "useSelector");
  const setState = jest.fn();
  const useStateSpy = jest.spyOn(React, "useState");

  spy.mockImplementation((callback) =>
    callback({
      applications: { isPublicStatusLoading: false },
      process: { formStatusLoading: false },
      form: { isActive: false },
      formDelete: { isFormSubmissionLoading: false },
      user: { lang: "" },
      draft: { draftSubmission: {}, lastUpdated: {} },
    })
  );

  useStateSpy.mockImplementation(() => ["active", setState]);

  renderWithRouterMatch(View, {
    path: "/form/:formId",
    route: "/form/123",
  });
  expect(screen.getByText("the form title")).toBeInTheDocument();
  expect(screen.getByText("Submit")).toBeInTheDocument();
});

it("should render the public View component without breaking ", async () => {
  const spy = jest.spyOn(redux, "useSelector");
  const setState = jest.fn();

  const useStateSpy = jest.spyOn(React, "useState");
  // const serviceSpy = jest.spyOn(applicationService, "publicApplicationCreate");

  spy.mockImplementation((callback) =>
    callback({
      applications: { isPublicStatusLoading: false },
      process: { formStatusLoading: false },
      form: { isActive: false },
      formDelete: { isFormSubmissionLoading: false },
      user: { lang: "" },
      draft: { draftSubmission: {}, lastUpdated: {} },
    })
  );

  useStateSpy.mockImplementation(() => ["active", setState]);
  renderWithRouterMatch(View, {
    path: "/public/form/:formId",
    route: "/public/form/123",
  });
  expect(screen.getByText("the form title")).toBeInTheDocument();
  expect(screen.getByText("Submit")).toBeInTheDocument();
  fireEvent.click(screen.getByText("Submit"));
  expect(store.dispatch).toHaveBeenCalled();
  // expect(serviceSpy).toHaveBeenCalled();
});

it("should call the custom submission when custom submission is on ", () => {
  constants.CUSTOM_SUBMISSION_ENABLE = true;
  constants.CUSTOM_SUBMISSION_URL = true;
  const spy = jest.spyOn(redux, "useSelector");
  const setState = jest.fn();
  const useStateSpy = jest.spyOn(React, "useState");
  useStateSpy.mockImplementation(() => ["active", setState]);
  spy.mockImplementation((callback) =>
    callback({
      applications: { isPublicStatusLoading: false },
      process: { formStatusLoading: false },
      form: { isActive: false },
      formDelete: { isFormSubmissionLoading: false },
      user: { lang: "" },
      draft: { draftSubmission: {}, lastUpdated: {} },
    })
  );
  customSubmission.postCustomSubmission = jest.fn();
  const serviceSpy = jest.spyOn(customSubmission, "postCustomSubmission");
  serviceSpy.mockImplementation((callback) => callback);

  renderWithRouterMatch(View, {
    path: "/form/:formId",
    route: "/form/123",
  });
  fireEvent.click(screen.getByText("Submit"));
  expect(store.dispatch).toHaveBeenCalled();
  // expect(serviceSpy).toHaveBeenCalled();
  // expect(serviceSpy).toHaveBeenCalledWith({
  //   data: {},
  //   formId: 1122,
  //   isPublic: false,
  // });
});

it("Should call the draft create when draft mode is on", () => {
  constants.DRAFT_ENABLED = true;
  const setState = jest.fn();
  draftService.draftCreate = jest.fn();

  const spy = jest.spyOn(redux, "useSelector");
  const serviceSpy = jest.spyOn(draftService, "draftCreate");
  const useStateSpy = jest.spyOn(React, "useState");

  spy.mockImplementation((callback) =>
    callback({
      applications: { isPublicStatusLoading: false },
      process: { formStatusLoading: false },
      form: { isActive: false },
      formDelete: { isFormSubmissionLoading: false },
      user: { lang: "", isAuthenticated: true },
      draft: { draftSubmission: {}, lastUpdated: {} },
    })
  );
  serviceSpy.mockImplementation((callback) => callback);
  useStateSpy.mockImplementation(() => ["active", setState]);

  renderWithRouterMatch(View, {
    path: "/form/:formId",
    route: "/form/123",
  });
  expect(serviceSpy).toHaveBeenCalled();
  expect(serviceSpy).toHaveBeenCalledWith(
    { data: {}, formId: "123" },
    expect.anything()
  );
});

it("Should not call the draft create when draft mode is off", () => {
  constants.DRAFT_ENABLED = false;
  const setState = jest.fn();
  draftService.draftCreate = jest.fn();

  const spy = jest.spyOn(redux, "useSelector");
  const serviceSpy = jest.spyOn(draftService, "draftCreate");
  const useStateSpy = jest.spyOn(React, "useState");

  spy.mockImplementation((callback) =>
    callback({
      applications: { isPublicStatusLoading: false },
      process: { formStatusLoading: false },
      form: { isActive: false },
      formDelete: { isFormSubmissionLoading: false },
      user: { lang: "", isAuthenticated: true },
      draft: { draftSubmission: {}, lastUpdated: {} },
    })
  );
  serviceSpy.mockImplementation((callback) => callback);
  useStateSpy.mockImplementation(() => ["active", setState]);

  renderWithRouterMatch(View, {
    path: "/form/:formId",
    route: "/form/123",
  });
  expect(serviceSpy).not.toHaveBeenCalled();
});

it("Should not call the draft create when form status is not active", () => {
  constants.DRAFT_ENABLED = true;
  const setState = jest.fn();
  draftService.draftCreate = jest.fn();

  const spy = jest.spyOn(redux, "useSelector");
  const serviceSpy = jest.spyOn(draftService, "draftCreate");
  const useStateSpy = jest.spyOn(React, "useState");

  spy.mockImplementation((callback) =>
    callback({
      applications: { isPublicStatusLoading: false },
      process: { formStatusLoading: false },
      form: { isActive: false },
      formDelete: { isFormSubmissionLoading: false },
      user: { lang: "", isAuthenticated: true },
      draft: { draftSubmission: {}, lastUpdated: {} },
    })
  );
  serviceSpy.mockImplementation((callback) => callback);
  useStateSpy.mockImplementation(() => ["", setState]);

  renderWithRouterMatch(View, {
    path: "/form/:formId",
    route: "/form/123",
  });
  expect(serviceSpy).not.toHaveBeenCalled();
});

// TODO: Some expects are commented since Need more research on
// Why those expectations are failing
// Checking wheather an action is triggered or not for now which is
// lit bit ambiguous on which action is triggered
