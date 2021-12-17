package org.camunda.bpm.extension.keycloak.rest.client;

import io.netty.channel.ChannelOption;
import io.netty.handler.timeout.ReadTimeoutHandler;
import io.netty.handler.timeout.WriteTimeoutHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ClientHttpConnector;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizedClientRepository;
import org.springframework.security.oauth2.client.web.reactive.function.client.ServletOAuth2AuthorizedClientExchangeFilterFunction;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;

import java.time.Duration;
import java.util.Properties;
import java.util.concurrent.TimeUnit;


/**
 * Created by shibin.thomas on 21-09-2021.
 */
@Configuration
public class WebClientOauth2Config {

    private static final Logger LOG = LoggerFactory.getLogger(WebClientOauth2Config.class);

    @Autowired
    private Properties integrationCredentialProperties;

    public ClientHttpConnector clientHttpConnector(){

        int connectionTimeout = Integer.parseInt(integrationCredentialProperties.getProperty("camunda.spring.webclient.connectionTimeout"));

        HttpClient httpClient = HttpClient.create()
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, connectionTimeout)
                .responseTimeout(Duration.ofMillis(connectionTimeout))
                .doOnConnected(conn ->
                        conn.addHandlerLast(new ReadTimeoutHandler(connectionTimeout, TimeUnit.MILLISECONDS))
                                .addHandlerLast(new WriteTimeoutHandler(connectionTimeout, TimeUnit.MILLISECONDS)));
        return new ReactorClientHttpConnector(httpClient);
    }

    @Bean
    public WebClient unauthenticatedWebClient(){
        return WebClient.builder()
                .exchangeStrategies(ExchangeStrategies.builder()
                        .codecs(configurer -> configurer
                                .defaultCodecs()
                                .maxInMemorySize(Integer.parseInt(integrationCredentialProperties.getProperty("camunda.spring.webclient.maxInMemorySize"))))
                        .build())
                .clientConnector(clientHttpConnector())
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
                .clientConnector(clientHttpConnector())
                .build();
    }
}
