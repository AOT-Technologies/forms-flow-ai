import _ from 'lodash';
import FormioExportUtils from '../../../../utils';

export default (element, component) => {
  if (component && component.components) {
    let componentElement = FormioExportUtils.createElement('div', {
      class: '',
      id: Math.random().toString(36).substring(7)
    });

    let valueElement = FormioExportUtils.createElement('div', {
      class: 'card card-body'
    });

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
