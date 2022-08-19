/* istanbul ignore file */
import XmlParser from "bpmn-xml-parser";

export const extractDataFromDiagram = (xml) => {
  let processId = "";
  let name = "";

  const parser = new XmlParser(xml);
  const elements = parser.convertedJson.elements[0].elements;
  const processes = elements.filter((element) => {
    return element.name.includes(":process");
  });

  processes.forEach((process) => {
    name += process.attributes?.name + " / ";
  });
  name = name.substring(0, name.length - 3);

  processId = processes[0].attributes?.id;

  return {
    processId: processId,
    name: name,
  };
};

