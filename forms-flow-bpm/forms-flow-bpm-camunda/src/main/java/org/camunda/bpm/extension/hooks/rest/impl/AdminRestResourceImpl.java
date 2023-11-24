package org.camunda.bpm.extension.hooks.rest.impl;

import org.camunda.bpm.extension.hooks.controllers.data.AuthorizationInfo;
import org.camunda.bpm.extension.hooks.controllers.data.TenantAuthorizationDto;
import org.camunda.bpm.extension.hooks.rest.AdminRestResource;
import org.camunda.bpm.extension.hooks.rest.service.AdminRestService;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.ServletException;
import jakarta.ws.rs.core.UriInfo;


@Component
public class AdminRestResourceImpl implements AdminRestResource {

    private final AdminRestService restService;

    public AdminRestResourceImpl(AdminRestService adminRestService) {
        restService = adminRestService;
    }

    @Override
    public AuthorizationInfo getFormAuthorization() throws ServletException {
        return restService.getFormAuthorization();
    }

    @Override
    public void createTenant(TenantAuthorizationDto dto) throws ServletException {
        restService.createTenant(dto);
    }

    @Override
    public void createTenantDeployment(UriInfo context, String tenantKey, MultipartFile file) throws ServletException {
        restService.createTenantDeployment(tenantKey, file);
    }

}
