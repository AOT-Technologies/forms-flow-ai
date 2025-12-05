/* istanbul ignore file */
import XmlParser from "bpmn-xml-parser";
import { is } from "bpmn-js/lib/util/ModelUtil";

const getRootElement = (bpmnModeler) => {
  const elementRegistry = bpmnModeler.get("elementRegistry");

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

const getNewID = () => {
  return (Math.random() + 1).toString(36).substring(2, 9);
};

const createNewProcess = () => {
  const deploymentName = "";
  const processID = "Process_" + getNewID();
  const definitionID = "Definitions_" + getNewID();
  const isExecutable = true;

  const blankProcessXML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
  xmlns:camunda="http://camunda.org/schema/1.0/bpmn"
  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
  xmlns:modeler="http://camunda.org/schema/modeler/1.0"
  id="${definitionID}"
  targetNamespace="http://bpmn.io/schema/bpmn"
  exporter="Camunda Modeler"
  exporterVersion="5.0.0"
  modeler:executionPlatform="Camunda Platform"
  modeler:executionPlatformVersion="7.17.0">

  <bpmn:process id="${processID}" isExecutable="${isExecutable}">
    <bpmn:startEvent id="StartEvent_1" name="start" camunda:asyncAfter="true">
      <bpmn:outgoing>Flow_Start_To_Task</bpmn:outgoing>
    </bpmn:startEvent>

    <bpmn:task id="Task_1" name="Task">
      <bpmn:incoming>Flow_Start_To_Task</bpmn:incoming>
      <bpmn:outgoing>Flow_Task_To_End</bpmn:outgoing>
    </bpmn:task>

    <bpmn:sequenceFlow id="Flow_Start_To_Task" sourceRef="StartEvent_1" targetRef="Task_1" />

    <bpmn:endEvent id="EndEvent_1" name="end">
      <bpmn:incoming>Flow_Task_To_End</bpmn:incoming>
    </bpmn:endEvent>

    <bpmn:sequenceFlow id="Flow_Task_To_End" sourceRef="Task_1" targetRef="EndEvent_1" />
  </bpmn:process>

  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="${processID}">
      <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">
        <dc:Bounds x="179" y="159" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="186" y="202" width="23" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Task_1_di" bpmnElement="Task_1">
        <dc:Bounds x="270" y="137" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="EndEvent_1_di" bpmnElement="EndEvent_1">
        <dc:Bounds x="432" y="159" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="441" y="202" width="19" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>

      <bpmndi:BPMNEdge id="Flow_Start_To_Task_di" bpmnElement="Flow_Start_To_Task">
        <di:waypoint x="215" y="177" />
        <di:waypoint x="270" y="177" />
      </bpmndi:BPMNEdge>

      <bpmndi:BPMNEdge id="Flow_Task_To_End_di" bpmnElement="Flow_Task_To_End">
        <di:waypoint x="370" y="177" />
        <di:waypoint x="432" y="177" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

  const defaultWorkflow = {
    label: deploymentName,
    value: processID,
    xml: blankProcessXML,
  };

  return {
    defaultDeploymentName: deploymentName,
    defaultProcessID: processID,
    defaultDefinitionID: definitionID,
    defaultWorkflow: defaultWorkflow,
    defaultBlankProcessXML: blankProcessXML,
  };
};

const createNewDecision = () => {
  const deploymentName = "";
  const drdID = "Definitions_" + getNewID();
  const decisionID = "Decision_" + getNewID();
  const decisionTableID = "DecisionTable_" + getNewID();

  const blankProcessXML = `<?xml version="1.0" encoding="UTF-8"?>
  <definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/" xmlns:dmndi="https://www.omg.org/spec/DMN/20191111/DMNDI/" xmlns:dc="http://www.omg.org/spec/DMN/20180521/DC/" id="${drdID}" name="DRD" namespace="http://camunda.org/schema/1.0/dmn" xmlns:modeler="http://camunda.org/schema/modeler/1.0" exporter="Camunda Modeler" exporterVersion="5.0.0" modeler:executionPlatform="Camunda Platform" modeler:executionPlatformVersion="7.17.0">
    <decision id="${decisionID}" name="Decision 1">
      <decisionTable id="${decisionTableID}">
        <input id="Input_1">
          <inputExpression id="InputExpression_1" typeRef="string">
            <text></text>
          </inputExpression>
        </input>
        <output id="Output_1" typeRef="string" />
      </decisionTable>
    </decision>
    <dmndi:DMNDI>
      <dmndi:DMNDiagram>
        <dmndi:DMNShape dmnElementRef="${decisionID}">
          <dc:Bounds height="80" width="180" x="160" y="100" />
        </dmndi:DMNShape>
      </dmndi:DMNDiagram>
    </dmndi:DMNDI>
  </definitions>`;

  const defaultWorkflow = {
    label: deploymentName,
    value: decisionID,
    xml: blankProcessXML,
  };

  return {
    defaultDeploymentName: deploymentName,
    defaultProcessID: decisionID,
    defaultDefinitionID: decisionTableID,
    defaultWorkflow: defaultWorkflow,
    defaultBlankProcessXML: blankProcessXML,
  };
};

const extractDataFromDiagram = (xml, isDmn = false) => {
  let processId = "";
  let name = "";
  const elementToInclude = isDmn ? "decision" : ":process";

  try {
    const parser = new XmlParser(xml);
    const elements = parser.convertedJson.elements[0].elements;
    const processes = elements.filter((element) => {
      return element.name.includes(elementToInclude);
    });

    processes.forEach((process) => {
      name += process.attributes?.name + " / ";
    });
    name = name.substring(0, name.length - 3);

    processId = processes[0].attributes?.id;
  } catch (error) {
    console.log("XML Parser Error: ", error);
  }

  return {
    processId: processId,
    name: name,
  };
};

export {
  getRootElement,
  createNewProcess,
  createNewDecision,
  extractDataFromDiagram,
};
