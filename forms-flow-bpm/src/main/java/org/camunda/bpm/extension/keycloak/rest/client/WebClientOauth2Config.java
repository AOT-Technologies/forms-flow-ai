package org.camunda.bpm.extension.keycloak.rest.client;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizedClientRepository;
import org.springframework.security.oauth2.client.web.reactive.function.client.ServletOAuth2AuthorizedClientExchangeFilterFunction;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Properties;


/**
 * Created by shibin.thomas on 21-09-2021.
 */
@Configuration
public class WebClientOauth2Config {

    private static final Logger LOG = LoggerFactory.getLogger(WebClientOauth2Config.class);

    @Autowired
    private Properties integrationCredentialProperties;

    @Bean
    public WebClient unauthenticatedWebClient(){
        return WebClient.builder()
                .exchangeStrategies(ExchangeStrategies.builder()
                        .codecs(configurer -> configurer
                                .defaultCodecs()
                                .maxInMemorySize(Integer.parseInt(integrationCredentialProperties.getProperty("camunda.spring.webclient.maxInMemorySize"))))
                        .build())
                .build();
    }


    @Bean
    WebClient webClient(ClientRegistrationRepository webClientClientRegistrationRepository,
                        OAuth2AuthorizedClientRepository authorizedClients) {
        ServletOAuth2AuthorizedClientExchangeFilterFunction oauth2 =
                new ServletOAuth2AuthorizedClientExchangeFilterFunction(
                        webClientClientRegistrationRepository, authorizedClients);
        oauth2.setDefaultClientRegistrationId ("keycloak-client");
        return WebClient.builder()
                .exchangeStrategies(ExchangeStrategies.builder()
                        .codecs(configurer -> configurer
                                .defaultCodecs()
                                .maxInMemorySize(Integer.parseInt(integrationCredentialProperties.getProperty("camunda.spring.webclient.maxInMemorySize"))))
                        .build())
                .apply(oauth2.oauth2Configuration())
                .build();
    }
}
