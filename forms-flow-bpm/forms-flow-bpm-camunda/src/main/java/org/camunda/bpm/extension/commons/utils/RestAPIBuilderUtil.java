package org.camunda.bpm.extension.commons.utils;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import java.text.MessageFormat;
import java.util.List;
import java.util.Map;

import static org.camunda.bpm.extension.commons.utils.VariableConstants.ANONYMOUS_USER;
import static org.camunda.bpm.extension.commons.utils.VariableConstants.SERVICE_ACCOUNT;

/**
 * RestAPI Builder Util.
 * Utility class for storing and transferring data required for Rest API URL.
 */
public class RestAPIBuilderUtil {

    private static RestAPIBuilderUtil instance;

    private static String API_BASE_URL;
    private static String FORM_BASE_URL;
    private static final String APPLICATION_AUDIT_URL = "/application/{0}/history";
    private static final String APPLICATION_URL = "/application/{0}";
    private static final String DEFAULT_USER_CLAIM = "preferred_username";
    
    private RestAPIBuilderUtil(){}

    public static RestAPIBuilderUtil getInstance(String apiBaseUrl, String formBaseUrl){
        if(instance == null){
            API_BASE_URL = apiBaseUrl;
            FORM_BASE_URL = formBaseUrl;
            instance = new RestAPIBuilderUtil();
        }
        return instance;
    }

    public static String getApiBaseUrl() {
        return API_BASE_URL;
    }

    public static String getFormBaseUrl() {
        return FORM_BASE_URL;
    }

    public static String getApplicationAuditUrl(String applicationId){
        return getApiBaseUrl()+ format(APPLICATION_AUDIT_URL,applicationId);
    }

    public static String getApplicationUrl(String applicationId){
        return getApiBaseUrl()+ format(APPLICATION_URL,applicationId);
    }

    private static String format(String url, Object ... arg){
        return MessageFormat.format(url,arg);
    }

    public static String fetchUserName(String userNameAttribute) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        String submittedBy = null;
        if (authentication != null) {
            if (authentication instanceof JwtAuthenticationToken authToken) {
                submittedBy = getUserIdFromJwt(authToken, userNameAttribute);
                if (submittedBy.startsWith("service-account")) {
                    submittedBy = ANONYMOUS_USER;
                }
            }
        } else {
            submittedBy = SERVICE_ACCOUNT;
        }
        return submittedBy;
    }
    
    public static String getUserIdFromJwt(Authentication authentication, String userNameAttribute) {
        if (!(authentication instanceof JwtAuthenticationToken)) {
            throw new IllegalArgumentException("Authentication is not of type JwtAuthenticationToken");
        }

        Map<String, Object> claims = ((JwtAuthenticationToken) authentication).getTokenAttributes();
        Object value = resolveJsonPath(claims, userNameAttribute);
        // If the resolved value is null, fall back to 'preferred_username'
        if (value == null) {
            value = resolveJsonPath(claims, DEFAULT_USER_CLAIM);
        }

        return value != null ? value.toString() : null;
    }

    private static Object resolveJsonPath(Map<String, Object> claims, String path) {
        String[] keys = path.split("\\.");
        Object value = claims;

        for (String key : keys) {
            if (!(value instanceof Map)) {
                return null; // If at any point, it's not a Map, return null
            }
            value = ((Map<?, ?>) value).get(key);

            // If the value is a List, take the first element
            if (value instanceof List) {
                List<?> list = (List<?>) value;
                value = list.isEmpty() ? null : list.get(0);
            }
        }

        return value;
    }

}
