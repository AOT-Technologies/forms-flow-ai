package org.camunda.bpm.extension.hooks.rest.impl;

import org.camunda.bpm.extension.hooks.controllers.data.AuthorizationInfo;
import org.camunda.bpm.extension.hooks.controllers.data.TenantAuthorizationDto;
import org.camunda.bpm.extension.hooks.rest.AdminRestResource;
import org.camunda.bpm.extension.hooks.rest.RestResource;
import org.camunda.bpm.extension.hooks.rest.service.AdminRestService;
import org.springframework.hateoas.EntityModel;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.ServletException;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

@RestController
@RequestMapping(RestResource.BASE_PATH+"/v1"+ AdminRestResource.PATH)
public class AdminRestResourceImpl implements AdminRestResource {

    private final AdminRestService restService;

    public AdminRestResourceImpl(AdminRestService adminRestService){
        this.restService = adminRestService;
    }

    @Override
    public EntityModel<AuthorizationInfo> getFormAuthorization() throws ServletException {

        ResponseEntity<AuthorizationInfo> response = restService.getFormAuthorization();

        return EntityModel.of(response.getBody(),
                linkTo(methodOn(AdminRestResourceImpl.class).getFormAuthorization()).withSelfRel());
    }

    @Override
    public void createTenant(TenantAuthorizationDto dto) throws ServletException {

        restService.createTenant(dto);
    }

    @Override
    public void createTenantDeployment(String tenantKey, MultipartFile file) throws ServletException {

        restService.createTenantDeployment(tenantKey, file);
    }
}
