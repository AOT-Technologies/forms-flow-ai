package org.camunda.bpm.extension.commons.connector.support;

import com.google.gson.JsonObject;
import org.apache.commons.lang3.StringUtils;
import org.camunda.bpm.extension.commons.connector.FormioTokenServiceProvider;
import org.camunda.bpm.extension.hooks.exceptions.FormioServiceException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DataBufferUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.util.Properties;


/**
 * Form Access Handler.
 * This class serves as gateway for all formio interactions.
 */
@Service("formAccessHandler")
public class FormAccessHandler extends AbstractAccessHandler implements IAccessHandler {

    private final Logger logger = LoggerFactory.getLogger(FormAccessHandler.class.getName());

    static final int TOKEN_EXPIRY_CODE = 404;

    @Autowired
    private Properties integrationCredentialProperties;
    @Autowired
    private WebClient unauthenticatedWebClient;
    @Autowired
    private FormioTokenServiceProvider formioTokenServiceProvider;

    public ResponseEntity<String> exchange(String url, HttpMethod method, String payload) {
        String accessToken = formioTokenServiceProvider.getAccessToken();
        if(StringUtils.isBlank(accessToken)) {
            logger.info("Access token is blank. Cannot invoke service:{}", url);
            return null;
        }
        ResponseEntity<String> response = exchange(url,method,payload,accessToken);
        if(response.getStatusCodeValue() == TOKEN_EXPIRY_CODE) {
            exchange(url,method,payload, formioTokenServiceProvider.getAccessToken());
        }
        logger.info("Response code for service invocation: {}" , response.getStatusCode());
        return response;
    }

    public ResponseEntity<String> exchange(String url, HttpMethod method, String payload, String accessToken) {

        payload = (payload == null) ? new JsonObject().toString() : payload;

        if(HttpMethod.PATCH.name().equals(method.name())) {
            logger.info("payload="+payload);
            Mono<ResponseEntity<String>> entityMono = unauthenticatedWebClient.patch()
                    .uri(url)
                    .bodyValue(payload)
                    .header("x-jwt-token", accessToken)
                    .accept(MediaType.APPLICATION_JSON)
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .exchangeToMono(response -> {
                        if (response.statusCode().is4xxClientError()) {
                            return response.bodyToMono(String.class)
                                    .flatMap(errorBody -> Mono.error(new FormioServiceException(errorBody)));
                        } else {
                            Flux<DataBuffer> body = response.bodyToFlux(DataBuffer.class);
                            return DataBufferUtils.join(body)
                                    .map(dataBuffer -> {
                                        byte[] bytes = new byte[dataBuffer.readableByteCount()];
                                        dataBuffer.read(bytes);
                                        DataBufferUtils.release(dataBuffer); // Release the buffer to avoid memory leaks
                                        String responseBody = new String(bytes, StandardCharsets.UTF_8);
                                        HttpStatus httpStatus = response.statusCode();
                                        return ResponseEntity.status(httpStatus).body(responseBody);
                                    });
                        }
                    });
            ResponseEntity<String> response = entityMono.block();
            if(response !=null && "Token Expired".equalsIgnoreCase(response.getBody())) {
                return new ResponseEntity<>(response.getBody(), HttpStatus.valueOf(TOKEN_EXPIRY_CODE));
            }
            return response;
        } else {
            Mono<ResponseEntity<String>> entityMono =  unauthenticatedWebClient.method(method)
                    .uri(url)
                    .accept(MediaType.APPLICATION_JSON)
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .header("x-jwt-token", accessToken)
                    .body(Mono.just(payload), String.class)
                    .exchangeToMono(response -> {
                        if (response.statusCode().is4xxClientError()) {
                            return response.bodyToMono(String.class)
                                    .flatMap(errorBody -> Mono.error(new FormioServiceException(errorBody)));
                        } else {
                            Flux<DataBuffer> body = response.bodyToFlux(DataBuffer.class);
                            return DataBufferUtils.join(body)
                                    .map(dataBuffer -> {
                                        byte[] bytes = new byte[dataBuffer.readableByteCount()];
                                        dataBuffer.read(bytes);
                                        DataBufferUtils.release(dataBuffer); // Release the buffer to avoid memory leaks
                                        String responseBody = new String(bytes, StandardCharsets.UTF_8);
                                        HttpStatus httpStatus = response.statusCode();
                                        return ResponseEntity.status(httpStatus).body(responseBody);
                                    });
                        }
                    });
            ResponseEntity<String> response = entityMono.block();
            return response;
        }
    }
}
