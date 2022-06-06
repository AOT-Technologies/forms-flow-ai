package org.camunda.bpm.extension.commons.connector.support;

import org.camunda.bpm.extension.commons.ro.req.IRequest;
import org.camunda.bpm.extension.commons.ro.res.IResponse;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import java.util.Map;

public abstract class AbstractAccessHandler implements IAccessHandler{

    String getUserBasedAccessToken() {

        String token = null;
        Authentication authentication =  SecurityContextHolder.getContext().getAuthentication();

        if (authentication instanceof JwtAuthenticationToken) {
            token = ((JwtAuthenticationToken)authentication).getToken().getTokenValue();
        }
        return token;
    }

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
