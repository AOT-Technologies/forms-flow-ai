package org.camunda.bpm.extension.keycloak.plugin;

/**
 * Custom Config.
 * Class for holding and transferring keycloak identity provider plugin data.
 */
public class CustomConfig {
	
	
	private String webClientId;

	private boolean enableClientAuth = false;

	private boolean enableMultiTenancy = false;

	private String formsFlowAdminUrl;
	
	private String cssApiUrl;
	
	private boolean sharedRealmEnabled;
		
	private String cssApiClient;
	
	private String cssApiSecret;
	
	private String cssApiLogin;

	

	public CustomConfig(String webClientId, boolean enableClientAuth, boolean enableMultiTenancy,
			String formsFlowAdminUrl, boolean sharedRealmEnabled, String cssApiUrl, String cssApiClient, String cssApiSecret, String cssApiLogin) {
		super();
		this.webClientId = webClientId;
		this.enableClientAuth = enableClientAuth;
		this.enableMultiTenancy = enableMultiTenancy;
		this.formsFlowAdminUrl = formsFlowAdminUrl;
		this.cssApiUrl = cssApiUrl;
		this.sharedRealmEnabled = sharedRealmEnabled;
		this.cssApiClient = cssApiClient;
		this.cssApiSecret = cssApiSecret;
		this.cssApiLogin = cssApiLogin;
	}
	
	public String getWebClientId() {
		return webClientId;
	}

	public boolean isEnableClientAuth() {
		return enableClientAuth;
	}

	public boolean isEnableMultiTenancy() {
		return enableMultiTenancy;
	}

	public String getFormsFlowAdminUrl() {
		return formsFlowAdminUrl;
	}

	public String getCssApiUrl() {
		return cssApiUrl;
	}

	public void setCssApiUrl(String cssApiUrl) {
		this.cssApiUrl = cssApiUrl;
	}

	public boolean isSharedRealmEnabled() {
		return sharedRealmEnabled;
	}

	public void setSharedRealmEnabled(boolean sharedRealmEnabled) {
		this.sharedRealmEnabled = sharedRealmEnabled;
	}

	public String getCssApiClient() {
		return cssApiClient;
	}

	public void setCssApiClient(String cssApiClient) {
		this.cssApiClient = cssApiClient;
	}

	public String getCssApiSecret() {
		return cssApiSecret;
	}

	public void setCssApiSecret(String cssApiSecret) {
		this.cssApiSecret = cssApiSecret;
	}

	public String getCssApiLogin() {
		return cssApiLogin;
	}

	public void setCssApiLogin(String cssApiLogin) {
		this.cssApiLogin = cssApiLogin;
	}

}
