import React, {Component} from 'react';
/**
 * An example React component this is simply a controlled input element.
 *
 */
export default class SentimentAnalytics extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value
    }
  }

  updateCommentData = (event) => {
    const {type, sentimentAnalyticTopics} = this.props.component;
    this.setState({value: {text:event.target.value,type,topics:sentimentAnalyticTopics}}, () => this.props.onChange(this.state.value));
  };

  render() {
    const {disabled, name} = this.props;
    let { value } = this.state;
    const text = value?.text || '';
    return  (
      /*<input type="text" value={value} className={this.props.component.customClassName} onChange={this.setValue}></input>*/
      <textarea
        name={name}
        rows="3"
        value={text}
        className="form-control"
        onChange={this.updateCommentData}
        disabled={disabled}
      />
    );
  }
};
