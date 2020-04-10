const URL_CONFIG = {
  dev: 'http://207.216.46.125:8000/camunda/engine-rest/process-definition/key/',
  devToken:'https://iam.aot-technologies.com/auth/realms/forms-flow-ai/protocol/openid-connect/token',
  token:'/token',
  devUrl:'/camunda/engine-rest/process-definition/key/'
}

const BASE_API_URL = URL_CONFIG.devUrl;
const BASE_TOKEN_URL = URL_CONFIG.devToken // todo update to devToken; issue of cors

export default {
  BASE_API_URL,
  BASE_TOKEN_URL
}
