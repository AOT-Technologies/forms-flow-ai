/*
 * FormAction that runs AFTER user is created: add user to Keycloak group (defaultGroupId) and send account-created email.
 * Must be placed AFTER "Registration User Creation" in the registration flow.
 * Steps 4 and 5 (add to group, send email) run asynchronously; on failure the user is disabled.
 */

package com.formsflow.idm.tenant;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import org.jboss.logging.Logger;
import org.keycloak.authentication.FormAction;
import org.keycloak.authentication.FormContext;
import org.keycloak.authentication.ValidationContext;
import org.keycloak.forms.login.LoginFormsProvider;
import org.keycloak.models.GroupModel;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.KeycloakSessionFactory;
import org.keycloak.models.RealmModel;
import org.keycloak.models.UserModel;
import org.keycloak.sessions.AuthenticationSessionModel;

/**
 * Execution order: AFTER "Registration User Creation".
 * success(): reads defaultGroupId from auth notes; submits async task to add user to group and send email; returns immediately.
 * Failure handling: if add-to-group or send-email throws in async task, user is disabled.
 */
public class PostTenantAssignmentFormAction implements FormAction {

    private static final Logger logger = Logger.getLogger(PostTenantAssignmentFormAction.class);
    public static final String PROVIDER_ID = "post-tenant-assignment-form-action";

    private static final ExecutorService ASYNC_EXECUTOR = Executors.newSingleThreadExecutor(r -> {
        Thread t = new Thread(r, "tenant-registration-post-assignment");
        t.setDaemon(true);
        return t;
    });

    @Override
    public void buildPage(FormContext context, LoginFormsProvider form) {
    }

    @Override
    public void validate(ValidationContext context) {
        context.success();
    }

    @Override
    public void success(FormContext context) {
        AuthenticationSessionModel authSession = context.getAuthenticationSession();
        UserModel user = context.getUser();
        String defaultGroupId = authSession.getAuthNote(PreTenantCreationFormAction.DEFAULT_GROUP_ID_NOTE);

        if (defaultGroupId == null || defaultGroupId.isEmpty()) {
            return;
        }
        if (user == null) {
            logger.warn("PostTenantAssignmentFormAction.success: user is null");
            return;
        }

        KeycloakSessionFactory sessionFactory = context.getSession().getKeycloakSessionFactory();
        String realmId = context.getSession().getContext().getRealm().getId();
        String userId = user.getId();

        ASYNC_EXECUTOR.submit(() -> {
            KeycloakSession session = sessionFactory.create();
            try {
                RealmModel realm = session.realms().getRealm(realmId);
                UserModel u = session.users().getUserById(realm, userId);
                if (u == null) {
                    logger.errorf("User not found: %s", userId);
                    return;
                }
                GroupModel group = realm.getGroupById(defaultGroupId);
                if (group == null) {
                    logger.errorf("Group not found: %s; disabling user %s", defaultGroupId, u.getUsername());
                    u.setEnabled(false);
                    return;
                }
                u.joinGroup(group);
                AccountCreatedEmailSender.send(session, realm, u);
            } catch (Exception e) {
                logger.errorf(e, "Post-tenant assignment failed for user %s; disabling user", userId);
                try {
                    RealmModel r = session.realms().getRealm(realmId);
                    UserModel u = session.users().getUserById(r, userId);
                    if (u != null) {
                        u.setEnabled(false);
                    }
                } catch (Exception e2) {
                    logger.errorf(e2, "Could not disable user %s", userId);
                }
            } finally {
                session.close();
            }
        });
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
