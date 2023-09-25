import React, { Component } from 'react';
import './toggle.scss';

export default class ToggleSwitch extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: props.value,
            isChecked: false,
        };
    }

    handleToggle = () => {
        this.setState((prevState) => ({
            isChecked: !prevState.isChecked,
            value: !prevState.isChecked, // Update value based on the new state
        }), () => this.props.onChange(this.state.value));
    };

    render() {
        const { isChecked } = this.state;

        return (
            <label className="toggle-switch">
                <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={this.handleToggle}
                />
                <span className="toggle-slider"></span>
            </label>
        );
    }
}
