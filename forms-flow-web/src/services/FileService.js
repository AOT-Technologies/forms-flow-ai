 /* istanbul ignore file */
const downloadFile = async (data={},callback) => {
  const myData = data;
  let fileName ;
   if(myData.forms.length === 1)
   {  
      fileName = `${myData.forms[0].title}-${new Date().toJSON()}`;
   }
   else{
     fileName = `forms(${myData.forms.length})-${new Date().toJSON()}`;
   }
  const json = JSON.stringify(myData);
  const blob = new Blob([json],{type:'application/json'});
  const href = await URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = href;
  link.download = fileName + ".json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  callback();
}


const uploadFile = (evt,callback) => {
  const fileObj = evt.target.files[0];
  const reader = new FileReader();
  reader.readAsText(fileObj);
  reader.onload = (e)=>{
    const fileContents = JSON.parse(e.target.result);
    callback(fileContents);
  };
}

const FileService ={
 uploadFile,
 downloadFile
};

export default FileService;
