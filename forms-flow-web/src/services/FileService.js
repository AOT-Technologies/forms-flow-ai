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
    const fileObj = fileContent; // The file object passed directly
    if (fileObj) {
      const reader = new FileReader(); // Initialize FileReader to read the file
      reader.readAsText(fileObj); // Read the file as text

      reader.onload = (e) => {
        try {
          const fileExtension = fileObj.name.split('.').pop().toLowerCase();
          
          if (fileExtension === 'json') {
            // Handle JSON file parsing
            const fileContents = JSON.parse(e.target.result);

            // Extract forms (if present in the JSON)
            const forms = Array.isArray(fileContents.forms) ? fileContents.forms : [];
            
            // Extract workflows and their content (XML)
            const workflows = Array.isArray(fileContents.workflows) ? fileContents.workflows : [];
            const xml = workflows.length > 0 ? workflows.map(workflow => workflow.content).join('') : null;

            if (forms.length === 0 && !xml) {
              reject("No valid form or XML found.");
            } else {
              // Resolve with both forms and xml
              resolve({ forms, xml });
            }
          } else if (['bpmn', 'dmn'].includes(fileExtension)) {
            // Handle XML file parsing (not relevant in this case but kept for completeness)
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(e.target.result, "application/xml");

            if (xmlDoc?.getElementsByTagName("parsererror").length > 0) {
              reject("Invalid XML file."); // Reject if XML parsing fails
            } else {
              // Return the entire XML document as a string
              const xmlString = new XMLSerializer().serializeToString(xmlDoc);
              resolve({ xml: xmlString, forms: [] }); // Resolve with the XML string
            }
          } else {
            reject("Unsupported file type."); // Reject if the file type is unsupported
          }
        } catch (error) {
          reject("Error processing file."); // Reject if there's a general error during processing
        }
      };

      reader.onerror = () => {
        console.error("Error reading the file.");
        reject("Error reading the file."); // Reject in case of a file reading error
      };
    } else {
      console.error("No file selected.");
      reject("No file selected."); // Reject if no file is provided
    }
  });
};


const FileService = {
  uploadFile,
  downloadFile,
  extractFileDetails,
};

export default FileService;
