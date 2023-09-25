import React, { Component } from 'react';
import './styless.css';
export default class Progressbar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: props.value || "20",
        };
    }
    render() {
        const Width = this.state.value;
        return (
            <div>
                <div className='progress-background' style={{ borderColor: `${Width === 100 ? "#41ff00" : 'white'}` }}>
                    <h4>
                        {Width}% Completed
                    </h4>
                    <progress id="file" value={Width ? Width : 0} max="100" style={{ width: "100%" }}> {Width}% </progress>
                </div>

            </div>
        );
    }
}
