package org.camunda.bpm.extension.commons.connector.support;

import org.camunda.bpm.extension.commons.ro.req.IRequest;
import org.camunda.bpm.extension.commons.ro.res.IResponse;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;

import java.util.Map;

/**
 * IAccess Handler.
 * This class defines the AccessHandler implementation.
 */
public interface IAccessHandler {

    /**
     * exchange function using json - string payload / string response
     * @param url
     * @param method
     * @param payload
     * @return
     */
    ResponseEntity<String> exchange(String url, HttpMethod method, String payload);

    /**
     * exchange function using the custom class
     * @param url
     * @param method
     * @param payload
     * @param responseClazz
     * @return
     */
    ResponseEntity<IResponse> exchange(String url, HttpMethod method, IRequest payload, Class<? extends IResponse> responseClazz);


    ResponseEntity<String> exchange(String url, HttpMethod method, Map<String, Object> queryParams, IRequest payload);
}
