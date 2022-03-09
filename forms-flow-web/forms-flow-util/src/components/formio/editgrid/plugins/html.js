import _ from 'lodash';
import FormioExportUtils from '../../../../utils';

export default (element, component) => {
  if (component && component.components) {
    let componentElement = FormioExportUtils.createElement('div', {
      class: `formio-component grid-component ${component.type}-component card`,
      id: Math.random().toString(36).substring(7)
    });
    let labelElement = FormioExportUtils.createElement('div', {
      class: 'component-label card-header'
    }, component.getLabel());
    let valueElement = FormioExportUtils.createElement('div', {
      class: 'component-value card-body'
    });

    let transpose = component.numRows < component.numCols;

    if (!transpose) {
      let headerElement = FormioExportUtils.createElement('div', { class: 'row grid-row grid-header' });

      _.forEach(component.rows[0], (c) => {
        if (c) {
          headerElement.appendChild(FormioExportUtils.createElement('div', { class: 'col grid-cell' }, c.getLabel()));
        }
      });
      valueElement.appendChild(headerElement);
      _.forEach(component.rows, (row) => {
        let rowElement = FormioExportUtils.createElement('div', { class: 'row grid-row' });

        _.forEach(row, (col) => {
          if (col) {
            let colElement = FormioExportUtils.createElement('div', { class: 'col grid-cell' });

            col.toHtml(colElement);
            rowElement.appendChild(colElement);
          }
        });
        valueElement.appendChild(rowElement);
      });
    } else {
      valueElement.className += ' grid-transpose';
      _.forEach(component.components, (row, i) => {
        let rowElement = FormioExportUtils.createElement('div', {
          class: 'row grid-row'
        }, FormioExportUtils.createElement('div', {
          class: 'col col-sm-3 grid-cell text-bold'
        }, row.legend || row.title || row.label));

        _.forEach(component.rows, (col) => {
          let colElement = FormioExportUtils.createElement('div', { class: 'col grid-cell' });

          col[i].toHtml(colElement);
          rowElement.appendChild(colElement);
        });
        valueElement.appendChild(rowElement);
      });
    }

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
