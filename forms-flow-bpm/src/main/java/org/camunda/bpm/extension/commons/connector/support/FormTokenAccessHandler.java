package org.camunda.bpm.extension.commons.connector.support;

import org.camunda.bpm.extension.hooks.exceptions.FormioServiceException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.Map;
import java.util.Properties;


/**
 * This class abstracts  formio token generation logic with the intent to cached & refreshed accordingly.
 * @author sumathi.thirumani@aot-technologies.com
 * @author shibin.thoma@aot-technologies.com
 */
@Service("formTokenAccessHandler")
public class FormTokenAccessHandler {

    private final Logger LOGGER = LoggerFactory.getLogger(FormTokenAccessHandler.class);

    @Autowired
    private Properties integrationCredentialProperties;

    @Autowired
    private WebClient unAuthenticatedWebClient;

    public String getAccessToken(){
        Map<String,String> paramMap = new HashMap<>();
        paramMap.put("email",getIntegrationCredentialProperties().getProperty("formio.security.username"));
        paramMap.put("password",getIntegrationCredentialProperties().getProperty("formio.security.password"));
        HashMap<String, Map> dataMap = new HashMap<>();
        dataMap.put("data", paramMap);

        String token = unAuthenticatedWebClient.post().uri(getIntegrationCredentialProperties().getProperty("formio.security.accessTokenUri"))
                .bodyValue(dataMap)
                .accept(MediaType.APPLICATION_JSON)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .exchangeToMono(data -> {
                    if(data.statusCode().is2xxSuccessful()){
                        return Mono.just(data.headers().header("x-jwt-token").get(0));
                    } else{
                        throw new FormioServiceException("Exception occurred in getting x-jwt-token"+  ". Message Body: " +
                                data.bodyToMono(String.class).block());
                    }
                })
                .log()
                .block();

        LOGGER.debug("Fetched the x-jwt-token = "+token);

        return token;
    }

    protected Properties getIntegrationCredentialProperties() {
        return integrationCredentialProperties;
    }


}
