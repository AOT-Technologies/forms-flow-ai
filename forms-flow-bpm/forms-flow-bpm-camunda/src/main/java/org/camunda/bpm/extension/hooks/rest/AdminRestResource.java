package org.camunda.bpm.extension.hooks.rest;

import org.camunda.bpm.extension.hooks.controllers.data.AuthorizationInfo;
import org.camunda.bpm.extension.hooks.controllers.data.TenantAuthorizationDto;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.ServletException;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.UriInfo;

@Produces({MediaType.APPLICATION_JSON})
public interface AdminRestResource extends RestResource {

    String PATH = "/admin";

    @GET
    @Path("/form/authorization")
    @Produces({MediaType.APPLICATION_JSON})
    AuthorizationInfo getFormAuthorization() throws ServletException;

    @POST
    @Path("/tenant/authorization")
    @Produces({MediaType.APPLICATION_JSON})
    void createTenant(TenantAuthorizationDto dto) throws ServletException;

    @POST
    @Path(value = "/tenant/{tenantKey}/deployment")
    @Consumes({MediaType.MULTIPART_FORM_DATA})
    @Produces({MediaType.APPLICATION_JSON})
    void createTenantDeployment(
            @Context UriInfo context, @PathParam("tenantKey") String tenantKey, @RequestParam("file") MultipartFile file) throws ServletException;
}
