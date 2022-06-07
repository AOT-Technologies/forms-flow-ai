import React, { Component } from 'react';
import cmisService from '../../apiManager/services/cmisService';

export default class UploadFile extends Component {

    constructor(props) {
        super(props);
        this.state = {
            selectedFile: ''
        };
    }
    onFileChange = (event) => {
        let file = event.target.files[0];
        console.log(file);
        this.setState({ selectedFile: file });
    };


    onFileUpload = () => {
        if (this.state.selectedFile) {
            var timestamp = new Date().getTime();
            var fileName = timestamp + "-" + this.state.selectedFile.name;
            var formData = new FormData();
            formData.append("name", fileName);
            formData.append("upload", this.state.selectedFile);
            cmisService(formData);
        }

    };
    canelUpload = (event) => {
        event.preventDefault();
        this.setState({ selectedFile: '', });
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
                                    //className={this.state.selectedFile ? "btn-primary" : "btn-inactive"}
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

    render() {

        return (
            <div>

                <div>
                    <input type="file" onChange={this.onFileChange} />

                </div>
                {this.fileData()}

            </div>
        );
    }
}

