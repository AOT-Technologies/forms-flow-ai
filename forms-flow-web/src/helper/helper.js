const replaceUrl = (URL, key, value) => {
  return URL.replace(key, value);
};

const getTenantinfo = (process_key, list)=>{
  const process = list.filter((item)=> item.key === process_key)[0]
  if(process){
    return process.tenantKey
  }
  return null
}

export { replaceUrl, getTenantinfo };
