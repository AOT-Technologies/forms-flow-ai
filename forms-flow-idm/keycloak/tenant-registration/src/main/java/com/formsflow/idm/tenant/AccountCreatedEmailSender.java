/*
 * Sends "account created" email using EmailTemplateProvider and custom FreeMarker template.
 * Used from PostTenantAssignmentFormAction and PostTenantAssignmentAuthenticator in the request thread (so Keycloak's EmailTemplateProvider has request context for locale/template processing in Quarkus).
 */

package com.formsflow.idm.tenant;

import java.util.HashMap;
import java.util.Map;

import org.jboss.logging.Logger;
import org.keycloak.email.EmailException;
import org.keycloak.email.EmailTemplateProvider;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.RealmModel;
import org.keycloak.models.UserModel;

/**
 * Helper to send account-created email via EmailTemplateProvider.
 * Template: account-created.ftl in theme email/html (and text).
 * Subject key: accountCreatedSubject (message bundle or literal).
 */
public class AccountCreatedEmailSender {

    private static final Logger logger = Logger.getLogger(AccountCreatedEmailSender.class);
    private static final String BODY_TEMPLATE = "account-created.ftl";
    private static final String SUBJECT_KEY = "accountCreatedSubject";

    /**
     * Sends account-created email. SMTP must be configured at realm level.
     *
     * @param redirectUri Optional app redirect URL to include as a link in the email (e.g. from auth session).
     */
    public static void send(KeycloakSession session, RealmModel realm, UserModel user, String redirectUri) {
        if (user == null || user.getEmail() == null) {
            logger.warn("Cannot send account created email: user or email is null");
            return;
        }
        try {
            EmailTemplateProvider provider = session.getProvider(EmailTemplateProvider.class)
                    .setRealm(realm)
                    .setUser(user);

            Map<String, Object> attributes = new HashMap<>();
            attributes.put("username", user.getUsername() != null ? user.getUsername() : "");
            attributes.put("firstName", user.getFirstName() != null ? user.getFirstName() : "");
            attributes.put("lastName", user.getLastName() != null ? user.getLastName() : "");
            attributes.put("email", user.getEmail());
            attributes.put("realmName", realm.getDisplayName() != null ? realm.getDisplayName() : realm.getName());
            attributes.put("redirectUri", redirectUri != null ? redirectUri : "");

            logger.infof("Sending account-created email to %s", user.getEmail());
            provider.send(SUBJECT_KEY, BODY_TEMPLATE, attributes);
            logger.infof("Sent account-created email to %s", user.getEmail());
        } catch (EmailException e) {
            logger.errorf(e, "Failed to send account-created email to %s", user.getUsername());
            throw new RuntimeException("Email send failed", e);
        }
    }
}
