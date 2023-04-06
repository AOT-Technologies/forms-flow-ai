package org.camunda.bpm.extension.commons.connector.support;

import com.google.gson.JsonObject;
import org.apache.commons.lang3.StringUtils;
import org.camunda.bpm.extension.commons.ro.req.IRequest;
import org.camunda.bpm.extension.commons.ro.res.IResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Properties;
import java.util.logging.Logger;

import static org.springframework.security.oauth2.client.web.reactive.function.client.ServerOAuth2AuthorizedClientExchangeFilterFunction.clientRegistrationId;


/**
 * Application Access Handler.
 * This class serves as gateway for custom submission interactions.
 */
@Service("CustomSubmissionAccessHandler")
public class CustomSubmissionAccessHandler extends AbstractAccessHandler {

    private final Logger LOGGER = Logger.getLogger(CustomSubmissionAccessHandler.class.getName());

    @Autowired
    private WebClient webClient;

    @Autowired
    private Properties integrationCredentialProperties;

    /**
     * exchange function using json - string payload / string response
     * @param url
     * @param method
     * @param payload
     * @return
     */
    public ResponseEntity<String> exchange(String url, HttpMethod method, String payload) {

        payload = (payload == null) ? new JsonObject().toString() : payload;

        ResponseEntity<String> response = webClient.method(method).uri(getUrl(url))
                .attributes(clientRegistrationId("keycloak-client"))
                .accept(MediaType.APPLICATION_JSON)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .body(Mono.just(payload), String.class)
                .retrieve()
                .onStatus(HttpStatus::is4xxClientError, clientResponse -> Mono.error(new HttpClientErrorException(HttpStatus.BAD_REQUEST)))
                .toEntity(String.class)
                .block();

        return new ResponseEntity<>(response.getBody(), response.getStatusCode());
    }

    /**
     * exchange function using the custom class
     * @param url
     * @param method
     * @param payload
     * @param responseClazz
     * @return
     */
    public ResponseEntity<IResponse> exchange(String url, HttpMethod method, IRequest payload,
                                                        Class<? extends IResponse> responseClazz) {
        ResponseEntity<? extends IResponse> response = webClient.method(method).uri(getUrl(url))
                .attributes(clientRegistrationId("keycloak-client"))
                .accept(MediaType.APPLICATION_JSON)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .body((payload == null?BodyInserters.empty():BodyInserters.fromValue(payload)))
                .retrieve()
                .onStatus(HttpStatus::is4xxClientError, clientResponse -> Mono.error(new HttpClientErrorException(HttpStatus.BAD_REQUEST)))
                .toEntity(responseClazz)
                .block();
        return new ResponseEntity<>(response.getBody(), response.getStatusCode());
    }

    private String getUrl(String url) {
        if(StringUtils.contains(url,"/form/")) {
            return integrationCredentialProperties.getProperty("forms.custom_submission.url") + "/form/" + StringUtils.substringAfter(url, "/form/");
        }
        return url;
    }
}
