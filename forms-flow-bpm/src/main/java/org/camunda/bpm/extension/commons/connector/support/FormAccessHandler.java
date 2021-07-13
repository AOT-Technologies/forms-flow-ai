package org.camunda.bpm.extension.commons.connector.support;


import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.camunda.bpm.engine.ProcessEngines;
import org.camunda.bpm.engine.runtime.VariableInstance;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;


import java.util.List;
import java.util.logging.Logger;

/**
 * This class serves as gateway for all formio interactions.
 *
 * @author sumathi.thirumani@aot-technologies.com
 */
@Service("formAccessHandler")
public class FormAccessHandler extends FormTokenAccessHandler implements IAccessHandler {

    private final Logger LOGGER = Logger.getLogger(FormAccessHandler.class.getName());



    public ResponseEntity<String> exchange(String url, HttpMethod method, String payload) {
        String accessToken = getToken();
        if(StringUtils.isBlank(accessToken)) {
            LOGGER.info("Access token is blank. Cannot invoke service:"+url);
            return null;
        }
        ResponseEntity<String> response = exchange(url,method,payload,accessToken);
        if(response.getStatusCodeValue() == getTokenExpireCode()) {
            exchange(url,method,payload,getAccessToken());
        }
        LOGGER.info("Response code for service invocation: " + response.getStatusCode());
        return response;
    }

    public ResponseEntity<String> exchange(String url, HttpMethod method, String payload, String accessToken) {
        //HTTP Headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-jwt-token", accessToken);
        HttpEntity<String> reqObj =
                new HttpEntity<String>(payload, headers);
        if(HttpMethod.PATCH.name().equals(method.name())) {
            HttpComponentsClientHttpRequestFactory requestFactory = new HttpComponentsClientHttpRequestFactory();
            RestTemplate restTemplate = new RestTemplate(requestFactory);
            String response = restTemplate.patchForObject(getDecoratedServerUrl(url), reqObj, String.class);
            if("Token Expired".equalsIgnoreCase(response)) {
                return new ResponseEntity<>(response, HttpStatus.valueOf(getTokenExpireCode()));
            }
            return new ResponseEntity<>(response, HttpStatus.OK);
        }
        return getRestTemplate().exchange(getDecoratedServerUrl(url), method, reqObj, String.class);
    }



    private String getDecoratedServerUrl(String url) {
        if(StringUtils.contains(url,"/form/")) {
            return getIntegrationCredentialProperties().getProperty("formio.url") + "/form/" + StringUtils.substringAfter(url, "/form/");
        }
        return getIntegrationCredentialProperties().getProperty("formio.url") +"/"+ StringUtils.substringAfterLast(url, "/");
    }

    private String getToken() {
        List<VariableInstance> accessTokens = ProcessEngines.getDefaultProcessEngine().getRuntimeService().createVariableInstanceQuery().variableName("formio_access_token").orderByActivityInstanceId().desc().list();
        if(CollectionUtils.isNotEmpty(accessTokens)) {
            return String.valueOf(accessTokens.get(0).getValue());
        }
        LOGGER.info("Unable to extract token from variable context. Generating new JWT token.");
        return getAccessToken();
    }

    private String getTokenName() { return "formio_access_token"; }

    private int getTokenExpireCode() {return 440;}
}
