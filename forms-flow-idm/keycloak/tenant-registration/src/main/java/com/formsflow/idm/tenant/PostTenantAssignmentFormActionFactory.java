package com.formsflow.idm.tenant;

import java.util.List;

import org.keycloak.Config;
import org.keycloak.authentication.ConfigurableAuthenticatorFactory;
import org.keycloak.authentication.FormAction;
import org.keycloak.authentication.FormActionFactory;
import org.keycloak.models.AuthenticationExecutionModel;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.KeycloakSessionFactory;
import org.keycloak.provider.ProviderConfigProperty;

public class PostTenantAssignmentFormActionFactory implements FormActionFactory, ConfigurableAuthenticatorFactory {

    private static final PostTenantAssignmentFormAction SINGLETON = new PostTenantAssignmentFormAction();

    @Override
    public String getId() {
        return PostTenantAssignmentFormAction.PROVIDER_ID;
    }

    @Override
    public String getDisplayType() {
        return "Post Tenant Assignment Form Action";
    }

    @Override
    public String getHelpText() {
        return "Adds user to Keycloak group (defaultGroupId) and sends account-created email. Runs asynchronously. Disables user on failure. Must be placed AFTER 'Registration User Creation' in the flow.";
    }

    @Override
    public String getReferenceCategory() {
        return "tenant-assignment";
    }

    @Override
    public boolean isConfigurable() {
        return false;
    }

    @Override
    public AuthenticationExecutionModel.Requirement[] getRequirementChoices() {
        return new AuthenticationExecutionModel.Requirement[] {
                AuthenticationExecutionModel.Requirement.REQUIRED,
                AuthenticationExecutionModel.Requirement.ALTERNATIVE,
                AuthenticationExecutionModel.Requirement.DISABLED
        };
    }

    @Override
    public boolean isUserSetupAllowed() {
        return false;
    }

    @Override
    public List<ProviderConfigProperty> getConfigProperties() {
        return null;
    }

    @Override
    public FormAction create(KeycloakSession session) {
        return SINGLETON;
    }

    @Override
    public void init(Config.Scope config) {
    }

    @Override
    public void postInit(KeycloakSessionFactory factory) {
    }

    @Override
    public void close() {
    }
}
