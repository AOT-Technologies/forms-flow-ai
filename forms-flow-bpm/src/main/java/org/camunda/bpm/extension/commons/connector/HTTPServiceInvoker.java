package org.camunda.bpm.extension.commons.connector;


import org.apache.commons.lang3.StringUtils;
import org.codehaus.jackson.map.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Properties;
import java.util.logging.Logger;

/**
 * This class prepares the payloac and invokes respective access handler based on the service ID.
 *
 * @author  sumathi.thirumani@aot-technologies.com
 */
@Component("httpServiceInvoker")
public class HTTPServiceInvoker {

    private final Logger LOGGER = Logger.getLogger(HTTPServiceInvoker.class.getName());

    @Autowired
    private AccessHandlerFactory accessHandlerFactory;

    @Autowired
    private Properties integrationCredentialProperties;

    public ResponseEntity<String> execute(String url, HttpMethod method, Object payload) {
        try {
            String dataJson = payload != null ? new ObjectMapper().writeValueAsString(payload) : null;
            return accessHandlerFactory.getService(getServiceId(url)).exchange(url, method, dataJson);
        } catch (IOException e) {
            e.printStackTrace();
        }
        return null;
    }

    private String getServiceId(String url) {
        if(StringUtils.contains(url,"/api/")) {
            return "applicationAccessHandler";
        }
        return "formAccessHandler";
    }

    public Properties getProperties() {
        return integrationCredentialProperties;
    }

}