package com.formsflow.idm.tenant;

import java.util.Collections;
import java.util.List;

import org.keycloak.authentication.Authenticator;
import org.keycloak.authentication.AuthenticatorFactory;
import org.keycloak.models.AuthenticationExecutionModel;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.KeycloakSessionFactory;
import org.keycloak.provider.ProviderConfigProperty;

public class PostTenantAssignmentAuthenticatorFactory implements AuthenticatorFactory {

    private static final Authenticator SINGLETON = new PostTenantAssignmentAuthenticator();

    @Override
    public String getId() {
        return PostTenantAssignmentAuthenticator.PROVIDER_ID;
    }

    @Override
    public String getDisplayType() {
        return "Post Tenant Assignment";
    }

    @Override
    public String getHelpText() {
        return "Optional for top-level flows. When create_tenant=true: adds user to Keycloak group (defaultGroupId) synchronously (fails flow if group missing), then sends account-created email synchronously with redirect_uri link.";
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
