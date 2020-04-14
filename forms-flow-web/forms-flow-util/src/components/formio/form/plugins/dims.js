import _ from 'lodash';

export default (component) => {
  let dims = {
    width: component._baseWidth,
    height: component._baseHeight
  };

  let maxWidth = 0;

  _.forEach(component.components, (c) => {
    if (c) {
      let d = c.getDimensions();

      if (maxWidth < d.width) {
        maxWidth = d.width;
      }
      dims.height += d.height;
    }
  });

  dims.width += maxWidth;
  return dims;
};
