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

const extractFileDetails = (fileContent, callback) => { 
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

          // Check if 'forms' exist and is an array in fileContents
          if (fileContents && fileContents.forms && Array.isArray(fileContents.forms)) {
            const formToUpload = fileContents.forms[0]; // Extract the first form
            callback(formToUpload); // Pass the extracted form details to the callback function
          } else {
            console.error("No 'forms' array found in the file.");
            callback(null); // Pass null if the 'forms' array is missing
          }
        } else if (['bpmn', 'dmn'].includes(fileExtension)) {
          // Handle XML file parsing
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(e.target.result, "application/xml");

          if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
            callback(null); // Pass null in case of XML parsing error
          } else {
            // Return the entire XML document as a string
            const xmlString = new XMLSerializer().serializeToString(xmlDoc);
            callback(xmlString); // Pass the XML string to the callback function
          }
        } else {
         callback(null);
        }
      } catch (error) {
        callback(null); // Pass null in case of processing error
      }
    };

    reader.onerror = () => {
      console.error("Error reading the file.");
      callback(null); // Pass null in case of a file reading error
    };
  } else {
    console.error("No file selected.");
    callback(null); // Pass null if no file is provided
  }
};



const FileService = {
  uploadFile,
  downloadFile,
  extractFileDetails,
};

export default FileService;
