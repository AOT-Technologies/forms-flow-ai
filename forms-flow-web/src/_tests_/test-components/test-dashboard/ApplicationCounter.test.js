import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import ApplicationCounter from "../../../components/Dashboard/ApplicationCounter";
import {
  app,
  getStatusDetails,
  appcount,
} from "./Constants";
import { Provider } from "react-redux";

import StoreService from "../../../services/StoreService";


let store;

beforeEach(() => {
    store = StoreService.configureStore();
});

 
test("Should render error message if no applications in the selected range", () => {
  render(<ApplicationCounter noOfApplicationsAvailable={appcount} />);
  expect(
    screen.getByText("No submissions available for the selected date range")
  ).toBeInTheDocument();
});

test("Render ApplicationCounter with props passed", () => {

 
  render(
    <Provider store={store}>
    <ApplicationCounter
      application={app}
      getStatusDetails={getStatusDetails}
    />
    </Provider>

  );
  expect(screen.queryAllByText("Form Name")[0]).toBeInTheDocument();
  expect(screen.queryAllByText("Total Submissions")[0]).toBeInTheDocument();
});
