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
import org.keycloak.protocol.oidc.OIDCLoginProtocol;
import org.keycloak.sessions.AuthenticationSessionModel;

import jakarta.ws.rs.core.Response;

public class PostTenantAssignmentAuthenticator implements Authenticator {

    private static final Logger logger = Logger.getLogger(PostTenantAssignmentAuthenticator.class);
    public static final String PROVIDER_ID = "post-tenant-assignment-authenticator";

    @Override
    public void authenticate(AuthenticationFlowContext context) {
        UserModel user = context.getUser();
        logger.infof("PostTenantAssignmentAuthenticator.authenticate() entered, user=%s", user == null ? "null" : user.getUsername());
        if (user == null) {
            logger.debug("PostTenantAssignment: user is null, skipping");
            context.attempted();
            return;
        }
        AuthenticationSessionModel authSession = context.getAuthenticationSession();
        String createTenant = authSession.getAuthNote(PreTenantCreationFormAction.CREATE_TENANT_REQUIRED_NOTE);
        String clientNote = authSession.getClientNote(PreTenantCreationFormAction.CREATE_TENANT_CLIENT_NOTE);
        if (createTenant == null || !"true".equalsIgnoreCase(createTenant)) {
            createTenant = clientNote;
        }
        logger.debugf("PostTenantAssignment: authNote=%s, clientNote=%s", authSession.getAuthNote(PreTenantCreationFormAction.CREATE_TENANT_REQUIRED_NOTE), clientNote);
        if (createTenant == null || !"true".equalsIgnoreCase(createTenant)) {
            logger.debug("PostTenantAssignment: create_tenant not set, skipping");
            context.success();
            return;
        }
        String defaultGroupId = authSession.getAuthNote(PreTenantCreationFormAction.DEFAULT_GROUP_ID_NOTE);
        logger.debugf("PostTenantAssignment: defaultGroupId=%s", defaultGroupId);
        if (defaultGroupId == null || defaultGroupId.isEmpty()) {
            logger.debug("PostTenantAssignment: defaultGroupId missing, skipping");
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
        logger.infof("PostTenantAssignment: adding user %s to group %s", user.getUsername(), defaultGroupId);
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
        String substitutedRedirectUri = TenantRegistrationUtils.substituteRedirectUriTenantKey(redirectUri, tenantId);
        if (substitutedRedirectUri != redirectUri) {
            authSession.setRedirectUri(substitutedRedirectUri);
            authSession.setClientNote(OIDCLoginProtocol.REDIRECT_URI_PARAM, substitutedRedirectUri);
            redirectUri = substitutedRedirectUri;
        }

        String startTimeNote = authSession.getAuthNote(PreTenantCreationFormAction.REGISTRATION_FLOW_START_TIME_NOTE);
        if (startTimeNote != null && !startTimeNote.isEmpty()) {
            try {
                long startMs = Long.parseLong(startTimeNote);
                long durationMs = System.currentTimeMillis() - startMs;
                logger.infof("Registration flow completed in %d ms for user %s", durationMs, user.getUsername());
                String uriWithDuration = TenantRegistrationUtils.appendQueryParam(redirectUri, TenantRegistrationUtils.getRegistrationDurationMsParamName(), String.valueOf(durationMs));
                authSession.setRedirectUri(uriWithDuration);
                authSession.setClientNote(OIDCLoginProtocol.REDIRECT_URI_PARAM, uriWithDuration);
            } catch (NumberFormatException e) {
                logger.debugf("Invalid registration_flow_start_time note: %s", startTimeNote);
            }
        }

        AccountCreatedEmailSender.renderAndSendAsync(context.getSession(), realm, user, authSession.getRedirectUri());
        logger.infof("PostTenantAssignment: completed for user %s (group joined, email enqueued)", user.getUsername());
        context.success();
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
