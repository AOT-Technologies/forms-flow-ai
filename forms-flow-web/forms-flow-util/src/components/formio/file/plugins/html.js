import _ from 'lodash';
import FormioExportUtils from '../../../../utils';

export default (element, component) => {
  if (component && component.input) {
    let componentElement = FormioExportUtils.createElement('div', {
      class: `formio-component ${component.type}-component`,
      id: Math.random().toString(36).substring(7)
    });

    let labelElement = FormioExportUtils.createElement('div', {
      class: 'col col-sm-3 component-label'
      // MikeH: component.footer || component.label is used to get the correct label when file is a signature
    }, component.footer || component.label);
    let valueElement = FormioExportUtils.createElement('div', {
      class: 'col col-sm-9 component-value'
    });

    _.forEach(component._value, (file) => {
      if (_.isObject(file)) {
        if (component.image || component.type === 'signature') {
          valueElement.appendChild(FormioExportUtils.createElement('img', { src: file.url, class: 'img-responsive' }));
        } else {
          let label = `${file.originalName || file.name} (${(file.size / 1024).toFixed(2)} KB)<br/>`;

          valueElement.insertAdjacentHTML('beforeend', label);
        }
      }
    });

    componentElement.appendChild(labelElement);
    componentElement.appendChild(valueElement);

    if (_.isElement(element)) {
      element.appendChild(componentElement);
    }
    return componentElement;
  }
  return null;
};
