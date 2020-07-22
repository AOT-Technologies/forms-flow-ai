package org.camunda.bpm.extension.hooks.services.connector;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.oauth2.client.OAuth2RestTemplate;
import org.springframework.security.oauth2.client.token.grant.client.ClientCredentialsResourceDetails;
import org.springframework.stereotype.Component;

import java.util.Properties;
import java.util.logging.Logger;

/**
 * Custom HTTP Service Connector component to support both sync and async operations
 * NOTE: Async & Retry operations are deferred in this release 2.0.
 *
 * @author  sumathi.thirumani@aot-technologies.com
 *
 *
 */
@Component("httpServiceInvoker")
public class HTTPServiceInvoker {

    private final Logger LOGGER = Logger.getLogger(HTTPServiceInvoker.class.getName());

    @Autowired
    private Properties clientCredentialProperties;

    public void execute(String url, HttpMethod method, String payload, Boolean isAsync) {
        switch(method) {
            case POST:
                exchange(url, HttpMethod.POST, payload);
                break;
            case PUT:
                exchange(url, HttpMethod.PUT, payload);
                break;
            case GET:
                exchange(url, HttpMethod.GET);
                break;
            default:
                LOGGER.info("Unsupported HTTP operation");
        }
    }

    private ResponseEntity<String> exchange(String url, HttpMethod method, String payload) {
        //HTTP Headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + getOAuth2RestTemplate().getAccessToken());
        HttpEntity<String> reqObj =
                new HttpEntity<String>(payload, headers);

        ResponseEntity<String> wrsp = getOAuth2RestTemplate().exchange(url, method, reqObj, String.class);
        LOGGER.info("Response code for service invocation: " + wrsp.getStatusCode());
        return wrsp;
    }

    private ResponseEntity<String> exchange(String url, HttpMethod method) {
        //HTTP Headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + getOAuth2RestTemplate().getAccessToken());
        HttpEntity<String> reqObj =
                new HttpEntity<String>(headers);

        ResponseEntity<String> wrsp = getOAuth2RestTemplate().exchange(url, method, reqObj, String.class);
        LOGGER.info("Response code for service invocation: " + wrsp.getStatusCode());
        return wrsp;
    }

    private OAuth2RestTemplate getOAuth2RestTemplate() {
        ClientCredentialsResourceDetails resourceDetails = new ClientCredentialsResourceDetails ();
        resourceDetails.setClientId(clientCredentialProperties.getProperty("client-id"));
        resourceDetails.setClientSecret(clientCredentialProperties.getProperty("client-secret"));
        resourceDetails.setAccessTokenUri(clientCredentialProperties.getProperty("accessTokenUri"));
        resourceDetails.setGrantType("client_credentials");
        return new OAuth2RestTemplate(resourceDetails);
    }

}