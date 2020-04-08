import React, { Component } from 'react';
/**
 * An example React component this is simply a controlled input element.
 *
 */
export default class extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value
    }
  }

  setValue = (event) => {
    this.setState({value: event.target.value}, () => this.props.onChange(null, this.state.value));
  };

  render() {
    let { value } = this.state;
    value = value || '';
    return  (
      <input type="text" value={value} className={this.props.component.customClassName} onChange={this.setValue}></input>
    );
  }
};
