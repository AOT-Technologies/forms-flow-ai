import _ from 'lodash';
import FormioExportUtils from '../../../../utils';

export default (element, component) => {
  if (component && component.input) {
    let componentElement = FormioExportUtils.createElement('div', {
      class: `formio-component ${component.type}-component card`,
      id: Math.random().toString(36).substring(7)
    });
    let labelElement = FormioExportUtils.createElement('div', {
      class: 'component-label card-header'
    }, component.label);
    let valueElement = FormioExportUtils.createElement('div', {
      class: 'component-value card-body'
    });

    let values = component.formatValues();

    _.forEach(values, (item) => {
      let questionElement = FormioExportUtils.createElement('div', { class: 'row survey-question' },
        FormioExportUtils.createElement('div', { class: 'col-sm-9 text-bold' }, item.question),
        FormioExportUtils.createElement('div', { class: 'col-sm-3' }, item.option)
      );

      valueElement.appendChild(questionElement);
    });

    if (!component.hideLabel && (!component.inDataGrid || component.dataGridLabel)) {
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
