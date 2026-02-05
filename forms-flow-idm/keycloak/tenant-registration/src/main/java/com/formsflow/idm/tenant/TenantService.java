/*
 * Service for calling external tenant API.
 * Single endpoint: POST {FF_ADMIN_API_URL}/tenants
 * Response: tenantId, defaultGroupId (used to add user to Keycloak group).
 */

package com.formsflow.idm.tenant;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

import org.jboss.logging.Logger;
import org.keycloak.models.ClientModel;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.RealmModel;

import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Stub/implementation for external tenant creation API.
 * Config: FF_ADMIN_API_URL (env var). Final URL: {FF_ADMIN_API_URL}/tenants.
 * Payload: key (random 5 chars), name (domain from email if non-generic, else key), details, trial.
 * Response: tenantId, defaultGroupId.
 */
public class TenantService {

    private static final Logger logger = Logger.getLogger(TenantService.class);
    private static final String ENV_BASE_URL = "FF_ADMIN_API_URL";
    private static final String TENANTS_PATH = "/tenants";
    private static final String ENV_BPM_CLIENT_ID = "FF_BPM_CLIENT_ID";
    private static final String DEFAULT_BPM_CLIENT_ID = "forms-flow-bpm";
    private static final String ENV_KEYCLOAK_PUBLIC_URL = "FF_KEYCLOAK_PUBLIC_URL";

    /** Never follow redirects so Authorization is not stripped (HttpClient drops it on redirect). */
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .followRedirects(HttpClient.Redirect.NEVER)
            .build();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Creates a tenant via external API. Called from PreTenantCreationFormAction with email from form.
     *
     * @param email Email from registration form; used to derive name (domain) when not generic
     * @return tenantId and defaultGroupId from API response
     * @throws TenantServiceException if API call fails or returns non-2xx
     */
    /**
     * @param session Keycloak session (used to obtain Bearer token for forms-flow-bpm client).
     * @param email   Email from form (may be null when called from Authenticator; then name=key).
     */
    public TenantCreationResult createTenant(KeycloakSession session, String email) throws TenantServiceException {
        String baseUrl = System.getenv(ENV_BASE_URL);
        if (baseUrl == null || baseUrl.trim().isEmpty()) {
            throw new TenantServiceException(ENV_BASE_URL + " is not set");
        }
        String url = baseUrl.replaceAll("/+$", "") + TENANTS_PATH;

        String token = obtainBpmClientToken(session);
        if (token == null || token.trim().isEmpty()) {
            throw new TenantServiceException("Obtained access token is null or empty; cannot call tenant API");
        }
        RealmModel realm = session.getContext().getRealm();
        logger.infof("Calling tenant API: %s (realm=%s)", url, realm != null ? realm.getName() : "null");

        String key = randomKey(5);

        Map<String, Object> details = new HashMap<>();
        details.put("createDefaultUsers", false);
        details.put("createDefaultUserGroup", true);
        details.put("skipAnalytics", false);

        Map<String, Object> payload = new HashMap<>();
        payload.put("key", key);
        payload.put("name", key);
        payload.put("details", details);
        payload.put("trial", true);

        try {
            String json = objectMapper.writeValueAsString(payload);
            String bearerToken = "Bearer " + token.trim();
            HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Authorization", bearerToken)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(json, StandardCharsets.UTF_8))
                    .timeout(Duration.ofSeconds(30));
            HttpRequest request = requestBuilder.build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));

            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                String body = response.body();
                int code = response.statusCode();
                throw new TenantServiceException("Tenant API returned " + code + ": " + body);
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> body = objectMapper.readValue(response.body(), Map.class);
            String tenantId = getString(body, "tenantId");
            String defaultGroupId = getString(body, "defaultGroupId");
            if (tenantId == null || defaultGroupId == null) {
                throw new TenantServiceException("Response missing tenantId or defaultGroupId: " + response.body());
            }
            return new TenantCreationResult(tenantId, defaultGroupId);
        } catch (TenantServiceException e) {
            throw e;
        } catch (Exception e) {
            logger.errorf(e, "Tenant API call failed: %s", url);
            throw new TenantServiceException("Failed to create tenant: " + e.getMessage(), e);
        }
    }

    private static String randomKey(int length) {
        String letters = "abcdefghijklmnopqrstuvwxyz";
        String alphanumeric = "abcdefghijklmnopqrstuvwxyz0123456789";
        Random r = new Random();
        StringBuilder sb = new StringBuilder(length);
        sb.append(letters.charAt(r.nextInt(letters.length())));
        for (int i = 1; i < length; i++) {
            sb.append(alphanumeric.charAt(r.nextInt(alphanumeric.length())));
        }
        return sb.toString();
    }

    /**
     * Obtains an access token for the forms-flow-bpm client via client credentials grant.
     * Uses the client secret from the realm (ClientModel.getSecret()); the client must exist as a confidential client with a secret configured.
     */
    private String obtainBpmClientToken(KeycloakSession session) throws TenantServiceException {
        String clientId = System.getenv(ENV_BPM_CLIENT_ID);
        if (clientId == null || clientId.trim().isEmpty()) {
            clientId = DEFAULT_BPM_CLIENT_ID;
        }
        RealmModel realm = session.getContext().getRealm();
        if (realm == null) {
            throw new TenantServiceException("Realm context is not available");
        }
        ClientModel client = realm.getClientByClientId(clientId);
        if (client == null) {
            throw new TenantServiceException("Client not found: " + clientId);
        }
        if (client.isPublicClient()) {
            throw new TenantServiceException("Client is public; cannot use client credentials: " + clientId);
        }
        String clientSecret = client.getSecret();
        if (clientSecret == null || clientSecret.trim().isEmpty()) {
            throw new TenantServiceException("Client has no secret configured: " + clientId);
        }
        String baseUrl;
        String publicUrl = System.getenv(ENV_KEYCLOAK_PUBLIC_URL);
        if (publicUrl != null && !publicUrl.trim().isEmpty()) {
            baseUrl = publicUrl.trim().replaceAll("/+$", "");
        } else {
            baseUrl = session.getContext().getUri().getBaseUri().toString().replaceAll("/+$", "");
        }
        String tokenUrl = baseUrl + "/realms/" + realm.getName() + "/protocol/openid-connect/token";
        String body = "grant_type=client_credentials"
                + "&client_id=" + URLEncoder.encode(clientId, StandardCharsets.UTF_8)
                + "&client_secret=" + URLEncoder.encode(clientSecret, StandardCharsets.UTF_8);
        try {
            HttpRequest tokenRequest = HttpRequest.newBuilder()
                    .uri(URI.create(tokenUrl))
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .POST(HttpRequest.BodyPublishers.ofString(body, StandardCharsets.UTF_8))
                    .timeout(Duration.ofSeconds(10))
                    .build();
            HttpResponse<String> tokenResponse = httpClient.send(tokenRequest, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            if (tokenResponse.statusCode() < 200 || tokenResponse.statusCode() >= 300) {
                throw new TenantServiceException("Token request failed: " + tokenResponse.statusCode() + " " + tokenResponse.body());
            }
            @SuppressWarnings("unchecked")
            Map<String, Object> tokenBody = objectMapper.readValue(tokenResponse.body(), Map.class);
            String accessToken = getString(tokenBody, "access_token");
            if (accessToken == null || accessToken.trim().isEmpty()) {
                throw new TenantServiceException("Token response missing or empty access_token");
            }
            return accessToken;
        } catch (TenantServiceException e) {
            throw e;
        } catch (Exception e) {
            logger.errorf(e, "Failed to obtain BPM client token");
            throw new TenantServiceException("Failed to obtain token: " + e.getMessage(), e);
        }
    }

    private static String getString(Map<String, Object> map, String key) {
        Object v = map.get(key);
        if (v == null) {
            return null;
        }
        return String.valueOf(v);
    }

    public static final class TenantCreationResult {
        private final String tenantId;
        private final String defaultGroupId;

        public TenantCreationResult(String tenantId, String defaultGroupId) {
            this.tenantId = tenantId;
            this.defaultGroupId = defaultGroupId;
        }

        public String getTenantId() {
            return tenantId;
        }

        public String getDefaultGroupId() {
            return defaultGroupId;
        }
    }

    public static class TenantServiceException extends Exception {
        public TenantServiceException(String message) {
            super(message);
        }

        public TenantServiceException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
