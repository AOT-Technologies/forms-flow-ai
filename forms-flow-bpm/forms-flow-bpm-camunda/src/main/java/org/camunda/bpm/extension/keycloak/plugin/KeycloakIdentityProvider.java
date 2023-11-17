package org.camunda.bpm.extension.keycloak.plugin;

import java.util.Collections;
import java.util.List;

import org.camunda.bpm.engine.impl.cfg.ProcessEngineConfigurationImpl;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.stereotype.Component;

/**
 * Keycloak Identity Provider.
 * Class for keycloak identity provider.
 */
@Component
@ConfigurationProperties(prefix = "plugin.identity.keycloak")
public class KeycloakIdentityProvider extends CustomKeycloakIdentityProviderPlugin {

	
}
