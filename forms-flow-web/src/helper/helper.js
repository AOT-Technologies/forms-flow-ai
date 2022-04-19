const replaceUrl = (URL, key, value) => {
  return URL.replace(key, value);
};

const getUrlParamValue = (name) => {
  if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(window.location.search))
     return decodeURIComponent(name[1]);
}


export { replaceUrl, getUrlParamValue };
