/*
 * Renders and sends "account created" email. Renders subject and body in the request thread
 * (content matches account-created.ftl). Sends asynchronously in a background thread so the
 * registration flow is not blocked on SMTP.
 */

package com.formsflow.idm.tenant;

import java.util.Map;

import org.jboss.logging.Logger;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.RealmModel;
import org.keycloak.models.UserModel;

/**
 * Renders account-created email in the request thread, then enqueues sending in a background
 * thread so the flow is not blocked. Content matches theme template account-created.ftl.
 */
public class AccountCreatedEmailSender {

    private static final Logger logger = Logger.getLogger(AccountCreatedEmailSender.class);
    private static final String DEFAULT_SUBJECT = "Your account has been created";

    /**
     * Renders the account-created email (subject + HTML and text bodies) in the request thread.
     * Does not send. Content matches the account-created.ftl template.
     */
    public static RenderedEmail render(KeycloakSession session, RealmModel realm, UserModel user, String redirectUri) {
        if (user == null || user.getEmail() == null) {
            logger.warn("Cannot render account created email: user or email is null");
            return null;
        }
        String username = user.getUsername() != null ? user.getUsername() : "";
        String firstName = user.getFirstName() != null ? user.getFirstName() : "there";
        String email = user.getEmail();
        String realmName = realm.getDisplayName() != null ? realm.getDisplayName() : realm.getName();
        String redirect = redirectUri != null ? redirectUri : "";

        String htmlBody = "<html><head><meta charset=\"UTF-8\"></head><body style=\"font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;\">"
                + "<div style=\"background-color: #1f4e79; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;\"><h1>Welcome to " + escape(realmName) + "!</h1></div>"
                + "<div style=\"background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px;\">"
                + "<p>Hello " + escape(firstName) + ",</p>"
                + "<p>Your account has been successfully created.</p>"
                + "<div style=\"background-color: white; padding: 20px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #1f4e79;\">"
                + "<h3>Account Details:</h3><ul><li><strong>Username:</strong> " + escape(username) + "</li>"
                + "<li><strong>Email:</strong> " + escape(email) + "</li><li><strong>Realm:</strong> " + escape(realmName) + "</li></ul></div>"
                + "<p>Thank you for joining us!</p>"
                + (redirect.isEmpty() ? "" : "<p><a href=\"" + escape(redirect) + "\" style=\"display: inline-block; background-color: #1f4e79; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 10px;\">Sign in / Open app</a></p>")
                + "</div><div style=\"text-align: center; margin-top: 20px; color: #666; font-size: 12px;\"><p>This is an automated message. Please do not reply to this email.</p></div></body></html>";
        String textBody = "Welcome " + firstName + "!\n\nYour account has been successfully created.\n\nAccount Details:\n- Username: " + username + "\n- Email: " + email + "\n- Realm: " + realmName + "\n\nThank you for joining us!"
                + (redirect.isEmpty() ? "" : "\n\nSign in / Open app: " + redirect + "\n");

        return new RenderedEmail(email, DEFAULT_SUBJECT, htmlBody, textBody);
    }

    private static String escape(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;");
    }

    /**
     * Renders the account-created email in the request thread and enqueues sending in the background.
     * Does not block on SMTP. SMTP config is read from the realm. On render failure or missing SMTP config, logs and returns.
     */
    public static void renderAndSendAsync(KeycloakSession session, RealmModel realm, UserModel user, String redirectUri) {
        if (user == null || user.getEmail() == null) {
            logger.warn("Cannot send account created email: user or email is null");
            return;
        }
        RenderedEmail rendered = render(session, realm, user, redirectUri);
        if (rendered == null) {
            return;
        }
        Map<String, String> smtpConfig = realm.getSmtpConfig();
        if (smtpConfig == null || smtpConfig.isEmpty()) {
            logger.warn("Realm SMTP not configured; account-created email not sent to " + user.getEmail());
            return;
        }
        logger.debugf("Enqueuing account-created email for %s", user.getEmail());
        AsyncEmailSender.sendAsync(rendered, smtpConfig);
    }
}
