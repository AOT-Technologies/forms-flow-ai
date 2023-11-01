import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render as rtlRender, fireEvent, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import StoreService from "../../../services/StoreService";
import { Router, Route } from "react-router-dom";
import ViewApplication from "../../../components/Application/ViewApplication";
import { createMemoryHistory } from "history";
import * as redux from "react-redux";

jest.mock("@formsflow/service", () => ({
  __esModule: true,
  default: jest.fn(() => ({})),
  RequestService: {
    httpGETRequest: () => Promise.resolve(jest.fn(() => ({ data: {} }))),
    httpPUTRequest: () => Promise.resolve(jest.fn(() => "")),
  },
  StorageService: {
    get: () => jest.fn(() => {}),
    User: {
      AUTH_TOKEN: "",
    },
  },
}));

const store = StoreService.configureStore();

describe("Integration test for the ViewApplication component", () => {
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

  test("it should render the Submission details", async () => {
    const spy = jest.spyOn(redux, "useSelector");
    spy.mockImplementation((callback) =>
      callback({
        applications: {
          applicationDetail: {
            applicationName: "Sample Form Name",
            applicationStatus: "Sample Submission status",
            created: "2021-12-03 04:49:18.813383",
            createdBy: "firstName",
            formId: "0123456",
            formProcessMapperId: "11",
            id: 100,
            modified: "2021-12-03 04:49:19.864880",
            modifiedBy: "sample modified by",
            processInstanceId: "123456789",
            revisionNo: "1",
            submissionId: "123456789",
          },
          applicationProcess: {
            processKey: "",
          },
        },
        formDelete: {
          isFormSubmissionLoading: false,
        },
      })
    );
    renderWithRouterMatch(ViewApplication, {
      path: "/application/:applicationId",
      route: "/application/100",
    });
    expect(await screen.findByText(/firstName/i)).toBeInTheDocument();
    expect(
      await screen.findByText(/Sample Submission status/i)
    ).toBeInTheDocument();
    expect(await screen.findByText(/100/i)).toBeInTheDocument();
    const formLink = screen.getByText("Form");
    fireEvent.click(formLink);
    expect(await screen.findByText(/Submissions/i)).toBeInTheDocument();
    expect(await screen.findByText(/History/i)).toBeInTheDocument();
    expect(await screen.findByText(/Process Diagram/i)).toBeInTheDocument();
  });
  test("it should not render the application details", async () => {
    const spy = jest.spyOn(redux, "useSelector");
    spy.mockImplementation((callback) =>
      callback({
        applications: {
          applicationDetail: {},
          applicationProcess: {
            processKey: "",
          },
        },
      })
    );
    renderWithRouterMatch(ViewApplication, {
      path: "/application/:applicationId",
      route: "/application/101",
    });
    expect(await screen.queryByText(/101/i)).not.toBeInTheDocument();
  });
});
