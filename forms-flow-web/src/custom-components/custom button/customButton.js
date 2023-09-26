import React from 'react';
import ReactDOM from 'react-dom';
import { ReactComponent } from 'react-formio';
import settingsForm from './customButton.settingsForm';
import CustomButton from "./customButtonInputComponent";

export default class customButton extends ReactComponent {
    /**
     * This function tells the form builder about your component. It's name, icon and what group it should be in.
     *
     * @returns {{title: string, icon: string, group: string, documentation: string, weight: number, schema: *}}
     */
    static get builderInfo() {
        return {
            title: 'Custom Button',
            group: 'custom',
            icon: 'stop',
            weight: 70,
            schema: customButton.schema(),
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
            type: 'customButton',
            label: 'Custom Button',
            action: 'custom',
            custom: "const submissionId = form._submission._id;\nconst formDataReqUrl = form.formio.formUrl+'/submission/'+submissionId;const formDataReqObj1 =  {  \"_id\": submissionId,  \"data\": data};\nconst formio = new Formio(formDataReqUrl);\nformio.saveSubmission(formDataReqObj1).then( result => {\nform.emit('customEvent', {\n          type: \"actionComplete\",   \n          component: component,\n          actionType:data.clerkActionType\n    }); \n}).catch((error)=>{\n//Error callback on not Save\n});"

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

            <CustomButton
                ref={(refer) => {
                    instance = refer;
                }}
                component={this.component} // These are the component settings
                //if you want to use them to render the component.
                value={this.dataValue} // The starting value of the component.
                data={this.data}
                schema={this.schema}
                key={this.key}
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