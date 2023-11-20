package org.camunda.bpm.extension.commons.connector.auth;

/**
 * Formio Context.
 * Class for holding and transferring access token data.
 */
public class FormioContext {

    String accessToken;

    private long expiresAt;

    public FormioContext(String accessToken, long expiresAt) {
        this.accessToken = accessToken;
        this.expiresAt = expiresAt + System.currentTimeMillis();
    }

    /**
     * Checks if the token needs a refresh or not
     * @return
     */
    public boolean needsRefresh() {
        return System.currentTimeMillis() >= expiresAt;
    }

    public String getAccessToken() { return accessToken; }
}
