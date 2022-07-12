/**
 * Function to dynamically generate regEx from the given path and baseUrl
 * @param {string} path - The path name to match
 * @param {string} baseUrl - The base url "/" for single tenant and "/tenant/:tenantId" for multitenant environment
 * @returns {object} - RegExp object
 */
const createURLPathMatchExp = function (path, baseUrl) {
  return new RegExp("^" + baseUrl + path);
};

export default createURLPathMatchExp;
