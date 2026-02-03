/*
 * Shared helpers for tenant registration (redirect URI substitution, duration query param).
 */

package com.formsflow.idm.tenant;

public final class TenantRegistrationUtils {

    private static final String TENANT_KEY_PLACEHOLDER = "{tenantKey}";
    /** URL-safe placeholder (no curly braces); use in redirect_uri to avoid browser blocking. */
    public static final String TENANT_KEY_PLACEHOLDER_URL_SAFE = "__TENANT_KEY__";
    private static final String REGISTRATION_DURATION_MS_PARAM = "registration_duration_ms";

    private TenantRegistrationUtils() {
    }

    /**
     * Replaces tenant-key placeholders in redirectUri with the given tenantId (tenant key).
     * Supports {@value #TENANT_KEY_PLACEHOLDER} and {@value #TENANT_KEY_PLACEHOLDER_URL_SAFE}.
     * Prefer __TENANT_KEY__ in redirect_uri to avoid browser blocking of URLs containing curly braces.
     * Returns the original redirectUri if it contains no placeholder or tenantId is null/empty.
     */
    public static String substituteRedirectUriTenantKey(String redirectUri, String tenantId) {
        if (redirectUri == null || tenantId == null || tenantId.isEmpty()) {
            return redirectUri;
        }
        boolean hasPlaceholder = redirectUri.contains(TENANT_KEY_PLACEHOLDER)
                || redirectUri.contains(TENANT_KEY_PLACEHOLDER_URL_SAFE);
        if (!hasPlaceholder) {
            return redirectUri;
        }
        return redirectUri
                .replace(TENANT_KEY_PLACEHOLDER, tenantId)
                .replace(TENANT_KEY_PLACEHOLDER_URL_SAFE, tenantId);
    }

    /**
     * Appends a query parameter to the given URI (handles existing query string).
     */
    public static String appendQueryParam(String uri, String paramName, String paramValue) {
        if (uri == null || paramName == null || paramValue == null) {
            return uri;
        }
        String separator = uri.contains("?") ? "&" : "?";
        return uri + separator + paramName + "=" + paramValue;
    }

    /** Query param name for registration duration (ms). */
    public static String getRegistrationDurationMsParamName() {
        return REGISTRATION_DURATION_MS_PARAM;
    }
}
