import {Components} from 'formiojs';
import _get from 'lodash/get';

export const getComponentDefaultColumn = (component) => ({
  component: Components.create(component, null, null, true),
  key: `data.${component.key}`,
  sort: true,
  title: component.label || component.title || component.key,
  value(submission) {
    const cellValue = _get(submission, this.key, null);

    if (cellValue === null) {
      return '';
    }

    const rendered = this.component.asString(cellValue);
    if (cellValue !== rendered) {
      return {
        content: rendered,
        isHtml: true,
      };
    }

    return cellValue;
  },
});

export function setColumnsWidth(columns) {
  if (columns.length > 6) {
    columns.forEach((column) => {
      column.width = 2;
    });
  }
  else {
    const columnsAmount = columns.length;
    const rowWidth = 12;
    const basewidth = Math.floor(rowWidth / columnsAmount);
    const remainingWidth = rowWidth - basewidth * columnsAmount;

    columns.forEach((column, index) => {
      column.width = (index < remainingWidth) ? (basewidth + 1) : basewidth;
    });
  }
}

export const stopPropagationWrapper = (fn) => (event) => {
  event.stopPropagation();
  fn();
};
