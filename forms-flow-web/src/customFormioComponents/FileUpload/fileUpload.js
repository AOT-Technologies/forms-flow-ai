import React from 'react';
import ReactDOM from 'react-dom';
import { ReactComponent } from 'react-formio';
import settingsForm from './fileUpload.settingsForm';
import FileUpload from "./fileUploadInputComponent";


export default class UploadFile extends ReactComponent {
  /**
   * This function tells the form builder about your component. It's name, icon and what group it should be in.
   *
   * @returns {{title: string, icon: string, group: string, documentation: string, weight: number, schema: *}}
   */
  static get builderInfo() {
    return {
      title: 'CMIS File Upload',
      icon: 'upload',
      group: 'basic',
      documentation: '', //TODO
      weight: 110,
      schema: UploadFile.schema()
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
      type: 'fileUpload',
      label: 'File Upload',
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
    let instance;
    // eslint-disable-next-line react/no-render-return-value
    return ReactDOM.render(
      
      <FileUpload
        ref={(refer) => {
          instance = refer;
        }}
        component={this.component} // These are the component settings
        //if you want to use them to render the component.
        value={this.dataValue} // The starting value of the component.
        data={this.data}
        name={this.name}
        onChange={this.updateValue}
        disabled={this.disabled}
        // The onChange event to call when the value changes.
      />,
      element,
      () => (this.reactInstance = instance)
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
