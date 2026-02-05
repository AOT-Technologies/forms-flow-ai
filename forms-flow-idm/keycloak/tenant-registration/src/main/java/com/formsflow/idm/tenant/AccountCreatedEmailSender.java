/*
 * Renders and sends "account created" email. Renders subject and body in the request thread
 * (content matches account-created.ftl). Sends asynchronously in a background thread so the
 * registration flow is not blocked on SMTP.
 */

package com.formsflow.idm.tenant;

import java.util.HashMap;
import java.util.Map;

import org.jboss.logging.Logger;
import org.keycloak.email.EmailTemplateProvider;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.RealmModel;
import org.keycloak.models.UserModel;

/**
 * Sends the \"account created\" email using the Keycloak email templates
 * (HTML and text) backed by {@code account-created.ftl} in the active email theme.
 */
public class AccountCreatedEmailSender {

    private static final Logger logger = Logger.getLogger(AccountCreatedEmailSender.class);

    /**
     * Renders and sends the account-created email using Keycloak's {@link EmailTemplateProvider}
     * and the {@code account-created.ftl} template from the realm's configured email theme.
     * The method name is kept for backwards compatibility, but the send now happens synchronously
     * through Keycloak's email subsystem.
     */
    public static void renderAndSendAsync(KeycloakSession session, RealmModel realm, UserModel user, String redirectUri) {
        if (user == null || user.getEmail() == null) {
            logger.warn("Cannot send account created email: user or email is null");
            return;
        }

        EmailTemplateProvider emailTemplate = session.getProvider(EmailTemplateProvider.class);
        if (emailTemplate == null) {
            logger.warn("EmailTemplateProvider not available; account-created email not sent");
            return;
        }

        String username = user.getUsername() != null ? user.getUsername() : "";
        String firstName = user.getFirstName() != null ? user.getFirstName() : "there";
        String email = user.getEmail();
        String realmName = realm.getDisplayName() != null ? realm.getDisplayName() : realm.getName();

        Map<String, Object> attributes = new HashMap<>();
        attributes.put("username", username);
        attributes.put("firstName", firstName);
        attributes.put("lastName", user.getLastName());
        attributes.put("email", email);
        attributes.put("realmName", realmName);
        if (redirectUri != null && !redirectUri.isBlank()) {
            attributes.put("redirectUri", redirectUri);
        }

        try {
            emailTemplate
                    .setRealm(realm)
                    .setUser(user)
                    .send("accountCreatedSubject", "account-created.ftl", attributes);
            logger.infof("Sent account-created email via template to %s", email);
        } catch (Exception e) {
            logger.errorf(e, "Failed to send account-created email via template to %s", email);
        }
    }
}
