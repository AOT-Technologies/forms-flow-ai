import React from 'react';
import ReactDOM from 'react-dom';
import { ReactComponent } from 'react-formio';
import settingsForm from './TextAreaWithAnalytics.settingsForm';

/**
 * An Text Area With Analytics React component
 *
 * Replace this with your custom react component. It needs to have two things.
 * 1. The value should be stored is state as "value"
 * 2. When the value changes, call props.onChange(null, newValue);
 *
 * This component has a text Area used for sentiment Analysis.
 */

const SentimentAnalytics = (props) => {
  // const [comment, updateComment] = useState(props.value||'');
  const {onChange, value, data, disabled, name} = props;
  const {type, sentimentAnalyticTopics, key} = props.component;
  //TODO text mapping to check
  console.log("props", props, sentimentAnalyticTopics, type,key, value,data, typeof data, data[key],data[2], data.reviewFood);

  const updateCommentData = (input) =>{
    const updateVal = {
      type:type,
      text:input,
      topic:sentimentAnalyticTopics
    };
    onChange(updateVal);
  };

  return (
    <>
      <textarea
        name={name}
        rows="3"
        className="form-control"
        onChange={e=>updateCommentData(e.target.value)}
        disabled={disabled}
      />
      <h1>{data[key]}</h1>
      </>
  );
}

export default class TextAreaWithAnalytics extends ReactComponent {
  /**
   * This function tells the form builder about your component. It's name, icon and what group it should be in.
   *
   * @returns {{title: string, icon: string, group: string, documentation: string, weight: number, schema: *}}
   */
  static get builderInfo() {
    return {
      title: 'Text Area With Analytics',
      icon: 'area-chart',
      group: 'basic',
      documentation: '', //TODO
      weight: 110,
      schema: TextAreaWithAnalytics.schema()
    };
  }

  /**
   * This function is the default settings for the component. At a minimum you want to set the type to the registered
   * type of your component (i.e. when you call Components.setComponent('type', MyComponent) these types should match.
   *
   * @param sources
   * @returns {*}
   */
  static schema() {
    return ReactComponent.schema({
      type: 'textAreaWithAnalytics',
      label: 'Text Area With Analytics',
    });
  }

  /*
   * Defines the settingsForm when editing a component in the builder.
   */
  static editForm = settingsForm;

  /**
   * This function is called when the DIV has been rendered and added to the DOM. You can now instantiate the react component.
   *
   * @param DOMElement
   * #returns ReactInstance
   */
  attachReact(element) {
    console.log("attach", this);
    return ReactDOM.render(
      <SentimentAnalytics
        component={this.component} // These are the component settings if you want to use them to render the component.
        value={this.dataValue} // The starting value of the component.
        data={this.data}
        name={this.name}
        onChange={this.updateValue}
        disabled={this.disabled}
        // The onChange event to call when the value changes.
      />,
      element
    );
  }

  /**
   * Automatically detach any react components.
   *
   * @param element
   */
  detachReact(element) {
    if (element) {
      ReactDOM.unmountComponentAtNode(element);
    }
  }
}
