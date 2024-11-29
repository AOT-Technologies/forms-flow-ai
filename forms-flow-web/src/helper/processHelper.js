import { extractDataFromDiagram } from "../components/Modeler/helpers/helper";
import DmnModdle from "dmn-moddle";
import isEqual from "lodash/isEqual";
import { toast } from "react-toastify";
import {
  ERROR_LINTING_CLASSNAME,
  WARNING_LINTING_CLASSNAME,
} from "../components/Modeler/constants/bpmnModelerConstants";
const dmnModdle = new DmnModdle();

 

const normalizeXML = (xmlString) => {
  const parser = new DOMParser();
  const serializer = new XMLSerializer();
  // Parse the XML string to a DOM object
  const xmlDoc = parser.parseFromString(xmlString, "application/xml");
  // Serialize the DOM back to a string (minimized formatting differences)
  return serializer.serializeToString(xmlDoc);
};

export const compareXML = async (xmlString1, xmlString2) => {
  try {
    const bpmn1 = normalizeXML(xmlString1);
    const bpmn2 = normalizeXML(xmlString2);
    // Compare the JSON structures
     return bpmn1 == bpmn2;
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
    let { xml } = await modeler.saveXML({ format: true });
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


// Parse DMN XML into JSON structure
export const parseDmn = async (xmlString) => {
  try {
    const { rootElement: definitions } = await dmnModdle.fromXML(xmlString);
    return definitions;
  } catch (error) {
    console.error("Error parsing DMN XML:", error);
    throw error;
  }
};

// Validate DMN XML structure and check for naming and linting issues
export const validateDmn = async (xmlString, lintErrors, translation = (i) => i) => {
  try {
    // Parse the XML to check structural correctness
    const dmnDefinitions = await parseDmn(xmlString);
    
    // Validate lint errors (similar to BPMN validation)
    if (validateDmnLintErrors(lintErrors, translation)) {
      return false; // Validation failed due to errors
    }

    // Check for valid decision names
    if (!validateDecisionNames(dmnDefinitions)) {
      toast.error(translation("Decision name(s) must not be empty or undefined"));
      return false;
    }

    return true; // Passed validation
  } catch (error) {
    console.error("Error validating DMN:", error);
    return false;
  }
};

// Compare two DMN XML strings to check if they are structurally identical
export const compareDmnXML = async (xmlString1, xmlString2) => {
  try {
    // Parse both DMN XMLs to JSON structures
    const dmn1 = await parseDmn(xmlString1);
    const dmn2 = await parseDmn(xmlString2);
    
    // Compare the JSON structures
    return isEqual(dmn1, dmn2);
  } catch (error) {
    console.error("Error comparing DMN XML:", error);
    return false;
  }
};

// Validate linting errors for DMN
export const validateDmnLintErrors = (lintErrors, translation = (i) => i) => {
  let hasErrors = false;
  for (const key in lintErrors) {
    const err = lintErrors[key];
    err.forEach((x) => {
      if (x.category === "error") {
        hasErrors = true;
        toast.error(translation(x.message));
      } else if (x.category === "warn") {
        toast.warn(translation(x.message));
      }
    });
  }
  return hasErrors;
};

// Validate that decision names are defined and not "undefined"
export const validateDecisionNames = (xml, t) => {
  const extractedData = extractDataFromDiagram(xml, true);
  if (!extractedData.name || extractedData.name.includes("undefined")) {
    toast.error(t("Process name(s) must not be empty or undefined"));
    return false;
  }
  return true;
};
