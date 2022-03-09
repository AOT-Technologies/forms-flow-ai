package org.camunda.bpm.extension.commons.connector.support;

import com.google.gson.JsonObject;
import org.apache.commons.lang3.StringUtils;
import org.camunda.bpm.extension.hooks.exceptions.FormioServiceException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;


/**
 * This class serves as gateway for all formio interactions.
 *
 * @author sumathi.thirumani@aot-technologies.com
 */
@Service("formAccessHandler")
public class FormAccessHandler extends FormTokenAccessHandler implements IAccessHandler {

    private final Logger logger = LoggerFactory.getLogger(FormAccessHandler.class.getName());

    static final int TOKEN_EXPIRY_CODE = 404;

    public ResponseEntity<String> exchange(String url, HttpMethod method, String payload) {
        String accessToken = super.getAccessToken();
        if(StringUtils.isBlank(accessToken)) {
            logger.info("Access token is blank. Cannot invoke service:{}", url);
            return null;
        }
        ResponseEntity<String> response = exchange(url,method,payload,accessToken);
        if(response.getStatusCodeValue() == TOKEN_EXPIRY_CODE) {
            exchange(url,method,payload,getAccessToken());
        }
        logger.info("Response code for service invocation: {}" , response.getStatusCode());
        return response;
    }

    public ResponseEntity<String> exchange(String url, HttpMethod method, String payload, String accessToken) {

        payload = (payload == null) ? new JsonObject().toString() : payload;

        if(HttpMethod.PATCH.name().equals(method.name())) {
            logger.info("payload="+payload);
            Mono<ResponseEntity<String>> entityMono = unauthenticatedWebClient.patch()
                    .uri(getDecoratedServerUrl(url))
                    .bodyValue(payload)
                    .header("x-jwt-token", accessToken)
                    .accept(MediaType.APPLICATION_JSON)
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .retrieve()
                    .onStatus(HttpStatus::is4xxClientError,
                            response -> Mono.error(new FormioServiceException(response.toString())))
                    .toEntity(String.class);

            ResponseEntity<String> response = entityMono.block();
            if(response !=null && "Token Expired".equalsIgnoreCase(response.getBody())) {
                return new ResponseEntity<>(response.getBody(), HttpStatus.valueOf(TOKEN_EXPIRY_CODE));
            }
            return response;
        } else {
            return unauthenticatedWebClient.method(method)
                    .uri(getDecoratedServerUrl(url))
                    .accept(MediaType.APPLICATION_JSON)
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .header("x-jwt-token", accessToken)
                    .body(Mono.just(payload), String.class)
                    .retrieve()
                    .onStatus(HttpStatus::is4xxClientError,
                            response -> Mono.error(new FormioServiceException(response.toString())))
                    .toEntity(String.class)
                    .block();
        }
    }

    private String getDecoratedServerUrl(String url) {
        if(StringUtils.contains(url,"/form/")) {
            return getIntegrationCredentialProperties().getProperty("formio.url") + "/form/" + StringUtils.substringAfter(url, "/form/");
        }
        return getIntegrationCredentialProperties().getProperty("formio.url") +"/"+ StringUtils.substringAfterLast(url, "/");
    }
}
