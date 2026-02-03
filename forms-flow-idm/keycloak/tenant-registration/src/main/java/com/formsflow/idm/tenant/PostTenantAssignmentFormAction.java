/*
 * FormAction that runs AFTER user is created: add user to Keycloak group (defaultGroupId) synchronously, then send account-created email synchronously.
 * Must be placed AFTER "Registration User Creation" in the registration flow.
 * Add-to-group runs synchronously; on failure registration fails (user is disabled). Email is sent in the request thread so Keycloak's EmailTemplateProvider has request context (required for locale/template processing in Quarkus).
 */

package com.formsflow.idm.tenant;

import org.jboss.logging.Logger;
import org.keycloak.authentication.FormAction;
import org.keycloak.authentication.FormContext;
import org.keycloak.authentication.ValidationContext;
import org.keycloak.forms.login.LoginFormsProvider;
import org.keycloak.models.GroupModel;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.RealmModel;
import org.keycloak.models.UserModel;
import org.keycloak.sessions.AuthenticationSessionModel;

/**
 * Execution order: AFTER "Registration User Creation".
 * success(): add user to group synchronously (fail and disable user if group missing); then send account-created email synchronously in the request thread.
 */
public class PostTenantAssignmentFormAction implements FormAction {

    private static final Logger logger = Logger.getLogger(PostTenantAssignmentFormAction.class);
    public static final String PROVIDER_ID = "post-tenant-assignment-form-action";

    @Override
    public void buildPage(FormContext context, LoginFormsProvider form) {
    }

    @Override
    public void validate(ValidationContext context) {
        context.success();
    }

    @Override
    public void success(FormContext context) {
        logger.info("PostTenantAssignmentFormAction.success() entered");
        AuthenticationSessionModel authSession = context.getAuthenticationSession();
        String createTenant = authSession.getAuthNote(PreTenantCreationFormAction.CREATE_TENANT_REQUIRED_NOTE);
        if (createTenant == null || !"true".equalsIgnoreCase(createTenant)) {
            logger.debug("PostTenantAssignmentFormAction: create_tenant not set, skipping");
            return;
        }
        UserModel user = context.getUser();
        String defaultGroupId = authSession.getAuthNote(PreTenantCreationFormAction.DEFAULT_GROUP_ID_NOTE);

        if (defaultGroupId == null || defaultGroupId.isEmpty()) {
            logger.debug("PostTenantAssignmentFormAction: defaultGroupId missing, skipping");
            return;
        }
        if (user == null) {
            logger.warn("PostTenantAssignmentFormAction.success: user is null");
            return;
        }

        RealmModel realm = context.getRealm();
        GroupModel group = realm.getGroupById(defaultGroupId);
        if (group == null) {
            logger.errorf("Group not found: %s; disabling user %s", defaultGroupId, user.getUsername());
            user.setEnabled(false);
            return;
        }
        logger.infof("PostTenantAssignmentFormAction: adding user %s to group %s", user.getUsername(), defaultGroupId);
        try {
            user.joinGroup(group);
        } catch (Exception e) {
            logger.errorf(e, "Add-to-group failed for user %s; disabling user", user.getUsername());
            user.setEnabled(false);
            return;
        }

        String tenantId = authSession.getAuthNote(PreTenantCreationFormAction.TENANT_ID_NOTE);
        if (tenantId != null && !tenantId.isEmpty()) {
            user.setSingleAttribute("tenantKey", tenantId);
        }

        String redirectUri = authSession.getRedirectUri();
        try {
            AccountCreatedEmailSender.send(context.getSession(), realm, user, redirectUri);
            logger.infof("PostTenantAssignmentFormAction: account-created email sent for user %s", user.getUsername());
        } catch (Throwable t) {
            logger.errorf(t, "Failed to send account-created email to user %s", user.getId());
        }
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
