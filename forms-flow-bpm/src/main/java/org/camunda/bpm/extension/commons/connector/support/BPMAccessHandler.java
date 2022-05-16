package org.camunda.bpm.extension.commons.connector.support;

import org.springframework.stereotype.Service;
import org.springframework.web.util.UriBuilder;
import org.camunda.bpm.extension.commons.ro.req.IRequest;
import org.camunda.bpm.extension.commons.ro.res.IResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.net.URI;
import java.util.Map;

import static org.springframework.security.oauth2.client.web.reactive.function.client.ServerOAuth2AuthorizedClientExchangeFilterFunction.clientRegistrationId;

@Service("bpmAccessHandler")
public class BPMAccessHandler extends AbstractAccessHandler{

    @Autowired
    private WebClient webClient;

    @Override
    public ResponseEntity<String> exchange(String url, HttpMethod method, Map<String, Object> queryParams) {

        ResponseEntity<String> response = webClient.method(method).uri(builder -> buildQueryParams(builder, url, queryParams))
                .attributes(clientRegistrationId("keycloak-client"))
                .accept(MediaType.APPLICATION_JSON)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .retrieve()
                .onStatus(HttpStatus::is4xxClientError, clientResponse -> Mono.error(new HttpClientErrorException(HttpStatus.BAD_REQUEST)))
                .toEntity(String.class)
                .block();

        return new ResponseEntity<>(response.getBody(), response.getStatusCode());
    }

    private URI buildQueryParams(UriBuilder builder, String url, Map<String, Object> queryParams){

        builder = builder.path(url);

        for(Map.Entry<String, Object> entry : queryParams.entrySet()){
            builder = builder.queryParam(entry.getKey(), entry.getValue());
        }
        return builder.build();
    }
}
