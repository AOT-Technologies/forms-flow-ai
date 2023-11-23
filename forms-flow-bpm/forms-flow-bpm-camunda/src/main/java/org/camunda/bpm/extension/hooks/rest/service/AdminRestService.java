package org.camunda.bpm.extension.hooks.rest.service;

import org.camunda.bpm.extension.hooks.controllers.data.AuthorizationInfo;
import org.camunda.bpm.extension.hooks.controllers.data.TenantAuthorizationDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Mono;
import jakarta.servlet.ServletException;

public interface AdminRestService {

    AuthorizationInfo getFormAuthorization() throws ServletException;

    void createTenant(TenantAuthorizationDto dto) throws ServletException;

    void createTenantDeployment(String tenantKey, MultipartFile file) throws ServletException;
}
