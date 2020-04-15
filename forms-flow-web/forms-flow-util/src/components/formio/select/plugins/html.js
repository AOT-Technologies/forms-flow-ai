import _ from 'lodash';
import FormioExportUtils from '../../../../utils';

export default (element, component) => {
  if (component && component.input) {
    let componentElement = FormioExportUtils.createElement('div', {
      class: `formio-component ${component.type}-component`,
      id: Math.random().toString(36).substring(7)
    });

    let labelElement = FormioExportUtils.createElement('div', { class: 'col component-label' }, component.label);
    let valueElement = FormioExportUtils.createElement('div', { class: 'col component-value' });
    let values = component.formatValues();

    _.forEach(values, (value) => {
      let selectionElement = FormioExportUtils.createElement('div', { class: 'component-item', innerHTML: value });

      valueElement.appendChild(selectionElement);
    });

    if (!component.hideLabel && (!component.inDataGrid || component.dataGridLabel)) {
      labelElement.className += ' col-sm-3';
      valueElement.className += ' col-sm-9';
      componentElement.appendChild(labelElement);
    }

    componentElement.appendChild(valueElement);
    if (_.isElement(element)) {
      element.appendChild(componentElement);
    }
    return componentElement;
  }
  return null;
};
