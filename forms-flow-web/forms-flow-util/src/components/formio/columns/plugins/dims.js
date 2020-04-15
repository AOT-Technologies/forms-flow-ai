export default (component) => {
  let dims = {
    width: component._baseWidth,
    height: component._baseHeight
  };

  for (let i = 0; i < component.columns.length; i++) {

    let components = component.columns[i].components;
    let width = 0;
    let height = 0;

    for (let j = 0; j < components.length; j++) {
      let d = components[j].getDimensions();

      width += d.width || 0;
      height += d.height || 0;
    }
    dims.width += width;
    dims.height += height;
  }
  return dims;
};

