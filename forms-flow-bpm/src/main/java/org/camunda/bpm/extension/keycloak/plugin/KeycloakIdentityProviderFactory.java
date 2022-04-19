/**
 * 
 */
package org.camunda.bpm.extension.keycloak.plugin;

import java.util.List;

import org.camunda.bpm.engine.impl.interceptor.Session;
import org.camunda.bpm.extension.keycloak.KeycloakConfiguration;
//import org.camunda.bpm.extension.keycloak.KeycloakConfiguration;
import org.springframework.http.client.ClientHttpRequestInterceptor;

/**
 * @author aot
 *
 */
public class KeycloakIdentityProviderFactory
		extends org.camunda.bpm.extension.keycloak.KeycloakIdentityProviderFactory {

	private String webClientId;

	private boolean enableClientAuth = false;

	
	public KeycloakIdentityProviderFactory(KeycloakConfiguration keycloakConfiguration,
			List<ClientHttpRequestInterceptor> customHttpRequestInterceptors, String webClientId, boolean enableClientAuth) {
		super(keycloakConfiguration, customHttpRequestInterceptors);
		this.webClientId = webClientId;
		this.enableClientAuth = enableClientAuth;
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	public Session openSession() {
		return new KeycloakIdentityProviderSession(keycloakConfiguration, restTemplate, keycloakContextProvider,
				userQueryCache, groupQueryCache, this.webClientId, this.enableClientAuth);
	}
}
