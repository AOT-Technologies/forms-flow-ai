import { is } from "bpmn-js/lib/util/ModelUtil";

export const getRootElement = (bpmnModeller) => {
  const elementRegistry = bpmnModeller.get("elementRegistry");

  // check if workflow is of type 'bpmn:Process'
  let rootElement = elementRegistry.filter(function (element) {
    return is(element, "bpmn:Process");
  });

  // check if workflow is of type 'bpmn:Collaboration'
  if (rootElement.length == 0) {
    rootElement = elementRegistry.filter(function (element) {
      return is(element, "bpmn:Collaboration");
    });
  }

  return rootElement[0];
};
