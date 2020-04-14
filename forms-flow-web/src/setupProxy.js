const { createProxyMiddleware } = require('http-proxy-middleware');
const bpmUrl= process.env.REACT_APP_BPM_API_BASE || 'https://bpm1.aot-technologies.com';

module.exports = function(app) {
    app.use(createProxyMiddleware('/camunda', {
      target: bpmUrl,
      changeOrigin: true
    }))
};
