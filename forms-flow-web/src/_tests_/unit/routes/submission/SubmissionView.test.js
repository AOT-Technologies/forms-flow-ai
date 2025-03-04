import React from "react";
import { render as rtlRender, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { QueryClient, QueryClientProvider } from "react-query";
import { createMemoryHistory } from "history";
import { Router } from "react-router-dom";
import rootReducer from "../../rootReducer";
import { mockstate } from "../../mockState";
import ViewApplication from "../../../../../src/routes/Submit/Submission/SubmissionView";
import thunk from 'redux-thunk';

jest.mock("@formsflow/components", () => {
  const actual = jest.requireActual("../../../../../__mocks__/@formsflow/components");
  return {
    ...actual,
    BackToPrevIcon: () => <button data-testid="back-button">Back</button>,
    HistoryIcon: () => <span>History Icon</span>,
    CloseIcon: actual.CloseIcon,
    CustomButton: ({ onClick }) => (
      <button data-testid="handle-submission-history-testid" onClick={onClick}>
        History
      </button>
    ),
    FormSubmissionHistoryModal: () => <div>Form Submission History Modal</div>,
  };
});


const queryClient = new QueryClient();
let store;

function renderWithProviders(ui, { route = "/application/:applicationid" } = {}) {
  const history = createMemoryHistory({ initialEntries: [route] });
  return {
    ...rtlRender(
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <Router history={history}>{ui}</Router>
        </Provider>
      </QueryClientProvider>
    ),
    history,
  };
}
beforeEach(() => {
  store = configureStore({
    reducer: rootReducer,
    preloadedState: {
      ...mockstate,
      applications: {
        applicationsList: [],
        applicationDetail:[{
          created: "2025-02-11T05:15:55.785503Z",
          modified: "2025-02-11T05:22:34.207536Z",
          id: 804,
          applicationName: "BusinessNew",
          applicationStatus: "Reviewed",
          formProcessMapperId: "531",
          processInstanceId: "52e9e47b-e837-11ef-9ea0-620c3eb0f440",
          processKey: "BusinessNew",
          processName: "BusinessNew",
          processTenant: null,
          createdBy: "john.honai",
          modifiedBy: "service-account-forms-flow-bpm",
          formId: "6721debe9c3135103599ba2b",
          submissionId: "67aade995c702e11810155b2",
          isResubmit: false,
          eventName: null,
        }],
        applicationProcess: {
          processName: "BusinessNew",
          formProcessMapperId: "531",
          processKey: "BusinessNew",
        },
        formApplicationsList: [],
        isApplicationListLoading: false, // Ensure loading is false so UI renders
        isApplicationDetailLoading: false,
        isApplicationUpdating: false,
        applicationCount: 0,
        applicationDetailStatusCode: 200, // Ensure NotFound is not triggered
        activePage: 1,
        countPerPage: 5,
        applicationStatus: [],
        iserror: false,
        error: "",
        isPublicStatusLoading: false,
        sortOrder: "desc",
        sortBy: "id",
        searchParams: {},
        isApplicationLoading: false,
      },
      submission: { submission: { _id: "67aade995c702e11810155b2" } },
      form: { form: { _id: "6721debe9c3135103599ba2b", title: "Business Form" } },
      taskAppHistory: { appHistory: [], isHistoryListLoading: false },
      tenants: { tenantId: "tenant123" },
      user: {
        roles: ["formsflow-reviewer"],
        authenticated: true,
        viewSubmissions: true,
        createSubmissions: true,
      },
    },
  });
});

describe("ViewApplication Component", () => {
  
  it("renders the submission view correctly", async () => {
  renderWithProviders(<ViewApplication />, { 
    route: "/application/test-id"
  });
  
  await waitFor(() => {
    expect(screen.getByText("BusinessNew")).toBeInTheDocument();
  });
});

});
