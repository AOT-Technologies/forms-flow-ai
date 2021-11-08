package org.camunda.bpm.extension.keycloak.rest;

import static org.camunda.bpm.engine.test.assertions.bpmn.AbstractAssertions.init;
import static org.junit.Assert.assertTrue;
import static org.junit.jupiter.api.Assertions.assertEquals;

import java.lang.reflect.Field;
import java.util.Properties;

import javax.inject.Inject;

import org.apache.ibatis.logging.LogFactory;
import org.camunda.bpm.engine.IdentityService;
import org.camunda.bpm.engine.ProcessEngine;
import org.camunda.bpm.engine.impl.cfg.ProcessEngineConfigurationImpl;
import org.camunda.bpm.extension.commons.connector.support.FormAccessHandler;
import org.camunda.bpm.extension.keycloak.KeycloakContext;
import org.camunda.bpm.extension.keycloak.KeycloakContextProvider;
import org.camunda.bpm.extension.keycloak.KeycloakIdentityProviderFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.ApplicationContext;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

/**
 * @author Sneha Suresh
 */

@ExtendWith(SpringExtension.class)
public class RestApiSecurityConfigTest {

	@InjectMocks
	private RestApiSecurityConfig restApiSecurityConfig;

	@Mock
	private RestApiSecurityConfigurationProperties configProps;

	@Mock
	private IdentityService identityService;

	@Mock
	private ApplicationContext applicationContext;

	@Mock
	private OAuth2AuthorizedClientService clientService;

	@Mock
	private Properties clientCredentialProperties;

	@Mock
	private HttpSecurity http;

//	@Value("${spring.security.oauth2.client.provider.keycloak.token-uri}")
//	private String accessTokenUri;
//
//	@Value("${spring.security.oauth2.client.registration.keycloak.client-id}")
//	private String clientId;
//
//	@Value("${spring.security.oauth2.client.registration.keycloak.client-secret}")
//	private String clientSecret;

/*	@Test
	public void testExchange() throws Exception {
		applicationContext.getEnvironment().getRequiredProperty(
				"spring.security.oauth2.client.provider." + configProps.getProvider() + ".jwk-set-uri");
		restApiSecurityConfig.configure(http);

	}*/
}