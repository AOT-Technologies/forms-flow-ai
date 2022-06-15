import React, { Component } from 'react';
import { httpGETRequest, httpPOSTRequest } from "../../apiManager/httpRequestHandler";
import UserService from "../../services/UserService";
import API from "../../apiManager/endpoints/index";
//import { Conjunctions } from 'formiojs';

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
            fileName: '',
        };
    }
    onFileChange = async (event) => {
        let file = event.target.files[0];
        console.log(file);
        this.setState({ selectedFile: file });
        console.log("selected file:", this.state.selectedFile);
        let filesName = file.name;
        this.setState({ fileName: filesName });
        const base64 = await this.convertBase64(file);
        console.log("base64  : ", base64);
        this.setState({ base64Image: base64 });

        const { type } = this.props.component;
        this.setState(
            {
                value: {
                    name: event.target.files[0].name,
                    type
                },
            },
            () => this.props.onChange(this.state.value)
        );


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
            var filesName = timestamp + "-" + this.state.selectedFile.name;

            var formData = new FormData();
            formData.append("name", filesName);
            formData.append("upload", this.state.selectedFile);
            this.FileUPload(formData);
            // console.log("form Data befor send", ...formData);
            // let TheName = 'libreryRoomOne.jpg';
            // this.fetchCMISfile(TheName);
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
                    this.setState({ UploadResponseData: res.data, selectedFile: '' });
                    this.fileData();
                    console.log("UploadResponse :", this.state.UploadResponseData);
                    console.log("selectedFile clear :", this.state.selectedFile);
                    console.log("props value: ", this.props.data.myFileUploads.name);
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

    fetchCMISfile = (e, ...rest) => {
        const fielName = this.state.value?.name || "images.jpg";
        console.log("download clicked");
        const done = rest.length ? rest[0] : () => { };
        const downloadURL = API.CMIS_DOWNLOAD_FILE + fielName;
        console.log("apiURL   :", API.CMIS_DOWNLOAD_FILE);
        console.log("download URL  :", downloadURL);
        httpGETRequest(downloadURL, {}, UserService.getToken())
            .then((res) => {
                let { data } = res.data[0];
                let base64Data = "data:image/jpeg;base64," + data;
                console.log("res Data :", base64Data);
                this.setState({ base64Image: base64Data });

                
                const downloadLink = document.createElement("a");
                downloadLink.href = base64Data;
                downloadLink.download = this.state.fileName;
                downloadLink.click();
               
                //window.location.href = 'data:application/octet-stream;base64,' + base64Data;


                // const imageObjectURL = URL.createObjectURL(res);
                // this.setState({ imgUrl: imageObjectURL });
                // console.log("imgUrl: ", this.state.imgUrl);
            })

            .catch((error) => {
                done(error);
            });

    };

    canelUpload = () => {
        this.setState({ selectedFile: '', });
        location.reload();
    }

    fileData = () => {
        var { disabled } = this.props;
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
                    {!disabled && <h6 style={{ color: '#ed6c6c' }}  >Choose a file..!</h6>}
                </div>
            );
        }
    };
    updateCommentData = (event) => {
        const { type, } = this.props.component;
        //   let { value } = this.state;

        this.setState(
            {
                value: {
                    name: event.target.files[0].name,
                    type
                },
            },
            () => this.props.onChange(this.state.value)
        );
        this.onFileChange(event);
    };
    render() {
        console.log("rendering...:", this.state.value);
        var { disabled, name } = this.props;
        let { value } = this.state;
        let testValue = 'display';
        let img = this.state.base64Image;
        let Name = value?.name || 'sample file.jpg';
        return (
            <div>

                {!disabled && <div>
                    <input
                        disabled={disabled}
                        name={name}
                        onChange={this.updateCommentData}
                        id='fileInput' type="file" />
                    {/* onChange={this.onFileChange} */}
                </div>}
                {this.fileData()}
                {testValue == 'display' && disabled && <div>
                    <span>{Name}</span>
                    <button type='button'
                        style={{ borderRadius: "5px", marginLeft: "10px" }}
                        onClick={this.fetchCMISfile}>
                        Download
                    </button>

                    {img && <div id='downloadImage' style={{ marginTop: "10px" }}>
                        <h5>Downloaded Image: </h5>
                        <input type="image" src={this.state.base64Image} className="display-image" height="200px" alt="oops!" />

                        {/* <a download={Name} href = {this.state.base64Image}>Download</a> */}
                        {/* style={{ marginLeft: "62px" }} */}
                    </div>}
                </div>}

            </div>

        );

    }
    dwnld = (eve) => {
        console.log("clicked me", eve);
    }

}

