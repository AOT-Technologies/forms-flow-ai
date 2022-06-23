const replaceUrl = (URL, key, value) => {
  return URL.replace(key, value);
};

const addTenankey = (value,tenankey)=>{
      return `${tenankey}-${value}`;
};

const removeTenantKey = (value,tenankey)=>{
  let newValue = value.split('-');
  let tenantId = newValue.shift();
  if(tenankey.toLowerCase() === tenantId.toLowerCase()){
    return newValue.join("-");
  }else{
    return false;
  }
};

const checkAndAddTenantKey = (value,tenankey)=>{
  let newValue = value.split('-');
  let tenantId = newValue.shift();
  if(tenankey.toLowerCase() === tenantId.toLowerCase()){
    return value;
  }else{
      return `${tenankey}-${value}`;
  }
};

export { replaceUrl, addTenankey, removeTenantKey, checkAndAddTenantKey};
