package org.camunda.bpm.extension.commons.connector.support;


import org.apache.commons.lang3.StringUtils;
import org.codehaus.jackson.map.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * This component serves for interaction with Formio services.
 *
 * @author sumathi.thirumani@aot-technologies.com
 */
@Service("formAccessHandler")
public class FormAccessHandler implements IAccessHandler {

    private final Logger LOGGER = Logger.getLogger(FormAccessHandler.class.getName());

    @Autowired
    private Properties integrationCredentialProperties;


    public ResponseEntity<String> exchange(String url, HttpMethod method, String payload) {
        String accessToken = getAccessToken();
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

    private RestTemplate getRestTemplate() {
        return new RestTemplate();
    }

    private String getAccessToken(){
        Map<String,String> paramMap = new HashMap<>();
        paramMap.put("email",integrationCredentialProperties.getProperty("formio.security.username"));
        paramMap.put("password",integrationCredentialProperties.getProperty("formio.security.password"));
        HashMap<String, Map> dataMap = new HashMap<>();
        dataMap.put("data", paramMap);
        try {
            //HTTP Headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> reqObj =
                    new HttpEntity<String>(new ObjectMapper().writeValueAsString(dataMap), headers);
            ResponseEntity<String> response = getRestTemplate().exchange(integrationCredentialProperties.getProperty("formio.security.accessTokenUri"), HttpMethod.POST, reqObj, String.class);
            return response.getHeaders().get("x-jwt-token").get(0);
        } catch (IOException e) {
            LOGGER.log(Level.SEVERE,"Exception occured in getting x-jwt-token", e);
        }
            return null;
    }

    private String getDecoratedServerUrl(String url) {
        return integrationCredentialProperties.getProperty("formio.url")+"/form/"+StringUtils.substringAfter(url,"/form/");
    }

}
