package org.camunda.bpm.extension.commons.connector.support;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.http.*;
import org.springframework.security.oauth2.client.OAuth2RestTemplate;
import org.springframework.security.oauth2.client.token.grant.client.ClientCredentialsResourceDetails;
import org.springframework.stereotype.Service;

import java.util.Properties;
import java.util.logging.Logger;

/**
 * This class serves as gateway for all application service interactions.
 *
 * @author sumathi.thirumani@aot-technologies.com
 */
@Service("applicationAccessHandler")
public class ApplicationAccessHandler implements IAccessHandler {

    private final Logger LOGGER = Logger.getLogger(ApplicationAccessHandler.class.getName());

    @Autowired
    private Properties clientCredentialProperties;

    @Autowired
    private OAuth2RestTemplate oAuth2RestTemplate;

    public ResponseEntity<String> exchange(String url, HttpMethod method, String payload) {
        //HTTP Headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + oAuth2RestTemplate.getAccessToken().getValue());
        HttpEntity<String> reqObj =
                new HttpEntity<String>(payload, headers);

        ResponseEntity<String> wrsp = getOAuth2RestTemplate().exchange(url, method, reqObj, String.class);
        LOGGER.info("Response code for service invocation: " + wrsp.getStatusCode());
        return wrsp;
    }


    @Bean
    public OAuth2RestTemplate getOAuth2RestTemplate() {
        ClientCredentialsResourceDetails resourceDetails = new ClientCredentialsResourceDetails ();
        resourceDetails.setClientId(clientCredentialProperties.getProperty("client-id"));
        resourceDetails.setClientSecret(clientCredentialProperties.getProperty("client-secret"));
        resourceDetails.setAccessTokenUri(clientCredentialProperties.getProperty("accessTokenUri"));
        resourceDetails.setGrantType("client_credentials");
        return new OAuth2RestTemplate(resourceDetails);
    }
}
