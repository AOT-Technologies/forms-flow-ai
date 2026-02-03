/*
 * Sends rendered emails in a background thread using Jakarta Mail and realm SMTP config.
 * Used so the registration flow is not blocked on SMTP. Failures are logged; registration is not failed.
 */

package com.formsflow.idm.tenant;

import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import org.jboss.logging.Logger;

import jakarta.mail.Message;
import jakarta.mail.MessagingException;
import jakarta.mail.Session;
import jakarta.mail.Transport;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.internet.MimeMultipart;

/**
 * Sends emails asynchronously. Uses a single-thread executor so sends are serialized and
 * do not block the request. SMTP config is taken from the realm (host, port, from, auth, user, password).
 */
public final class AsyncEmailSender {

    private static final Logger logger = Logger.getLogger(AsyncEmailSender.class);
    private static final String SMTP_HOST = "host";
    private static final String SMTP_PORT = "port";
    private static final String SMTP_FROM = "from";
    private static final String SMTP_AUTH = "auth";
    private static final String SMTP_USER = "user";
    private static final String SMTP_PASSWORD = "password";

    private static final ExecutorService executor = Executors.newSingleThreadExecutor(r -> {
        Thread t = new Thread(r, "tenant-registration-email-sender");
        t.setDaemon(true);
        return t;
    });

    private AsyncEmailSender() {
    }

    /**
     * Enqueues sending of a rendered email using the given SMTP config. Does not block.
     * Config map keys: host, port, from, auth (optional), user (optional), password (optional).
     */
    public static void sendAsync(RenderedEmail email, Map<String, String> smtpConfig) {
        if (email == null || email.getToEmail() == null || smtpConfig == null || smtpConfig.isEmpty()) {
            logger.warn("Cannot enqueue email: email, toAddress or smtpConfig is null or empty");
            return;
        }
        String host = smtpConfig.get(SMTP_HOST);
        if (host == null || host.isBlank()) {
            logger.warn("SMTP host not configured; cannot send account-created email");
            return;
        }
        executor.submit(() -> {
            try {
                doSend(email, smtpConfig);
            } catch (Exception e) {
                logger.errorf(e, "Failed to send account-created email to %s", email.getToEmail());
            }
        });
    }

    private static void doSend(RenderedEmail email, Map<String, String> smtpConfig) throws MessagingException {
        java.util.Properties props = new java.util.Properties();
        String host = smtpConfig.get(SMTP_HOST);
        String port = smtpConfig.get(SMTP_PORT);
        if (port != null && !port.isEmpty()) {
            props.put("mail.smtp.port", port);
        }
        props.put("mail.smtp.host", host);
        String auth = smtpConfig.get(SMTP_AUTH);
        String smtpUser = smtpConfig.get(SMTP_USER);
        String smtpPassword = smtpConfig.get(SMTP_PASSWORD);
        if ("true".equalsIgnoreCase(auth)) {
            props.put("mail.smtp.auth", "true");
            if (smtpUser != null && smtpPassword != null) {
                props.put("mail.smtp.user", smtpUser);
                props.put("mail.smtp.password", smtpPassword);
            }
        }
        props.put("mail.smtp.starttls.enable", "true");
        Session session = Session.getInstance(props);
        MimeMessage msg = new MimeMessage(session);
        String from = smtpConfig.get(SMTP_FROM);
        if (from != null && !from.isBlank()) {
            msg.setFrom(new InternetAddress(from));
        }
        msg.setRecipients(Message.RecipientType.TO, InternetAddress.parse(email.getToEmail()));
        msg.setSubject(email.getSubject());
        MimeMultipart multipart = new MimeMultipart("alternative");
        if (email.getTextBody() != null && !email.getTextBody().isEmpty()) {
            jakarta.mail.BodyPart textPart = new jakarta.mail.internet.MimeBodyPart();
            textPart.setContent(email.getTextBody(), "text/plain; charset=UTF-8");
            multipart.addBodyPart(textPart);
        }
        if (email.getHtmlBody() != null && !email.getHtmlBody().isEmpty()) {
            jakarta.mail.BodyPart htmlPart = new jakarta.mail.internet.MimeBodyPart();
            htmlPart.setContent(email.getHtmlBody(), "text/html; charset=UTF-8");
            multipart.addBodyPart(htmlPart);
        }
        msg.setContent(multipart);
        if ("true".equalsIgnoreCase(auth) && smtpUser != null && smtpPassword != null) {
            Transport.send(msg, smtpUser, smtpPassword);
        } else {
            Transport.send(msg);
        }
        logger.infof("Sent account-created email to %s", email.getToEmail());
    }
}
