package org.camunda.bpm.extension.commons.connector.support;

import org.apache.commons.lang.StringUtils;
import org.camunda.bpm.extension.commons.ro.req.IRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.util.UriBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.net.URI;
import java.util.Map;
import java.util.Properties;

import static org.springframework.security.oauth2.client.web.reactive.function.client.ServerOAuth2AuthorizedClientExchangeFilterFunction.clientRegistrationId;

@Service("bpmAccessHandler")
public class BPMAccessHandler extends AbstractAccessHandler{

    private Properties properties;

    public BPMAccessHandler(Properties integrationCredentialProperties){
        this.properties = integrationCredentialProperties;
    }

    @Autowired
    private WebClient webClient;

    @Override
    public ResponseEntity<String> exchange(String url, HttpMethod method, Map<String, Object> queryParams, IRequest payload) {

        String host = properties.getProperty("bpm.url");
        ResponseEntity<String> response = webClient
                .method(method)
                .uri(host, builder -> buildQueryParams(builder, url, queryParams))
                .attributes(clientRegistrationId("keycloak-client"))
                .accept(MediaType.APPLICATION_JSON)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .body((payload == null? BodyInserters.empty():BodyInserters.fromValue(payload)))
                .retrieve()
                .onStatus(HttpStatus::is4xxClientError, clientResponse -> Mono.error(new HttpClientErrorException(HttpStatus.BAD_REQUEST)))
                .onStatus(HttpStatus::is5xxServerError, clientResponse -> Mono.error(new HttpClientErrorException(HttpStatus.INTERNAL_SERVER_ERROR)))
                .toEntity(String.class)
                .block();

        return new ResponseEntity<>(response.getBody(), response.getStatusCode());
    }

    private URI buildQueryParams(UriBuilder builder, String url, Map<String, Object> queryParams){

        String host = properties.getProperty("bpm.url");
        builder = builder.path(StringUtils.substringAfter(url, host));
        for(Map.Entry<String, Object> entry : queryParams.entrySet()){
            builder = builder.queryParam(entry.getKey(), entry.getValue());
        }
        return builder.build();
    }
}
