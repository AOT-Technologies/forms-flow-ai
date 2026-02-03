/*
 * Optional authenticator for top-level flows. For registration flow, PreTenantCreationFormAction is used.
 * When used: has no form data; calls createTenant with no email (key/name=key) or skips if create_tenant not set.
 */

package com.formsflow.idm.tenant;

import org.jboss.logging.Logger;
import org.keycloak.authentication.AuthenticationFlowContext;
import org.keycloak.authentication.AuthenticationFlowError;
import org.keycloak.authentication.Authenticator;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.RealmModel;
import org.keycloak.models.UserModel;
import org.keycloak.sessions.AuthenticationSessionModel;

import jakarta.ws.rs.core.Response;

public class PreTenantCreationAuthenticator implements Authenticator {

    private static final Logger logger = Logger.getLogger(PreTenantCreationAuthenticator.class);
    public static final String PROVIDER_ID = "pre-tenant-creation-authenticator";

    private final TenantService tenantService = new TenantService();

    @Override
    public void authenticate(AuthenticationFlowContext context) {
        logger.info("PreTenantCreationAuthenticator.authenticate() entered");
        AuthenticationSessionModel authSession = context.getAuthenticationSession();
        String createTenant = authSession.getAuthNote(PreTenantCreationFormAction.CREATE_TENANT_REQUIRED_NOTE);
        String clientNote = authSession.getClientNote(PreTenantCreationFormAction.CREATE_TENANT_CLIENT_NOTE);
        logger.debugf("PreTenantCreation: authNote=%s, clientNote=%s", createTenant, clientNote);
        if (createTenant == null || !"true".equalsIgnoreCase(createTenant)) {
            createTenant = clientNote;
        }
        if (createTenant == null || !"true".equalsIgnoreCase(createTenant)) {
            logger.debugf("PreTenantCreation: tenant creation not required (authNote=%s, clientNote=%s), skipping", authSession.getAuthNote(PreTenantCreationFormAction.CREATE_TENANT_REQUIRED_NOTE), clientNote);
            context.success();
            return;
        }
        if (authSession.getAuthNote(PreTenantCreationFormAction.CREATE_TENANT_REQUIRED_NOTE) == null || !"true".equalsIgnoreCase(authSession.getAuthNote(PreTenantCreationFormAction.CREATE_TENANT_REQUIRED_NOTE))) {
            logger.debug("PreTenantCreation: auth note missing, using client note (create_tenant=true)");
            authSession.setAuthNote(PreTenantCreationFormAction.CREATE_TENANT_REQUIRED_NOTE, "true");
        }
        logger.info("PreTenantCreation: creating tenant (First Broker Login, no email)");
        try {
            TenantService.TenantCreationResult result = tenantService.createTenant(context.getSession(), null);
            if (result != null) {
                authSession.setAuthNote(PreTenantCreationFormAction.TENANT_ID_NOTE, result.getTenantId());
                authSession.setAuthNote(PreTenantCreationFormAction.DEFAULT_GROUP_ID_NOTE, result.getDefaultGroupId());
                logger.infof("PreTenantCreation: tenant created, tenantId=%s, defaultGroupId=%s", result.getTenantId(), result.getDefaultGroupId());
            }
            context.success();
        } catch (TenantService.TenantServiceException e) {
            logger.errorf(e, "Tenant creation failed");
            context.failure(AuthenticationFlowError.INVALID_USER,
                    context.form().setError("Failed to create tenant. Please try again later.")
                            .createErrorPage(Response.Status.BAD_REQUEST));
        }
    }

    @Override
    public void action(AuthenticationFlowContext context) {
    }

    @Override
    public boolean requiresUser() {
        return false;
    }

    @Override
    public boolean configuredFor(KeycloakSession session, RealmModel realm, UserModel user) {
        return true;
    }

    @Override
    public void setRequiredActions(KeycloakSession session, RealmModel realm, UserModel user) {
    }

    @Override
    public void close() {
    }
}
