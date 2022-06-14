import React, { Component } from 'react';
import { httpGETRequest, httpPOSTRequest } from "../../apiManager/httpRequestHandler";
import UserService from "../../services/UserService";
import API from "../../apiManager/endpoints/index";

//, FileUPload 
export default class UploadFile extends Component {

    constructor(props) {
        super(props);
        this.state = {
            value: props.value,
            selectedFile: '',
            base64Image: '',
            UploadResponseData: '',
            DownloadResponseData: '',
            imgUrl: ''
        };
    }
    onFileChange = async (event) => {
        let file = event.target.files[0];
        console.log(file);
        this.setState({ selectedFile: file });

        const base64 = await this.convertBase64(file);
        console.log("base64  : ", base64);
        this.setState({ base64Image: base64 });
        this.fileData();
    };
    convertBase64 = (file) => {
        return new Promise(resolve => {
            let baseURL = "";
            // Make new FileReader
            let reader = new FileReader();

            // Convert the file to base64 text
            reader.readAsDataURL(file);

            // on reader load somthing...
            reader.onload = () => {
                // Make a fileInfo Object
                baseURL = reader.result;
                resolve(baseURL);
            };

        });

    }


    onFileUpload = async () => {
        if (this.state.selectedFile) {
            var timestamp = new Date().getTime();
            var fileName = timestamp + "-" + this.state.selectedFile.name;
            var formData = new FormData();
            formData.append("name",fileName);
            formData.append("upload", this.state.selectedFile);
            // this.FileUPload(formData);
            console.log("form Data befor send",...formData);
            let TheName = 'libreryRoomOne.jpg';
            this.fetchCMISfile(TheName);
        }


        //let TheName = 'formsflow logo.png';
        // this.DownloadFile(TheName);

    };
    FileUPload = (data, ...rest) => {
        const done = rest.length ? rest[0] : () => { };
        const URL = API.CMIS_UPLOAD_FILE;
        httpPOSTRequest(URL, data, UserService.getToken())
          .then((res) => {
            if (res.data) {
              done(null, res.data);
              this.setState({UploadResponseData: res.data, selectedFile: '' });
              this.fileData();  
              console.log("UploadResponse :",this.state.UploadResponseData);
              console.log("selectedFile clear :",this.state.selectedFile);
                   
            } else {
              // dispatch(serviceActionError(res));
              done("Error Posting data");
            }
          })
          .catch((error) => {
            //   dispatch(serviceActionError(error));
            
            done(error);
          });
          
      
      };
      download = async() => {
        const originalImage = "https://cdn1.iconfinder.com/data/icons/ninja-things-1/1772/ninja-simple-512.png";
        const image = await fetch(originalImage);
       
        //Split image name
        const nameSplit = originalImage.split("/");
        const  duplicateName = nameSplit.pop();
       
        const imageBlog = await image.blob();
        const imageURL = URL.createObjectURL(imageBlog);
        const link = document.createElement('a');
        link.href = imageURL;
        link.download = "" + duplicateName + "";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);  
       };
    fetchCMISfile = (name, ...rest) => {
        const done = rest.length ? rest[0] : () => { };
        const downloadURL = API.CMIS_DOWNLOAD_FILE + name;
        console.log("apiURL   :", API.CMIS_DOWNLOAD_FILE);
        console.log("download URL  :", downloadURL);
        httpGETRequest(downloadURL, {}, UserService.getToken())
            .then((res) =>{
                // const imageBlob = res.blob();
                console.log("imageBlob", res.data);
            //    return imageBlob;
            })
               
            .then((res) => {
                
                const imageObjectURL = URL.createObjectURL(res);
                this.setState({ imgUrl: imageObjectURL });
                console.log("imgUrl: ", this.state.imgUrl);

                
                // console.log("resData: ",res.data);
                // var reader = new FileReader();
                // reader.readAsDataURL(res.data);
                // reader.onload = function() {                         
                //     var b64 = reader.result;
                //     console.log("This is base64", b64);
                //     this.setState({ base64Image: b64 });
                //     this.fileData();
                // };
                




            // if (res.data) {
            //   done(null, res.data);
            //   this.setState({DownloadResponseData: res.data[0].data });
            //   //console.log("Download Response: ", this.state.DownloadResponseData);
            // const base64 = done( this.convertBase64(res.data[0].data));
            //         console.log("base64  : ", base64);
            // }
          })
          .catch((error) => {
            done(error);
          });
      
      };
    convertToBase64 = (data) => {
       // console.log(data);
        var reader = new FileReader();
        reader.onload = function() {                         
            var b64 = reader.result;
            console.log("This is base64", b64);
           
        };
        reader.readAsDataURL(data);


    }
    // DownloadFile = async (TheName) => {
    //     let updateRes = await fetchCMISfile(TheName);
    //     console.log("updateResponse :", updateRes);
    // };

    canelUpload = () => {
        this.setState({ selectedFile: '', });
        location.reload();
    }

    fileData = () => {
        if (this.state.selectedFile) {
            return (
                <div className='file-details'>
                    <div className="row">
                        <div className="column" style={{ padding: "15px" }}>
                            <h4><b>File Details:</b></h4>
                            <p>File Name: {this.state.selectedFile.name}</p>
                            <p>File Type: {this.state.selectedFile.type}</p>
                            <p>
                                Last Modified:{" "}
                                {this.state.selectedFile.lastModifiedDate.toDateString()}
                            </p>
                        </div>
                        <div className="column">
                            <div style={{ marginTop: "76%" }}>
                                <button
                                    className='btn-primary'
                                    style={{ borderRadius: "5px", marginLeft: "10px" }}
                                    onClick={this.onFileUpload}>
                                    Upload
                                </button>
                                <button
                                    style={{ borderRadius: "5px", marginLeft: "10px" }}
                                    onClick={this.canelUpload}>
                                    Cancel!
                                </button>
                            </div>
                        </div>

                    </div>
                    <br></br>
                    <input type="image" style={{ marginLeft: "62px" }} src={this.state.base64Image} className="display-image" height="200px" alt="oops!" />
                </div>
            );
        } else {
            return (
                <div>
                    <br />
                    <h6 style={{ color: '#ed6c6c' }}  >Choose a file..!</h6>
                </div>
            );
        }
    };
    updateCommentData = () => {
        const { type } = this.props.component;
        let { value } = this.state;
        let Filename = value?.UploadResponseData || "";
        this.setState(
          {
            value: {
              name: Filename,
              type
            },
          },
          () => this.props.onChange(this.state.value)
        );
      };
    render() {
        const { disabled, name } = this.props;
        let {data} = this.state.UploadResponseData; 
        return (
            <div disabled={disabled}
                 name={name}
                 value={data}
                 onChange={this.updateCommentData}  
            >
                <div>
                    <input id='fileInput' type="file" onChange={this.onFileChange} />

                </div>
                {this.fileData()}
            </div>
        );
    }
}

