const replaceUrl = (URL, key, value) => {
  return URL.replace(key, value);
};

const addTenankey = (value,tenankey)=>{
      return `${tenankey}-${value}`;
};

const removeTenantKey = (value,tenankey)=>{
  let newValue = value.split('-');
  let tenantId = newValue.shift();
  if(tenankey === tenantId){
    return {valueWithTenantKey:true, newValue:newValue.join("-")};
  }else{
    return {valueWithTenantKey:false, newValue:value};
  }
};

const checkAndAddTenantKey = (value,tenankey)=>{
  let newValue = value.split('-');
  let tenantId = newValue.shift();
  if(tenankey === tenantId){
    return value;
  }else{
      return `${tenankey}-${value}`;
  }
};

export { replaceUrl, addTenankey, removeTenantKey, checkAndAddTenantKey};
