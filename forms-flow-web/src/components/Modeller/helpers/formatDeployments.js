/* istanbul ignore file */
import XmlParser from "bpmn-xml-parser";

export const listDeployments = (deployments) => {
    if (deployments?.length > 0) {
      const deploymentsSorted = sortByDeploymentTime(deployments);
  
      const unique = uniqByKeepFirst(deploymentsSorted);
  
      const data = unique.map((process) => {
        const xmlData = extractDataFromDiagram(process.diagram);
        return {
          label: xmlData.name,
          value: xmlData.processId,
          tenant: process.tenantId,
          xml: process.diagram,
        };
      });
  
      return data;
    } else {
      return [];
    }
  };
  
  const sortByDeploymentTime = (deployments) => {
    return deployments.sort(function (a, b) {
      return b.deploymentTime.localeCompare(a.deploymentTime);
    });
  };
  
  const uniqByKeepFirst = (deployments) => {
    let seen = new Set();
    return deployments.filter((item) => {
      let key = extractDataFromDiagram(item.diagram).processId;
      return seen.has(key) ? false : seen.add(key);
    });
  };
  
  export const extractDataFromDiagram = (xml) => {
    let processId = "";
    let name = "";
  
    const parser = new XmlParser(xml);
  
    const elements = parser.convertedJson.elements[0].elements;
    const process = elements.filter((element) => {
      return element.name.includes(":process");
    });
  
    processId = process[0].attributes?.id;
    name = process[0].attributes?.name;
  
    return {
      processId: processId,
      name: name,
    };
  };