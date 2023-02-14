const replaceUrl = (URL, key, value) => {
  return URL.replace(key, value);
};

const addTenantkey = (value, tenantkey) => {
  const tenantKeyCheck = value.match(`${tenantkey}-`);
  if (tenantKeyCheck && tenantKeyCheck[0].toLowerCase() === `${tenantkey.toLowerCase()}-`) {
    return value.toLowerCase();
  } else {
    return `${tenantkey.toLowerCase()}-${value.toLowerCase()}`;
  }
};

const removeTenantKey = (value, tenantkey) => {
  const tenantKeyCheck = value.match(`${tenantkey}-`);
  if (tenantKeyCheck && tenantKeyCheck[0].toLowerCase() === `${tenantkey.toLowerCase()}-`) {
      return  value.replace(`${tenantkey.toLowerCase()}-`,"");
  } else {
    return false;
  }
};

/**
 * 
 * @param {array} data
 * @param {*} Key ? if the data is array of object then you can pass a key 
 * @param {*} order 
 * @returns sorted array
 */
const sortAlphaNum = ({data, key, order = "asc"})=> {
  const value1 = order === "asc" ? 1 : -1;
  const value2 = value1 === 1 ? -1 : 1;
  if(key){
   return data.sort((item1, item2) => item1[key] > item2[key] ? value1 : value2);
  }
  return data.sort((item1, item2) => item1 > item2 ? value1 : value2);
};

export { replaceUrl, addTenantkey, removeTenantKey, sortAlphaNum };
