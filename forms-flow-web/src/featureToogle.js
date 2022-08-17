function getEnv(env_string) {
  let ENV_BOOLEAN =
    (window._env_ && window._env_[env_string]) ||
    process.env[env_string] ||
    false;

  return ENV_BOOLEAN === "true" || ENV_BOOLEAN === true
  ? true
  : false;
}

// Either take values from env or can directly give true or false
export const featureFlags = {
  exportPdf: getEnv('REACT_APP_EXPORT_PDF_ENABLED')
};
