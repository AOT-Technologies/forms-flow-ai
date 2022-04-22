package org.camunda.bpm.extension.commons.utils;

import java.text.MessageFormat;

public class RestAPIBuilderUtil {

    private static RestAPIBuilderUtil instance;

    private static String API_BASE_URL;
    private static String FORM_BASE_URL;
    private static final String APPLICATION_AUDIT_URL = "/application/{0}/history";
    private static final String APPLICATION_URL = "/application/{0}";

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
}
