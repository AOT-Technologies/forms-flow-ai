package com.formsflow.idm.authenticator;

import static org.keycloak.provider.ProviderConfigProperty.STRING_TYPE;

import java.util.Collections;
import java.util.List;

import org.keycloak.authentication.Authenticator;
import org.keycloak.authentication.AuthenticatorFactory;
import org.keycloak.models.AuthenticationExecutionModel;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.KeycloakSessionFactory;
import org.keycloak.provider.ProviderConfigProperty;

public class ConfigurableIdpAuthenticatorFactory implements AuthenticatorFactory {

	public static final String ID = "configurable-idp-authenticator";

	private static final Authenticator AUTHENTICATOR_INSTANCE = new ConfigurableIdpAuthenticator();

	static final String IDP_LIST = "idpList";

	@Override
	public Authenticator create(KeycloakSession keycloakSession) {
		return AUTHENTICATOR_INSTANCE;
	}

	@Override
	public String getDisplayType() {
		return "Custom IDP Selector";
	}

	@Override
	public boolean isConfigurable() {
		return true;
	}

	@Override
	public AuthenticationExecutionModel.Requirement[] getRequirementChoices() {
		return new AuthenticationExecutionModel.Requirement[] { AuthenticationExecutionModel.Requirement.REQUIRED };
	}

	@Override
	public boolean isUserSetupAllowed() {
		return false;
	}

	@Override
	public String getHelpText() {
		return "formsflow.ai addon to limit the IDPs which can be used for the client application";
	}

	@Override
	public List<ProviderConfigProperty> getConfigProperties() {
		ProviderConfigProperty name = new ProviderConfigProperty();

		name.setType(STRING_TYPE);
		name.setName(IDP_LIST);
		name.setLabel("Comma-separated list of IDP aliases to display");
		name.setHelpText("Comma-separated list of IDP aliases to display");

		return Collections.singletonList(name);
	}

	@Override
	public String getReferenceCategory() {
		return null;
	}

	@Override
	public void init(org.keycloak.Config.Scope scope) {
	}

	@Override
	public void postInit(KeycloakSessionFactory keycloakSessionFactory) {
	}

	@Override
	public void close() {
	}

	@Override
	public String getId() {
		return ID;
	}

}
