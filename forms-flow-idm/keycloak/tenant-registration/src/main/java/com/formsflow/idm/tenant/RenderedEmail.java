/*
 * Rendered email payload (subject + bodies) for async sending. Contains only plain data, no Keycloak types.
 */

package com.formsflow.idm.tenant;

public final class RenderedEmail {

    private final String toEmail;
    private final String subject;
    private final String htmlBody;
    private final String textBody;

    public RenderedEmail(String toEmail, String subject, String htmlBody, String textBody) {
        this.toEmail = toEmail;
        this.subject = subject != null ? subject : "";
        this.htmlBody = htmlBody != null ? htmlBody : "";
        this.textBody = textBody != null ? textBody : "";
    }

    public String getToEmail() {
        return toEmail;
    }

    public String getSubject() {
        return subject;
    }

    public String getHtmlBody() {
        return htmlBody;
    }

    public String getTextBody() {
        return textBody;
    }
}
