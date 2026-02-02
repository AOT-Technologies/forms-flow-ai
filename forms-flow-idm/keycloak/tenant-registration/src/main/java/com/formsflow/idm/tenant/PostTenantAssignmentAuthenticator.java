/*
 * Optional authenticator for top-level flows. For registration flow, PostTenantAssignmentFormAction is used.
 * Add-to-group runs synchronously (fail flow on failure); email is sent synchronously in the request thread so Keycloak's EmailTemplateProvider has request context (required for Quarkus).
 */

package com.formsflow.idm.tenant;

import org.jboss.logging.Logger;
import org.keycloak.authentication.AuthenticationFlowContext;
import org.keycloak.authentication.AuthenticationFlowError;
import org.keycloak.authentication.Authenticator;
import org.keycloak.models.GroupModel;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.RealmModel;
import org.keycloak.models.UserModel;
import org.keycloak.sessions.AuthenticationSessionModel;

import jakarta.ws.rs.core.Response;

public class PostTenantAssignmentAuthenticator implements Authenticator {

    private static final Logger logger = Logger.getLogger(PostTenantAssignmentAuthenticator.class);
    public static final String PROVIDER_ID = "post-tenant-assignment-authenticator";

    @Override
    public void authenticate(AuthenticationFlowContext context) {
        UserModel user = context.getUser();
        if (user == null) {
            context.attempted();
            return;
        }
        AuthenticationSessionModel authSession = context.getAuthenticationSession();
        String createTenant = authSession.getAuthNote(PreTenantCreationFormAction.CREATE_TENANT_REQUIRED_NOTE);
        if (createTenant == null || !"true".equalsIgnoreCase(createTenant)) {
            context.success();
            return;
        }
        String defaultGroupId = authSession.getAuthNote(PreTenantCreationFormAction.DEFAULT_GROUP_ID_NOTE);
        if (defaultGroupId == null || defaultGroupId.isEmpty()) {
            context.success();
            return;
        }

        RealmModel realm = context.getRealm();
        GroupModel group = realm.getGroupById(defaultGroupId);
        if (group == null) {
            logger.errorf("Group not found: %s; failing flow for user %s", defaultGroupId, user.getUsername());
            context.failure(AuthenticationFlowError.INTERNAL_ERROR,
                    context.getSession().getProvider(org.keycloak.forms.login.LoginFormsProvider.class)
                            .setError("Group not found. Registration cannot be completed.")
                            .createErrorPage(Response.Status.INTERNAL_SERVER_ERROR));
            return;
        }
        try {
            user.joinGroup(group);
        } catch (Exception e) {
            logger.errorf(e, "Add-to-group failed for user %s", user.getUsername());
            context.failure(AuthenticationFlowError.INTERNAL_ERROR,
                    context.getSession().getProvider(org.keycloak.forms.login.LoginFormsProvider.class)
                            .setError("Failed to assign group. Please try again later.")
                            .createErrorPage(Response.Status.INTERNAL_SERVER_ERROR));
            return;
        }

        String tenantId = authSession.getAuthNote(PreTenantCreationFormAction.TENANT_ID_NOTE);
        if (tenantId != null && !tenantId.isEmpty()) {
            user.setSingleAttribute("tenantKey", tenantId);
        }

        String redirectUri = authSession.getRedirectUri();
        try {
            AccountCreatedEmailSender.send(context.getSession(), realm, user, redirectUri);
        } catch (Throwable t) {
            logger.errorf(t, "Failed to send account-created email to user %s", user.getId());
        }
        context.success();
    }

    @Override
    public void action(AuthenticationFlowContext context) {
    }

    @Override
    public boolean requiresUser() {
        return true;
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
