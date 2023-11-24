import React from "react";
import { render as rtlRender, screen, fireEvent } from "@testing-library/react";
import List from "../../../components/Form/List";
import "@testing-library/jest-dom/extend-expect";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { Router, Route } from "react-router";
import { createMemoryHistory } from "history";
import * as redux from "react-redux";
import { mockstate } from "./constants";

let store;
const mockStore = configureStore([]);

function renderWithRouterMatch(Ui, { path = "/", route = "/", history = createMemoryHistory({ initialEntries: [route] }), } = {}) {
  return {
    ...rtlRender(
      <Provider store={store}>
        <Router history={history}>
          <Route path={path} component={Ui} />
        </Router>
      </Provider>
    ),
  };
}

beforeEach(() => {
  store = mockStore(mockstate);
  store.dispatch = jest.fn();
});

it("should render the list component without breaking", () => {
  const isDesigner = true;
  const formCheckList = [];
  const spy = jest.spyOn(redux, "useSelector");
  spy.mockImplementation((callback) => callback(mockstate));
  renderWithRouterMatch(List, {
    path: "/form",
    route: "/form",
  });
  expect(screen.getByText("Test Form 007")).toBeInTheDocument();
  expect(screen.getByText("Create Form")).toBeInTheDocument();
  expect(screen.getByText("Upload Form")).toBeInTheDocument();
  const downloadFormButton = screen.queryByText("Download Form");
  if (isDesigner) {
    expect(downloadFormButton).toBeInTheDocument();
    expect(downloadFormButton).toHaveAttribute("disabled");
    if (formCheckList.length === 0) {
      expect(downloadFormButton).toHaveAttribute("disabled");
    }
  } else {
    expect(downloadFormButton).not.toBeInTheDocument();
  }
});



it("Should dispatch the file upload handler with an empty list when clicking upload button", async () => {
  const spy = jest.spyOn(redux, "useSelector");
  spy.mockImplementation((callback) => callback(mockstate));
  renderWithRouterMatch(List, {
    path: "/form",
    route: "/form",
  });
  const uploadButton = screen.getByText("Upload Form");
  fireEvent.click(uploadButton);
  expect(store.dispatch).toHaveBeenCalled();
});

it("should go to the form create page when create form button is clicked", async () => {
  const spy = jest.spyOn(redux, "useSelector");
  spy.mockImplementation((callback) => callback(mockstate));
  renderWithRouterMatch(List, {
    path: "/form",
    route: "/form",
  });
  const createForm = screen.getByText("Create Form");
  fireEvent.click(createForm);
  expect(store.dispatch).toHaveBeenCalled();
});
