package org.camunda.bpm.extension.commons.connector.support;

import org.apache.commons.lang.StringUtils;
import org.camunda.bpm.extension.commons.ro.req.IRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.util.UriBuilder;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.net.URI;
import java.util.Map;
import java.util.Properties;

@Service("bpmAccessHandler")
public class BPMAccessHandler extends AbstractAccessHandler{

    private final Properties properties;
    private final WebClient webClient;

    public BPMAccessHandler(Properties integrationCredentialProperties, WebClient unauthenticatedWebClient){
        this.properties = integrationCredentialProperties;
        this.webClient = unauthenticatedWebClient;
    }


    @Override
    public ResponseEntity<String> exchange(String url, HttpMethod method, Map<String, Object> queryParams, IRequest payload) {

        String host = properties.getProperty("bpm.url");


        ResponseEntity<String> response = webClient
                .method(method)
                .uri(host, builder -> buildQueryParams(builder, url, queryParams))
                .headers(h -> h.setBearerAuth(getUserBasedAccessToken()))
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
