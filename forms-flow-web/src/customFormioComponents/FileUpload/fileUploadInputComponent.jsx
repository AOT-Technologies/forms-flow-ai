import React, { Component } from 'react';
import cmisService from '../../apiManager/services/cmisService';

export default class UploadFile extends Component {

    constructor(props) {
        super(props);
        this.state = {
            selectedFile: '',
            name: ""
        };
    }
    onFileChange = (event) => {
        let file = event.target.files[0];
        console.log(file);
        this.setState({ selectedFile: file });
    };


    onFileUpload = () => {
        var timestamp = new Date().getTime();
        var fileName = timestamp + "-" + this.state.selectedFile.name;
        var formData = new FormData();
        formData.append("name", fileName);
        formData.append("upload", this.state.selectedFile);
        console.log(fileName);
        console.log("formData---} ", ...formData);
        console.log("upload", ...formData);
        cmisService (formData);
    };

    fileData = () => {

        if (this.state.selectedFile) {

            return (
                <div className='file-details'>
                    <h4><b>File Details:</b></h4>
                    <p>File Name: {this.state.selectedFile.name}</p>
                    <p>File Type: {this.state.selectedFile.type}</p>
                    <p>
                        Last Modified:{" "}
                        {this.state.selectedFile.lastModifiedDate.toDateString()}
                    </p>
                </div>
            );
        } else {
            return (
                <div>
                    <br />
                    <h4>Choose before Pressing the Upload button</h4>
                </div>
            );
        }
    };

    render() {

        return (
            <div>

                <div>
                    <input type="file" onChange={this.onFileChange} />
                    <button className='btn-primary' style={{ borderRadius: "5px" }} onClick={this.onFileUpload}>
                        Upload!
                    </button>
                </div>
                {this.fileData()}
            </div>
        );
    }
}

