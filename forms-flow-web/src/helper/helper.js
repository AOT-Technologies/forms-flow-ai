const replaceUrl = (URL, key, value) => {
  return URL.replace(key, value);
};

const addTenankey = (value, tenankey) => {
  const tenantKeyCheck = value.match(`${tenankey}-`);
  if (tenantKeyCheck && tenantKeyCheck[0].toLowerCase() === `${tenankey.toLowerCase()}-`) {
    return value.toLowerCase();
  } else {
    return `${tenankey.toLowerCase()}-${value.toLowerCase()}`;
  }
};

const removeTenantKey = (value, tenankey) => {
  const tenantKeyCheck = value.match(`${tenankey}-`);
  if (tenantKeyCheck && tenantKeyCheck[0].toLowerCase() === `${tenankey.toLowerCase()}-`) {
      return  value.replace(`${tenankey.toLowerCase()}-`,"");
  } else {
    return false;
  }
};


export { replaceUrl, addTenankey, removeTenantKey };
