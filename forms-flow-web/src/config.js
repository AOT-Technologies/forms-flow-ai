let PROJECT_URL = (window._env_ && window._env_.REACT_APP_API_PROJECT_URL) || process.env.REACT_APP_API_PROJECT_URL || 'http://127.0.0.1:3001';
let API_URL = (window._env_ && window._env_.REACT_APP_API_SERVER_URL) || process.env.REACT_APP_API_SERVER_URL || 'http://127.0.0.1:3001';

let query = {};
window.location.search.substr(1).split('&').forEach(function(item) {
  query[item.split('=')[0]] = item.split('=')[1] && decodeURIComponent(item.split('=')[1]);
});

PROJECT_URL = query.projectUrl || PROJECT_URL;
API_URL = query.apiUrl || API_URL;

export const AppConfig = {
  projectUrl: PROJECT_URL,
  apiUrl: API_URL
};
