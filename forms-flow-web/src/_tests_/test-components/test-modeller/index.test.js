import Index from "../../../components/Modeller/index";
import React from "react";
import { render as rtlRender, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { Provider } from "react-redux";
import { Router, Route } from "react-router";
import { createMemoryHistory } from "history";
import * as redux from "react-redux";
import StoreService from "../../../services/StoreService";
import { initialstate } from "./constants";

jest.mock("bpmn-js/lib/Modeler", () => ({
  BpmnModeler: {
    get: jest.fn().mockReturnValue({
      zoom: jest.fn,
      stepZoom: jest.fn,
      add: jest.fn,
    }),
    destroy: jest.fn,
    on: jest.fn,
    importXML: jest.fn,
  },
}));
jest.mock("bpmn-js-properties-panel", () => ({
  BpmnPropertiesPanelModule: jest.fn,
  BpmnPropertiesProviderModule: jest.fn,
  CamundaPlatformPropertiesProviderModule: jest.fn,
}));
jest.mock("camunda-bpmn-moddle/lib", () => ({
  CamundaExtensionModule: jest.fn,
}));
jest.mock("camunda-bpmn-moddle/resources/camunda", () => ({
  camundaModdleDescriptors: jest.fn,
}));
jest.mock("bpmn-js/lib/util/ModelUtil", () => ({
  is: jest.fn,
}));
jest.mock("bpmn-js-bpmnlint", () => ({
  lintModule: jest.fn(() => <div>Test</div>),
}));
jest.mock("bpmn-xml-parser", () => ({
  XmlParser: jest.fn,
}));
jest.mock("dmn-js/lib/Modeler", () => ({
  DmnJS: jest.fn,
}));
jest.mock("dmn-js-properties-panel", () => ({
  DmnPropertiesPanelModule: jest.fn,
  DmnPropertiesProviderModule: jest.fn,
  CamundaPropertiesProviderModule: jest.fn,
}));
jest.mock("camunda-dmn-moddle/resources/camunda", () => ({
  camundaModdleDescriptor: jest.fn,
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

test("Should render the modeller index component without breaking", async () => {
  const spy = jest.spyOn(redux, "useSelector");
  spy.mockImplementation((callback) => callback(initialstate));
  renderWithRouterMatch(Index, {
    path: "/processes",
    route: "/processes",
  });
  expect(screen.getByText("Processes")).toBeInTheDocument();
  expect(
    screen.getByText("Please select an existing workflow.")
  ).toBeInTheDocument();
  expect(screen.getByText("Create New")).toBeInTheDocument();
});
