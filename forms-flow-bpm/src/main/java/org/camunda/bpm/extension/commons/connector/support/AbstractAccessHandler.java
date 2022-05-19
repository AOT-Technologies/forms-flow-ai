package org.camunda.bpm.extension.commons.connector.support;

import org.camunda.bpm.extension.commons.ro.req.IRequest;
import org.camunda.bpm.extension.commons.ro.res.IResponse;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;

import java.util.Map;

public abstract class AbstractAccessHandler implements IAccessHandler{
    @Override
    public ResponseEntity<String> exchange(String url, HttpMethod method, String payload) {
        return null;
    }

    @Override
    public ResponseEntity<IResponse> exchange(String url, HttpMethod method, IRequest payload, Class<? extends IResponse> responseClazz) {
        return null;
    }

    @Override
    public ResponseEntity<String> exchange(String url, HttpMethod method, Map<String, Object> queryParams, IRequest payload) {
        return null;
    }
}
