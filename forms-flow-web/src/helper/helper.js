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

const textTruncate = (wordLength,targetLength,text) => {
  return text?.length > wordLength ? text.substring(0, targetLength) + '...' : text;
};


export { replaceUrl, addTenantkey, removeTenantKey, textTruncate };
