package org.camunda.bpm.extension.commons.connector.support;


import org.apache.commons.lang3.StringUtils;
import org.camunda.bpm.engine.ProcessEngines;
import org.camunda.bpm.engine.runtime.VariableInstance;
import org.springframework.http.*;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;


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
        //HTTP Headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-jwt-token", getAccessToken());
        HttpEntity<String> reqObj =
                new HttpEntity<String>(payload, headers);
        if(HttpMethod.PATCH.name().equals(method.name())) {
            HttpComponentsClientHttpRequestFactory requestFactory = new HttpComponentsClientHttpRequestFactory();
            RestTemplate restTemplate = new RestTemplate(requestFactory);
            String  response= restTemplate.patchForObject(getDecoratedServerUrl(url), reqObj, String.class);
            return new ResponseEntity<>(response, HttpStatus.OK);
        }
        ResponseEntity<String> wrsp = getRestTemplate().exchange(getDecoratedServerUrl(url), method, reqObj, String.class);
        LOGGER.info("Response code for service invocation: " + wrsp.getStatusCode());

        return wrsp;
    }

    private String getDecoratedServerUrl(String url) {
        if(StringUtils.contains(url,"/form/")) {
            return getIntegrationCredentialProperties().getProperty("formio.url") + "/form/" + StringUtils.substringAfter(url, "/form/");
        }
        return getIntegrationCredentialProperties().getProperty("formio.url") +"/"+ StringUtils.substringAfterLast(url, "/");
    }

    private String getToken() {
        VariableInstance accessToken = ProcessEngines.getDefaultProcessEngine().getRuntimeService().createVariableInstanceQuery().variableName("formio_access_token").singleResult();
        if(accessToken != null) {
            return String.valueOf(accessToken.getValue());
        }
        LOGGER.info("Unable to extract token from variable context. Generating new JWT token.");
        return getAccessToken();
    }


}
