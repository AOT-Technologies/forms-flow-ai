package org.camunda.bpm.extension;

import static org.junit.jupiter.api.Assertions.assertNotNull;

import org.camunda.bpm.engine.IdentityService;
import org.camunda.bpm.extension.keycloak.rest.RestApiSecurityConfigurationProperties;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.oauth2.client.reactive.ReactiveOAuth2ClientAutoConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
public class CamundaApplicationTest {

/*	@Test
	public void contextLoads() {
	}*/
}
