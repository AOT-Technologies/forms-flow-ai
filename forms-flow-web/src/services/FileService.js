/* istanbul ignore file */
const downloadFile = async (data = {}, callback) => {
  const myData = data;
  let fileName;
  if (myData.forms.length === 1) {
    fileName = `${myData.forms[0].title}-${new Date().toJSON()}`;
  } else {
    fileName = `forms(${myData.forms.length})-${new Date().toJSON()}`;
  }
  const json = JSON.stringify(myData);
  const blob = new Blob([json], { type: "application/json" });
  const href = await URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = fileName + ".json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  callback();
};

const uploadFile = (evt, callback) => {
  const fileObj = evt.target.files[0];
  if(fileObj){
    const reader = new FileReader();
  reader.readAsText(fileObj);
  reader.onload = (e) => {
    const fileContents = JSON.parse(e.target.result);
    callback(fileContents);
  };
  }else{
    callback(null);
  }  
};

const extractFileDetails = (fileContent) => {
  return new Promise((resolve, reject) => {
    if (!fileContent) {
      console.error("No file selected.");
      return reject("No file selected.");
    }

    const reader = new FileReader();
    reader.readAsText(fileContent);

    reader.onload = (e) => {
      try {
        const fileExtension = getFileExtension(fileContent.name);

        if (fileExtension === 'json') {
          handleJSONFile(e.target.result, resolve, reject);
        } else if (['bpmn', 'dmn'].includes(fileExtension)) {
          handleXMLFile(e.target.result, resolve, reject);
        } else {
          reject("Unsupported file type.");
        }
      } catch (error) {
        reject("Error processing file.");
      }
    };

    reader.onerror = () => {
      console.error("Error reading the file.");
      reject("Error reading the file.");
    };
  });
};

// Helper to get the file extension
const getFileExtension = (fileName) => fileName.split('.').pop().toLowerCase();

// Helper to handle JSON files
const handleJSONFile = (fileContent, resolve, reject) => {
  try {
    const fileContents = JSON.parse(fileContent);
    const forms = Array.isArray(fileContents.forms) ? fileContents.forms : [];
    const workflows = Array.isArray(fileContents.workflows) ? fileContents.workflows : [];
    const xml = workflows.length > 0 ? workflows.map(wf => wf.content).join('') : null;

    if (forms.length === 0 && !xml) {
      return reject("No valid form or XML found.");
    }

    resolve({ forms, xml });
  } catch {
    reject("Invalid JSON file.");
  }
};

// Helper to handle XML files
const handleXMLFile = (fileContent, resolve, reject) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(fileContent, "application/xml");

  if (xmlDoc?.getElementsByTagName("parsererror")?.length > 0) {
    return reject("Invalid XML file.");
  }

  const xmlString = new XMLSerializer().serializeToString(xmlDoc);
  resolve({ xml: xmlString, forms: [] });
};



const FileService = {
  uploadFile,
  downloadFile,
  extractFileDetails,
};

export default FileService;
