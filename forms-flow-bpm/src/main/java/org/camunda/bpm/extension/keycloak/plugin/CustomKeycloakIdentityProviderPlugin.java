package org.camunda.bpm.extension.keycloak.plugin;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.camunda.bpm.engine.impl.cfg.ProcessEngineConfigurationImpl;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.util.StringUtils;

public class CustomKeycloakIdentityProviderPlugin extends KeycloakIdentityProviderPlugin {
	
	/** custom interceptors to modify behaviour of default KeycloakRestTemplate */
	private List<ClientHttpRequestInterceptor> customHttpRequestInterceptors = Collections.emptyList();
	
	private KeycloakIdentityProviderFactory keycloakIdentityProviderFactory = null;
	
	/**
	 * Web application client ID
	 */
	protected String webClientId;

	/**
	 * Enable client based auth.
	 */
	protected boolean enableClientAuth = false;
	
	@Override
	public void preInit(ProcessEngineConfigurationImpl processEngineConfiguration) {
		super.preInit(processEngineConfiguration);
		keycloakIdentityProviderFactory = new KeycloakIdentityProviderFactory(this, customHttpRequestInterceptors, this.webClientId, this.enableClientAuth);
		processEngineConfiguration.setIdentityProviderSessionFactory(keycloakIdentityProviderFactory);
	}
	
	/**
	 * immediately clear entries from cache
	 */
	@Override
	public void clearCache() {
		super.clearCache();
		this.keycloakIdentityProviderFactory.clearCache();
	}

	
	public String getWebClientId() {
		return webClientId;
	}

	public void setWebClientId(String webClientId) {
		this.webClientId = webClientId;
	}

	public boolean isEnableClientAuth() {
		return enableClientAuth;
	}

	public void setEnableClientAuth(boolean enableClientAuth) {
		this.enableClientAuth = enableClientAuth;
	}
}
