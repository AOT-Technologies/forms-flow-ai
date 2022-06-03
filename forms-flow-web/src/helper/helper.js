const replaceUrl = (URL, key, value) => {
  return URL.replace(key, value);
};

const addTenankeyToPath = (path,tenankey)=>{
      return `${tenankey}-${path}`;
};

export { replaceUrl, addTenankeyToPath};
