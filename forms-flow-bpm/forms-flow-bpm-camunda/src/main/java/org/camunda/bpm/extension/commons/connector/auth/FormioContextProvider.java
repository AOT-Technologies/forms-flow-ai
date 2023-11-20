package org.camunda.bpm.extension.commons.connector.auth;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.camunda.bpm.extension.commons.exceptions.FormioIdentityException;
import org.camunda.bpm.extension.hooks.exceptions.FormioServiceException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.*;


/**
 * Formio Context Provider.
 * Manages access tokens for then Formio REST API.
 */
public class FormioContextProvider {

    private static final Logger LOG = LoggerFactory.getLogger(FormioContextProvider.class);

    private ObjectMapper bpmObjectMapper;

    private FormioContext context;

    private final WebClient webClient;

    private final FormioConfiguration formioConfiguration;

    /**
     * Creates a new Formio context provider
     * @param formioConfiguration the Formio configuration
     * @param webClient REST template
     */
    public FormioContextProvider(FormioConfiguration formioConfiguration, WebClient webClient,ObjectMapper objectMapper) {
        this.formioConfiguration = formioConfiguration;
        this.webClient = webClient;
        this.bpmObjectMapper = objectMapper;
    }

    /**
     * Requests an access token for the configured Keycloak client.
     * @return new Keycloak context holding the access token
     */
    private synchronized FormioContext openAuthorizationContext() {

        if(context != null && !context.needsRefresh()) return context;

        Map<String,String> paramMap = new HashMap<>();
        paramMap.put("email", formioConfiguration.getUserName());
        paramMap.put("password", formioConfiguration.getPassword());
        Map<String, Map<String,String>> dataMap = new HashMap<>();
        dataMap.put("data", paramMap);

        try{
            String token = webClient.post().uri(formioConfiguration.getAccessTokenUri())
                    .bodyValue(dataMap)
                    .accept(MediaType.APPLICATION_JSON)
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .exchangeToMono(data -> {
                        if(data.statusCode().is2xxSuccessful()){
                            return Mono.just(data.headers().header("x-jwt-token").get(0));
                        } else{
                            return Mono.error(new FormioServiceException("Exception occurred in getting x-jwt-token"+  ". Message Body: " +
                                    data));
                        }
                    })
                    .block();

            if(token == null) throw new FormioIdentityException("Access token is null");
            long expiresAt = decodeExpiresAt(token);
            return new FormioContext(token, expiresAt);
        } catch (Exception rce) {
            LOG.error(rce.getMessage());
            throw new FormioIdentityException("Unable to get access token from formio server", rce);
        }
    }


    /**
     * Creates a valid request entity for the Keycloak management API.
     * @return request entity with  access token set
     */
    public String createFormioRequestAccessToken() {
        if (context == null) {
            LOG.info("context is null, creating new");
            context = openAuthorizationContext();
        } else if (context.needsRefresh()) {
            try {
                LOG.info("Token Need refresh");
                context = openAuthorizationContext();
            } catch (FormioIdentityException ipe) {
                LOG.info("Token refresh failed");
                context = openAuthorizationContext();
            }
        }
        return context.getAccessToken();
    }


    /**
     * Invalidates the current authorization context forcing to request a new token.
     */
    public void invalidateToken() { context = null;
    }

    private long decodeExpiresAt(String token) throws  FormioIdentityException{
        try {
            String[] chunks = token.split("\\.");
            Base64.Decoder decoder = Base64.getUrlDecoder();
            String data = new String(decoder.decode(chunks[1]));
            JsonNode dataNode = bpmObjectMapper.readTree(data);
            long exp = dataNode.get("exp").asLong();
            long iat = dataNode.get("iat").asLong();
            return (exp - iat) * 1000;
        } catch (JsonProcessingException | NullPointerException exc){
            throw new FormioIdentityException("Unable to parse access token from formio server", exc);
        }
    }
}
