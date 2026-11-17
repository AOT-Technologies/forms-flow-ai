package com.formsflow.idm.tenant;

import java.util.Collections;
import java.util.List;

import org.keycloak.authentication.Authenticator;
import org.keycloak.authentication.AuthenticatorFactory;
import org.keycloak.models.AuthenticationExecutionModel;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.KeycloakSessionFactory;
import org.keycloak.provider.ProviderConfigProperty;

public class PreTenantCreationAuthenticatorFactory implements AuthenticatorFactory {

    private static final Authenticator SINGLETON = new PreTenantCreationAuthenticator();

    @Override
    public String getId() {
        return PreTenantCreationAuthenticator.PROVIDER_ID;
    }

    @Override
    public String getDisplayType() {
        return "Pre Tenant Creation";
    }

    @Override
    public String getHelpText() {
        return "Optional for top-level flows. Creates tenant via API when create_tenant=true (no form data; key/name=key). For registration use Pre Tenant Creation Form Action.";
    }

    @Override
    public String getReferenceCategory() {
        return null;
    }

    @Override
    public boolean isConfigurable() {
        return false;
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
    public List<ProviderConfigProperty> getConfigProperties() {
        return Collections.emptyList();
    }

    @Override
    public Authenticator create(KeycloakSession session) {
        return SINGLETON;
    }

    @Override
    public void init(org.keycloak.Config.Scope scope) {
    }

    @Override
    public void postInit(KeycloakSessionFactory factory) {
    }

    @Override
    public void close() {
    }
}
