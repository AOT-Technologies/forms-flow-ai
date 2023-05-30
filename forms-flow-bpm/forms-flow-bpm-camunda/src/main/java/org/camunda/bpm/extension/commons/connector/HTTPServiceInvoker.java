package org.camunda.bpm.extension.commons.connector;


import org.apache.commons.lang3.StringUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.camunda.bpm.extension.commons.ro.req.IRequest;
import org.camunda.bpm.extension.commons.ro.res.IResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;
import java.io.IOException;
import java.util.Map;
import java.util.Properties;
import java.util.logging.Logger;

/**
 *  Http Service Invoker.
 *  This class prepares the payload and invokes the respective access handler based on the service ID.
 */
@Component("httpServiceInvoker")
public class HTTPServiceInvoker {
	
	private static final String FORMIO_URL = "formio.url";
	private static final String API_URL = "api.url";
	private static final String BPM_URL = "bpm.url";
	private static final String ANALYSIS_URL = "analysis.url";
	private static final String APPLICATION_ACCESS_HANDLER = "applicationAccessHandler";
	private static final String BPM_ACCESS_HANDLER = "bpmAccessHandler";
	private static final String TEXT_ANALYZER_ACCESS_HANDLER = "textAnalyzerAccessHandler";
	private static final String FORM_ACCESS_HANDLER = "formAccessHandler";
    private static final String CUSTOM_SUBMISSION_ACCESS_HANDLER = "CustomSubmissionAccessHandler";

    private final Logger LOGGER = Logger.getLogger(HTTPServiceInvoker.class.getName());

    @Autowired
    private AccessHandlerFactory accessHandlerFactory;
    @Resource(name = "bpmObjectMapper")
    private ObjectMapper bpmObjectMapper;
    @Autowired
    private Properties integrationCredentialProperties;

    public ResponseEntity<String> execute(String url, HttpMethod method, Object payload) throws IOException {
        String dataJson = payload != null ? bpmObjectMapper.writeValueAsString(payload) : null;
        return execute(url, method, dataJson);
    }

    public ResponseEntity<String> execute(String url, HttpMethod method, String payload) {
            return accessHandlerFactory.getService(getServiceId(url)).exchange(url, method, payload);
    }

    public ResponseEntity<IResponse> execute(String url, HttpMethod method, IRequest payload, Class<? extends IResponse> responseClazz) {
        return accessHandlerFactory.getService(getServiceId(url)).exchange(url, method, payload, responseClazz);
    }

    public ResponseEntity<String> executeWithParamsAndPayload(String url, HttpMethod method, Map<String, Object> requestParams, IRequest payload) {
        return accessHandlerFactory.getService(getServiceId(url)).exchange(url, method, requestParams, payload);
    }

    private String getServiceId(String url) {

        Boolean enableCustomSubmission = Boolean.valueOf(integrationCredentialProperties.getProperty("forms.enableCustomSubmission"));
 		if (isUrlValid(url, fetchUrlFromProperty(API_URL))) {
			return APPLICATION_ACCESS_HANDLER;
		} else if (isUrlValid(url, fetchUrlFromProperty(BPM_URL))) {
			return BPM_ACCESS_HANDLER;
		} else if (isUrlValid(url, fetchUrlFromProperty(ANALYSIS_URL))) {
			return TEXT_ANALYZER_ACCESS_HANDLER;
		} else if (isUrlValid(url, fetchUrlFromProperty(FORMIO_URL))) {
            if (enableCustomSubmission && StringUtils.contains(url, "/submission")) {
                return CUSTOM_SUBMISSION_ACCESS_HANDLER;
            }
            else {
			    return FORM_ACCESS_HANDLER;
            }
        }
 		return "";
    }
	
	private String fetchUrlFromProperty(String key) {
		return getProperties().getProperty(key);
	}

	private boolean isUrlValid(String sourceUrl, String targetUrl) {
		return StringUtils.isNotBlank(targetUrl) && StringUtils.contains(sourceUrl, targetUrl) ? true : false;
	}

    public Properties getProperties() {
        return integrationCredentialProperties;
    }

}