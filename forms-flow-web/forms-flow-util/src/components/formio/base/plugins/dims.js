export default (component) => {
  let dims = {
    width: component._baseWidth,
    height: component._baseHeight
  };

  if (component.label) {

    switch (component.labelPosition) {
      case 'top':
      case 'bottom':
        dims.height++;
        break;
      default:
        dims.width++;
    }
  }

  return dims;
};
