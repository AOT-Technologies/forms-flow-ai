export const DEFAULT_DEPLOYMENT_NAME = "New Process";
export const DEFAULT_PROCESS_ID = "new-process";

export const DEFAULT_WORKFLOW = {
  label: DEFAULT_DEPLOYMENT_NAME,
  value: DEFAULT_PROCESS_ID
};

export const SUCCESS_MSG = "Diagram Deployed";
export const ERROR_MSG = "Deployment Failed";

/* eslint-disable max-len */
export const BLANK_PROCESS_XML = 
  `<?xml version="1.0" encoding="UTF-8"?>
    <bpmn2:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" id="sample-diagram" targetNamespace="http://bpmn.io/schema/bpmn" xsi:schemaLocation="http://www.omg.org/spec/BPMN/20100524/MODEL BPMN20.xsd">
    <bpmn2:process id="${DEFAULT_PROCESS_ID}" name="${DEFAULT_DEPLOYMENT_NAME}" isExecutable="false" />
    <bpmndi:BPMNDiagram id="BPMNDiagram_1">
        <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="${DEFAULT_PROCESS_ID}" />
    </bpmndi:BPMNDiagram>
    </bpmn2:definitions>`;
  
