package org.camunda.bpm.extension.hooks.rest;

import org.camunda.bpm.extension.hooks.controllers.data.AuthorizationInfo;
import org.camunda.bpm.extension.hooks.controllers.data.TenantAuthorizationDto;
import org.springframework.hateoas.EntityModel;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.ws.rs.core.MediaType;

import javax.servlet.ServletException;

public interface AdminRestResource extends RestResource{

    String PATH = "";

    @GetMapping(value = "/form/authorization", produces = MediaType.APPLICATION_JSON)
    EntityModel<AuthorizationInfo> getFormAuthorization() throws ServletException;

    @PostMapping(value = "/tenant/authorization", produces = MediaType.APPLICATION_JSON)
    void createTenant(@RequestBody TenantAuthorizationDto dto) throws ServletException;

    @PostMapping(value = "/tenant/{tenantKey}/deployment", produces = MediaType.APPLICATION_JSON, consumes = MediaType.MULTIPART_FORM_DATA )
    void createTenantDeployment(@PathVariable("tenantKey") String tenantKey,
                                @RequestParam("file") MultipartFile file) throws ServletException;
}
