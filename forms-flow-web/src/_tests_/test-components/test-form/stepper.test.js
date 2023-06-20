import React from "react";
import { render as rtlRender, screen, fireEvent } from "@testing-library/react";
import Stepper from "../../../components/Form/Stepper";
import "@testing-library/jest-dom/extend-expect";
import { Provider } from "react-redux";
import { Router, Route } from "react-router";
import { createMemoryHistory } from "history";
import configureStore from "redux-mock-store";
import { mockstate } from "./constants";

let store;
let mockStore = configureStore([]);
beforeEach(() => {
  store = mockStore({
    mockstate,
  });
  store.dispatch = jest.fn();
});

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

describe('Stepper', () => {

  it('does not render any steps when formProcessListCount is not 1', () => {
      const { queryByText } = renderWithRouterMatch(Stepper, {
        path: "/formflow/:formId?/:step?",
        route: "/formflow/create",
      });
      const componentInstance = queryByText('Design Form');
  
      expect(componentInstance).toBeNull();
      
      const associateForm = queryByText('Associate this form with a workflow?');
      
      expect(associateForm).toBeNull();
      
      const previewConfirm = queryByText('Preview and Confirm');
      
      expect(previewConfirm).toBeNull();
    });

});
