import React, { Component } from 'react';


export default class SentimentAnalytics extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value
    }
  }
  updateCommentData = (event) => {
    const { type, sentimentAnalyticTopics } = this.props.component;
    let overallSentiment = overallSentiment ? overallSentiment : '';
    this.setState({ value: { text: event.target.value, type, topics: sentimentAnalyticTopics, overallSentiment } }, () => this.props.onChange(this.state.value));
  };

  render() {
    const { disabled, name } = this.props;
    let { value } = this.state;
    const text = value?.text || '';
    return (
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
