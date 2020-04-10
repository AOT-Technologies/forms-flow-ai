export default (config = {}) => {
  return new Promise((resolve, reject) => {
    try {
      throw new Error('[FormioExport] method not implemented');
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });
};
