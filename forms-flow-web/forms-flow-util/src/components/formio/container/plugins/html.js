import _ from 'lodash';
import FormioExportUtils from '../../../../utils';

export default (element, component) => {
  if (component && component.components) {
    let componentElement = FormioExportUtils.createElement('div', {
      class: `formio-component ${component.type}-component card`,
      id: Math.random().toString(36).substring(7)
    });
    let labelElement = FormioExportUtils.createElement('div', {
      class: 'component-label card-header'
    }, component.getLabel());
    let valueElement = FormioExportUtils.createElement('div', {
      class: 'component-value card-body'
    });

    if (!component.inDataGrid || component.dataGridLabel) {
      componentElement.appendChild(labelElement);
    }

    _.forEach(component.components, (c) => {
      if (c) {
        if (component.inDataGrid) {
          c._options.equalCols = true;
        }
        c.toHtml(valueElement);
      }
    });

    componentElement.appendChild(valueElement);

    if (_.isElement(element)) {
      element.appendChild(componentElement);
    }
    return componentElement;
  }
  return null;
};
