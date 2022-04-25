package org.camunda.bpm.extension.keycloak.plugin;

public class CustomConfig {
	
	
	private String webClientId;

	private boolean enableClientAuth = false;

	private boolean enableMultiTenancy = false;

	private String formsFlowAdminUrl;

	public String getWebClientId() {
		return webClientId;
	}

	public CustomConfig(String webClientId, boolean enableClientAuth, boolean enableMultiTenancy,
			String formsFlowAdminUrl) {
		super();
		this.webClientId = webClientId;
		this.enableClientAuth = enableClientAuth;
		this.enableMultiTenancy = enableMultiTenancy;
		this.formsFlowAdminUrl = formsFlowAdminUrl;
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

}
