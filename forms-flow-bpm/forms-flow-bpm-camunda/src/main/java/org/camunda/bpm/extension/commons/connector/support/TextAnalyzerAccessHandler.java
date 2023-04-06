package org.camunda.bpm.extension.commons.connector.support;

import com.google.gson.JsonObject;
import org.camunda.bpm.extension.commons.ro.req.IRequest;
import org.camunda.bpm.extension.commons.ro.res.IResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;

import static org.springframework.security.oauth2.client.web.reactive.function.client.ServerOAuth2AuthorizedClientExchangeFilterFunction.clientRegistrationId;

/**
 * Text Analyzer Access Handler.
 * This class serves as gateway for all text analyzer service interactions.
 */


@Service("textAnalyzerAccessHandler")
public class TextAnalyzerAccessHandler extends AbstractAccessHandler{

    private final Logger LOGGER = LoggerFactory.getLogger(TextAnalyzerAccessHandler.class);

    @Autowired
    private WebClient webClient;

    @Override
    public ResponseEntity<String> exchange(String url, HttpMethod method, String payload) {

        payload = (payload == null) ? new JsonObject().toString() : payload;

        Mono<ResponseEntity<String>> entityMono = webClient.method(method).uri(url)
                .attributes(clientRegistrationId("keycloak-client"))
                .accept(MediaType.APPLICATION_JSON)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .body(Mono.just(payload), String.class)
                .retrieve()
                .toEntity(String.class);

        ResponseEntity<String> response = entityMono.block();
        return new ResponseEntity<>(response.getBody(), response.getStatusCode());
    }

    @Override
    public ResponseEntity<IResponse> exchange(String url, HttpMethod method, IRequest payload, Class<? extends IResponse> responseClazz) {

        ResponseEntity<? extends IResponse> response = webClient.method(method).uri(url)
                .attributes(clientRegistrationId("keycloak-client"))
                .accept(MediaType.APPLICATION_JSON)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .body((payload == null? BodyInserters.empty():BodyInserters.fromValue(payload)))
                .retrieve()
                .onStatus(HttpStatus::is4xxClientError, clientResponse -> Mono.error(new HttpClientErrorException(HttpStatus.BAD_REQUEST)))
                .toEntity(responseClazz)
                .block();
        return new ResponseEntity<>(response.getBody(), response.getStatusCode());
    }

}
