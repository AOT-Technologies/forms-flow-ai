const createXML = async (modeler) => {
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

export { createXML };
