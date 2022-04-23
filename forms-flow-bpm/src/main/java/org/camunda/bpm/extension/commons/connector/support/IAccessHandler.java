package org.camunda.bpm.extension.commons.connector.support;

import org.camunda.bpm.extension.commons.ro.req.IRequest;
import org.camunda.bpm.extension.commons.ro.res.IResponse;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;

/**
 * This class defines the AccessHandler implementation.
 *
 * @author sumathi.thirumani@aot-technologies.com
 */
public interface IAccessHandler {
    ResponseEntity<String> exchange(String url, HttpMethod method, String payload);

    ResponseEntity<? extends IResponse> exchange(String url, HttpMethod method, IRequest payload,
                                                 Class<? extends IResponse> responseClazz);
}
