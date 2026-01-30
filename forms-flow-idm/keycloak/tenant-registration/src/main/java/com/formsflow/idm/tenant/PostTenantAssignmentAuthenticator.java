/*
 * Optional authenticator for top-level flows. For registration flow, PostTenantAssignmentFormAction is used.
 * Same logic: read defaultGroupId from auth notes; async add user to group + send email; disable user on failure.
 */

package com.formsflow.idm.tenant;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import org.jboss.logging.Logger;
import org.keycloak.authentication.AuthenticationFlowContext;
import org.keycloak.authentication.AuthenticationFlowError;
import org.keycloak.authentication.Authenticator;
import org.keycloak.models.GroupModel;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.KeycloakSessionFactory;
import org.keycloak.models.RealmModel;
import org.keycloak.models.UserModel;
import org.keycloak.sessions.AuthenticationSessionModel;

import jakarta.ws.rs.core.Response;

public class PostTenantAssignmentAuthenticator implements Authenticator {

    private static final Logger logger = Logger.getLogger(PostTenantAssignmentAuthenticator.class);
    public static final String PROVIDER_ID = "post-tenant-assignment-authenticator";

    private static final ExecutorService ASYNC_EXECUTOR = Executors.newSingleThreadExecutor(r -> {
        Thread t = new Thread(r, "tenant-registration-post-assignment-auth");
        t.setDaemon(true);
        return t;
    });

    @Override
    public void authenticate(AuthenticationFlowContext context) {
        UserModel user = context.getUser();
        if (user == null) {
            context.attempted();
            return;
        }
        AuthenticationSessionModel authSession = context.getAuthenticationSession();
        String defaultGroupId = authSession.getAuthNote(PreTenantCreationFormAction.DEFAULT_GROUP_ID_NOTE);
        if (defaultGroupId == null || defaultGroupId.isEmpty()) {
            context.success();
            return;
        }

        KeycloakSessionFactory sessionFactory = context.getSession().getKeycloakSessionFactory();
        String realmId = context.getRealm().getId();
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
