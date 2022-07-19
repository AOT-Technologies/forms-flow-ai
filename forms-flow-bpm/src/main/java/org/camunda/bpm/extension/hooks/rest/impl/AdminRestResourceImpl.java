package org.camunda.bpm.extension.hooks.rest.impl;

import org.camunda.bpm.extension.hooks.controllers.data.AuthorizationInfo;
import org.camunda.bpm.extension.hooks.controllers.data.TenantAuthorizationDto;
import org.camunda.bpm.extension.hooks.rest.AdminRestResource;
import org.camunda.bpm.extension.hooks.rest.service.AdminRestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.hateoas.EntityModel;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Mono;

import javax.inject.Inject;
import javax.servlet.ServletException;
import javax.ws.rs.core.UriInfo;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

@Component
public class AdminRestResourceImpl implements AdminRestResource {

    private final AdminRestService adminRestService;

    public AdminRestResourceImpl(AdminRestService adminRestService){
        this.adminRestService = adminRestService;
    }

    @Override
    public EntityModel<AuthorizationInfo> getFormAuthorization() throws ServletException {

        Mono<ResponseEntity<AuthorizationInfo>> response = adminRestService.getFormAuthorization();

        return EntityModel.of(response.block().getBody(),
                linkTo(methodOn(AdminRestResourceImpl.class).getFormAuthorization()).withSelfRel());
    }

    @Override
    public void createTenant(TenantAuthorizationDto dto) throws ServletException {

        adminRestService.createTenant(dto);
    }

    @Override
    public void createTenantDeployment(UriInfo context, String tenantKey, MultipartFile file) throws ServletException {
        adminRestService.createTenantDeployment(tenantKey, file);
    }

}
