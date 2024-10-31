import { extractDataFromDiagram } from "../components/Modeler/helpers/helper";
import BpmnModdle from "bpmn-moddle";
import isEqual from "lodash/isEqual";
import { toast } from "react-toastify";
import {
  ERROR_LINTING_CLASSNAME,
  WARNING_LINTING_CLASSNAME,
} from "../components/Modeler/constants/bpmnModelerConstants";
const bpmnModdle = new BpmnModdle();

export const parseBpmn = async (xmlString) => {
  const { rootElement: definitionsA } = await bpmnModdle.fromXML(xmlString);
  return definitionsA;
};

export const compareXML = async (xmlString1, xmlString2) => {
  try {
    // Parse both BPMN XMLs to their JSON structure
    const bpmn1 = await parseBpmn(xmlString1);
    const bpmn2 = await parseBpmn(xmlString2);
    // Compare the JSON structures
    return isEqual(bpmn1, bpmn2);
  } catch (error) {
    console.error("Error while comparing BPMN:", error);
  }
};

//validate any erros in bpmn lint
export const validateBpmnLintErrors = (lintErrors, translation = (i) => i) => {
  // only return false if there are errors, warnings are ok
  let hasErrors = false;
  for (const key in lintErrors) {
    const err = lintErrors[key];
    err.forEach((x) => {
      // Only toast errors, not warnings
      if (x.category === "error" || x.category === "warn") {
        hasErrors = true;
        toast[x.category](translation(x.message));
      }
    });
  }
  return hasErrors;
};

// validate the xml data and any erros in bpmn lint
export const validateProcess = (xml, lintErrors, translation = (i) => i) => {
  const errorElement = document.getElementsByClassName(ERROR_LINTING_CLASSNAME);
  const warningElement = document.getElementsByClassName(
    WARNING_LINTING_CLASSNAME
  );
  if (errorElement.length || warningElement.length) {
    return !validateBpmnLintErrors(lintErrors); // if hasErrors true then validate process is false
  }
  if (!validateProcessNames(xml)) {
    toast.error(translation("Process name(s) must not be empty"));
    return false;
  }
  return true;
};

export const createXMLFromModeler = async (modeler) => {
  try {
    // Convert diagram to xml
    let { xml } = await modeler.saveXML();
    // Set isExecutable to true
    xml = xml.replaceAll('isExecutable="false"', 'isExecutable="true"');
    return xml;
  } catch (err) {
    console.error(err);
  }
};

export const validateProcessNames = (xml) => {
  let isValidated = true;
  // Check for undefined process names
  if (
    !extractDataFromDiagram(xml).name ||
    extractDataFromDiagram(xml).name.includes("undefined")
  ) {
    isValidated = false;
  }

  return isValidated;
};


export const validateDecisionName = (xml, t) => {
  const extractedData = extractDataFromDiagram(xml, true);
  if (!extractedData.name || extractedData.name.includes("undefined")) {
    toast.error(t("Process name(s) must not be empty or undefined"));
    return false;
  }
  return true;
};