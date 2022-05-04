package org.camunda.bpm.extension.commons.connector.support;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.camunda.bpm.extension.commons.connector.auth.FormioConfiguration;
import org.camunda.bpm.extension.commons.connector.auth.FormioContextProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import javax.annotation.PostConstruct;
import javax.annotation.Resource;
import java.util.Properties;


/**
 * Form Token Access Handler.
 * This class abstracts  formio token generation logic with the intent to cached & refreshed accordingly.
 */
@Service("formTokenAccessHandler")
public class FormTokenAccessHandler {

    private final Logger LOGGER = LoggerFactory.getLogger(FormTokenAccessHandler.class);

    @Autowired
    private Properties integrationCredentialProperties;
    @Resource(name = "bpmObjectMapper")
    private ObjectMapper bpmObjectMapper;
    @Autowired
    protected WebClient unauthenticatedWebClient;

    private static FormioContextProvider formioContextProvider;

    @PostConstruct
    public void init(){
        if(formioContextProvider == null) {
            String email = integrationCredentialProperties.getProperty("formio.security.username");
            String password = integrationCredentialProperties.getProperty("formio.security.password");
            String accessTokenUri = integrationCredentialProperties.getProperty("formio.security.accessTokenUri");
            FormioConfiguration formioConfiguration = new FormioConfiguration(email, password, accessTokenUri);
            formioContextProvider = new FormioContextProvider(formioConfiguration, unauthenticatedWebClient, bpmObjectMapper);
        }
    }

    public String getAccessToken(){
        LOGGER.info("Getting access token from the formio context");
        return formioContextProvider.createFormioRequestAccessToken();
    }

    protected Properties getIntegrationCredentialProperties() {
        return integrationCredentialProperties;
    }
}

