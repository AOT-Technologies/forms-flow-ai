/*
 * Shared helpers for tenant registration (redirect URI substitution, duration query param).
 */

package com.formsflow.idm.tenant;

public final class TenantRegistrationUtils {

    public static final String TENANT_KEY_PLACEHOLDER = "__TENANT_KEY__";

    private TenantRegistrationUtils() {
    }

    /**
     * Replaces tenant-key placeholders in redirectUri with the given tenantId (tenant key).
     * Supports {@value #TENANT_KEY_PLACEHOLDER}.
     * Prefer __TENANT_KEY__ in redirect_uri to avoid browser blocking of URLs containing curly braces.
     * Returns the original redirectUri if it contains no placeholder or tenantId is null/empty.
     */
    public static String substituteRedirectUriTenantKey(String redirectUri, String tenantId) {
        if (redirectUri == null || tenantId == null || tenantId.isEmpty()) {
            return redirectUri;
        }
        boolean hasPlaceholder = redirectUri.contains(TENANT_KEY_PLACEHOLDER);
        if (!hasPlaceholder) {
            return redirectUri;
        }
        return redirectUri
                .replace(TENANT_KEY_PLACEHOLDER, tenantId);
    }


}
