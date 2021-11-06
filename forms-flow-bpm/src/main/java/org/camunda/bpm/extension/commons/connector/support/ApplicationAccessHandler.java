package org.camunda.bpm.extension.commons.connector.support;

import com.google.gson.JsonObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.oauth2.client.*;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;


/**
 * This class serves as gateway for all application service interactions.
 *
 * @author sumathi.thirumani@aot-technologies.com
 */
@Service("applicationAccessHandler")
public class ApplicationAccessHandler implements IAccessHandler {

    private final Logger LOGGER = LoggerFactory.getLogger(ApplicationAccessHandler.class);

    @Autowired
    private WebClient unAuthenticatedWebClient;

    @Autowired
    private OAuth2RestTemplate oAuth2RestTemplate;

    public ResponseEntity<String> exchange(String url, HttpMethod method, String payload) {

        payload = (payload == null) ? new JsonObject().toString() : payload;

        Mono<ResponseEntity<String>> entityMono = unAuthenticatedWebClient.method(method).uri(url)
                .accept(MediaType.APPLICATION_JSON)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .headers(httpHeaders -> httpHeaders.setBearerAuth(oAuth2RestTemplate.getAccessToken().getValue()))
                .body(Mono.just(payload), String.class)
                .retrieve()
                .toEntity(String.class);

        ResponseEntity<String> response = entityMono.block();
        return new ResponseEntity<>(response.getBody(), response.getStatusCode());
    }

}
