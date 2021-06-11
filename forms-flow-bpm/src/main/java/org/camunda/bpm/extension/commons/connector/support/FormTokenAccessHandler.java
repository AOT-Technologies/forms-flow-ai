package org.camunda.bpm.extension.commons.connector.support;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * This class abstracts  formio token generation logic with the intent to cached & refreshed accordingly.
 * @author sumathi.thirumani@aot-technologies.com
 */
@Service("formTokenAccessHandler")
public class FormTokenAccessHandler {

    private final Logger LOGGER = Logger.getLogger(FormTokenAccessHandler.class.getName());

    @Autowired
    private Properties integrationCredentialProperties;

    protected RestTemplate getRestTemplate() {
        return new RestTemplate();
    }

    public String getAccessToken(){
        Map<String,String> paramMap = new HashMap<>();
        paramMap.put("email",getIntegrationCredentialProperties().getProperty("formio.security.username"));
        paramMap.put("password",getIntegrationCredentialProperties().getProperty("formio.security.password"));
        HashMap<String, Map> dataMap = new HashMap<>();
        dataMap.put("data", paramMap);
        try {
            //HTTP Headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> reqObj =
                    new HttpEntity<String>(new ObjectMapper().writeValueAsString(dataMap), headers);
            ResponseEntity<String> response = getRestTemplate().exchange(getIntegrationCredentialProperties().getProperty("formio.security.accessTokenUri"), HttpMethod.POST, reqObj, String.class);
            return response.getHeaders().get("x-jwt-token").get(0);
        } catch (IOException e) {
            LOGGER.log(Level.SEVERE,"Exception occurred in getting x-jwt-token", e);
        }
        return null;
    }

    protected Properties getIntegrationCredentialProperties() {
        return integrationCredentialProperties;
    }


}
