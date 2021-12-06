package org.camunda.bpm.extension.keycloak.rest.oauth2client;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
/*import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.security.oauth2.client.OAuth2ClientProperties;*/
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
/*import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.oauth2.client.*;
import org.springframework.security.oauth2.client.registration.*;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizedClientManager;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizedClientRepository;
import org.springframework.security.oauth2.client.web.reactive.function.client.ServerOAuth2AuthorizedClientExchangeFilterFunction;
import org.springframework.security.oauth2.client.web.reactive.function.client.ServletOAuth2AuthorizedClientExchangeFilterFunction;
import org.springframework.security.oauth2.core.AuthorizationGrantType;*/
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

/*    @Bean
    public WebClient authenticatedWebClient(OAuth2AuthorizedClientManager authorizedClientManager) {
        ServletOAuth2AuthorizedClientExchangeFilterFunction oauth2 = new ServletOAuth2AuthorizedClientExchangeFilterFunction(
                authorizedClientManager);
        oauth2.setDefaultClientRegistrationId("keycloak");
        return WebClient.builder()
                .apply(oauth2.oauth2Configuration())
                .build();
    }*/


    @Bean
    public WebClient unAuthenticatedWebClient(){
        return WebClient.builder().exchangeStrategies(ExchangeStrategies.builder()
                .codecs(configurer -> configurer
                        .defaultCodecs()
                        .maxInMemorySize(Integer.parseInt(integrationCredentialProperties.getProperty("camunda.spring.webclient.maxInMemorySize"))))
                .build())
                .build();
    }

/*    @Bean
    @Qualifier("webClientClientRepository")
    public ClientRegistrationRepository webClientClientRepository(){
        ClientRegistration clientRegistration
                = ClientRegistration.withRegistrationId("keycloak")
                .clientId(clientCredentialProperties.getProperty("registration.keycloak.client-id"))
                .clientSecret(clientCredentialProperties.getProperty("registration.keycloak.client-secret"))
                .tokenUri(clientCredentialProperties.getProperty("provider.keycloak.token-uri"))
                .authorizationGrantType(AuthorizationGrantType.CLIENT_CREDENTIALS)
                .build();
        return new InMemoryClientRegistrationRepository(clientRegistration);
    }

    public OAuth2AuthorizedClientRepository oAuth2AuthorizedClientRepository(){

    }*/


/*    @Bean
    public OAuth2AuthorizedClientManager authorizedClientManager(ClientRegistrationRepository clientRegistrationRepository,
                                                          OAuth2AuthorizedClientRepository authorizedClientRepository) {
        OAuth2AuthorizedClientProvider authorizedClientProvider =
                OAuth2AuthorizedClientProviderBuilder.builder()
                        .authorizationCode()
                        .refreshToken()
                        .clientCredentials()
                        .password()
                        .build();
        DefaultOAuth2AuthorizedClientManager authorizedClientManager = new DefaultOAuth2AuthorizedClientManager(
                clientRegistrationRepository, authorizedClientRepository);
        authorizedClientManager.setAuthorizedClientProvider(authorizedClientProvider);

        return authorizedClientManager;
    }*/
}
