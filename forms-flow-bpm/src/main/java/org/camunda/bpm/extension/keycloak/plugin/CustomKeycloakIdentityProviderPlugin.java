package org.camunda.bpm.extension.keycloak.plugin;

import java.util.Collections;
import java.util.List;

import org.camunda.bpm.engine.impl.cfg.ProcessEngineConfigurationImpl;
import org.springframework.http.client.ClientHttpRequestInterceptor;

/**
 * Custom Keycloak Identity Provider Plugin.
 * Custom class for providing Keycloak Identity Provider support
 */
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
	
	/**
	 * Enable multi tenancy for the environment.
	 */
	protected boolean enableMultiTenancy = false;
	
	/**
	 * Admin URL for formsflow admin. Used only when multi tenancy is enabled.
	 */
	private String formsFlowAdminUrl;
	
	
	@Override
	public void preInit(ProcessEngineConfigurationImpl processEngineConfiguration) {
		super.preInit(processEngineConfiguration);
		CustomConfig config = new CustomConfig(webClientId, enableClientAuth, enableMultiTenancy, formsFlowAdminUrl);
		keycloakIdentityProviderFactory = new KeycloakIdentityProviderFactory(this, customHttpRequestInterceptors, config);
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

	public boolean isEnableMultiTenancy() {
		return enableMultiTenancy;
	}

	public void setEnableMultiTenancy(boolean enableMultiTenancy) {
		this.enableMultiTenancy = enableMultiTenancy;
	}

	public String getFormsFlowAdminUrl() {
		return formsFlowAdminUrl;
	}

	public void setFormsFlowAdminUrl(String formsFlowAdminUrl) {
		this.formsFlowAdminUrl = formsFlowAdminUrl;
	}
}
