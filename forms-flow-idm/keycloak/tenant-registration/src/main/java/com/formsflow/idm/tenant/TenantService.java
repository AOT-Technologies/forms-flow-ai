/*
 * Service for calling external tenant API.
 * Single endpoint: POST {FF_ADMIN_API_URL}/tenants
 * Response: tenantId, defaultGroupId (used to add user to Keycloak group).
 */

package com.formsflow.idm.tenant;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

import org.jboss.logging.Logger;

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

    private static final String[] GENERIC_DOMAINS = {
        "gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "live.com",
        "icloud.com", "mail.com", "aol.com", "protonmail.com", "yandex.com"
    };

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
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
     * @param email Email from form (may be null when called from Authenticator; then name=key).
     */
    public TenantCreationResult createTenant(String email) throws TenantServiceException {
        String baseUrl = System.getenv(ENV_BASE_URL);
        if (baseUrl == null || baseUrl.trim().isEmpty()) {
            throw new TenantServiceException(ENV_BASE_URL + " is not set");
        }
        String url = baseUrl.replaceAll("/+$", "") + TENANTS_PATH;

        String key = randomKey(5);
        String name = (email != null && !email.isEmpty()) ? nameFromEmail(email, key) : key;

        Map<String, Object> details = new HashMap<>();
        details.put("createDefaultUsers", false);
        details.put("createDefaultUserGroup", true);
        details.put("skipAnalytics", false);

        Map<String, Object> payload = new HashMap<>();
        payload.put("key", key);
        payload.put("name", name);
        payload.put("details", details);
        payload.put("trial", true);

        try {
            String json = objectMapper.writeValueAsString(payload);
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(json, StandardCharsets.UTF_8))
                    .timeout(Duration.ofSeconds(30))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));

            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new TenantServiceException("Tenant API returned " + response.statusCode() + ": " + response.body());
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
        String chars = "abcdefghijklmnopqrstuvwxyz0123456789";
        Random r = new Random();
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(chars.charAt(r.nextInt(chars.length())));
        }
        return sb.toString();
    }

    private static String nameFromEmail(String email, String fallbackKey) {
        if (email == null || !email.contains("@")) {
            return fallbackKey;
        }
        String domain = email.substring(email.indexOf('@') + 1).toLowerCase().trim();
        for (String generic : GENERIC_DOMAINS) {
            if (domain.equals(generic)) {
                return fallbackKey;
            }
        }
        return domain;
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
