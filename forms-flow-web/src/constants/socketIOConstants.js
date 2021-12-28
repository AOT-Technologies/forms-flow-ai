/* istanbul ignore file */
export const WEBSOCKET_ENCRYPT_KEY = `${(window._env_ && window._env_.REACT_APP_WEBSOCKET_ENCRYPT_KEY) || process.env.REACT_APP_WEBSOCKET_ENCRYPT_KEY}`;
