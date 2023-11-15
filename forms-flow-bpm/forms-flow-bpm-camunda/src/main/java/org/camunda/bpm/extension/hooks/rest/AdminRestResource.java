package org.camunda.bpm.extension.hooks.rest;

import org.camunda.bpm.extension.hooks.controllers.data.AuthorizationInfo;
import org.camunda.bpm.extension.hooks.controllers.data.TenantAuthorizationDto;
import org.springframework.hateoas.EntityModel;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.ServletException;
import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.UriInfo;

@Produces({MediaType.APPLICATION_JSON})
public interface AdminRestResource extends RestResource {

    String PATH = "/admin";

    @GET
    @Path("/form/authorization")
    @Produces({MediaType.APPLICATION_JSON})
    EntityModel<AuthorizationInfo> getFormAuthorization() throws ServletException;

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
