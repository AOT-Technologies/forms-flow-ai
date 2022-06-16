import React, { Component } from 'react';
import UserService from "../../services/UserService";
import API from "../../apiManager/endpoints/index";
import { httpGETRequest, httpPOSTRequest } from "../../apiManager/httpRequestHandler";
import { toast } from "react-toastify";
import { Translation } from "react-i18next";



export default class UploadFile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: props.value, selectedFile: '',
            base64Image: '',
            base64Data: '',
            fileName: '',
            fileType: '',
            uploadSuccess: false,
            loading: false
        };
    }

    onFileChange = async (event) => {
        if (event.target.files[0]) {
            this.setState({ base64Image: '' });
            let file = event.target.files[0];
            this.setState({ selectedFile: file });
            let filesName = file.name;
            this.setState({ fileName: filesName });
            const base64 = await this.convertBase64(file);
            this.splitFileName(filesName);
            let ftype = this.state.fileType;
            if (ftype == "jpg" || ftype == "png") {
                this.setState({ base64Image: base64 });
            }
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
        }

    };
    convertBase64 = (file) => {
        return new Promise(resolve => {
            let baseURL = "";
            let reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                baseURL = reader.result;
                resolve(baseURL);
            };
        });

    }
    onFileUpload = () => {
        if (this.state.selectedFile) {
            var formData = new FormData();
            formData.append("upload", this.state.selectedFile);
            this.FileUPload(formData);
        }
    };
    FileUPload = (data, ...rest) => {
        this.setState({ loading: true });
        const done = rest.length ? rest[0] : () => { };
        const URL = API.CMIS_UPLOAD_FILE;
        httpPOSTRequest(URL, data, UserService.getToken())
            .then((res) => {
                if (res.data) {
                    this.setState({ loading: false });
                    done(null, res.data);
                    this.setState({ selectedFile: '' });
                    const { type } = this.props.component;
                    this.setState(
                        {
                            value: {
                                name: res.data.name,
                                type
                            },
                        },
                        () => this.props.onChange(this.state.value)
                    );
                    toast.success(<Translation>{(t) => t("Upload successfull")}</Translation>);
                    this.setState({ uploadSuccess: true });
                } else {
                    done("Error Posting data");
                    this.setState({ loading: false });
                }
            })
            .catch((error) => {
                this.setState({ loading: false });
                toast.error(<Translation>{(t) => t("Failed to upload file")}</Translation>);
                done(error);
            });
    };

    fetchCMISfile = (e, ...rest) => {
        this.setState({ loading: true });
        const fileName = this.state.value?.name || "images.jpg";
        this.splitFileName(fileName);
        const done = rest.length ? rest[0] : () => { };
        const downloadURL = API.CMIS_DOWNLOAD_FILE + fileName;
        httpGETRequest(downloadURL, {}, UserService.getToken())
            .then((res) => {
                this.setState({ loading: false });
                let { data } = res.data[0];
                let base64Data = data;
                this.setState({ base64Data: base64Data });
                this.downloadFIle();
                toast.success(<Translation>{(t) => t("Download successfull")}</Translation>);
            })
            .catch((error) => {
                done(error);
                this.setState({ loading: false });
                toast.error(<Translation>{(t) => t("Failed to download file")}</Translation>);
            });
    };
    splitFileName = (fileName) => {
        let ftype = fileName.split(".")[1];
        this.setState({ fileType: ftype });
    }
    downloadFIle = () => {
        let type = this.state.fileType;
        if (type == "jpg" || type == "png") {
            let data = "data:image/" + type + ";base64," + this.state.base64Data;
            this.setState({ base64Image: data });
        }
        let data = "data:image/" + type + ";base64," + this.state.base64Data;
        const downloadLink = document.createElement("a");
        downloadLink.href = data;
        downloadLink.download = this.state.value?.name;
        downloadLink.click();
    }
    canelUpload = () => {
        this.setState({ selectedFile: '', });
        this.render();
    }
    fileData = () => {
        var { disabled } = this.props;
        if (this.state.selectedFile) {
            return (
                <div>
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
                            <div className="column" style={{ paddingRight: "12px" }}>
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
                            {this.state.loading && <div className="lds-ripple"><div></div><div></div></div>}
                        </div>
                        <br></br>
                        {this.state.base64Image && <input type="image" src={this.state.base64Image} className="display-image" height="200px" alt="oops!" />}
                    </div>
                    {this.state.fileName && <h6 style={{ color: '#ed6c6c', paddingTop: '3px' }}  >Kindly upload the file...!</h6>}
                </div>
            );
        } else {
            return (
                <div>
                    <br />
                    {!disabled && !this.state.uploadSuccess && <h6 style={{ color: '#ed6c6c' }}  >Choose a file..!</h6>}
                </div>
            );
        }
    };
    render() {
        var { disabled, name } = this.props;
        let { value } = this.state;
        let Name = value?.name ;
        let img = this.state.base64Image;
       
        return (
            <div>
                {this.state.uploadSuccess && <span style={{fontWeight: "bold"}}><i className='fa fa-file-zip-o' style = {{fontSize:'22px', color:'red', paddingRight: '6px'}}></i>{Name}</span>}
                {!disabled && this.state.selectedFile == '' && !this.state.uploadSuccess && <div>
                    <input
                        disabled={disabled}
                        name={name}
                        onChange={this.onFileChange}
                        type="file" />
                </div>}
                {this.fileData()}
                {disabled && Name ? Name &&  <div>
                    <span style={{fontWeight: "bold"}}><i className='fa fa-file-zip-o' style = {{fontSize:'22px', color:'red', paddingRight: '6px'}}></i>{Name}</span>
                    <button
                        type='button'
                        className='btn-download'
                        style={{ borderRadius: "5px", marginLeft: "10px" }}
                        onClick={this.fetchCMISfile}>
                        <i style={{marginRight: '10px'}} className="fa fa-download"></i>
                        Download
                    </button>
                    <br></br>

                    {img && !this.state.loading ? img && <div id='downloadImage' style={{ marginTop: "10px" }}>
                        <h5>Downloaded Image: </h5>
                        <input type="image" src={this.state.base64Image} className="display-image" height="200px" alt="oops!" />
                        {/* Loader */}
                    </div> : this.state.loading && <div className="lds-ripple"><div></div><div></div></div>
                    }
                </div> : disabled && <input type='file' disabled/>}
            </div>
        );
    }
}

