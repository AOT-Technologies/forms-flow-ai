package org.camunda.bpm.extension.hooks.rest;

import org.camunda.bpm.engine.rest.dto.repository.DeploymentDto;
import org.camunda.bpm.engine.rest.dto.repository.DeploymentResourceDto;
import org.camunda.bpm.engine.rest.mapper.MultipartFormData;
import org.springframework.hateoas.EntityModel;

import javax.ws.rs.Consumes;
import javax.ws.rs.Path;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.UriInfo;
import javax.ws.rs.core.Response;
import java.util.List;

@Produces(MediaType.APPLICATION_JSON)
public interface DeploymentRestResource extends RestResource {

    String PATH = "/deployment";

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    List<DeploymentDto> getDeployments(@Context UriInfo uriInfo,
                                       @QueryParam("firstResult") Integer firstResult,
                                       @QueryParam("maxResults") Integer maxResults);

    @POST
    @Path("/create")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.APPLICATION_JSON)
    EntityModel<DeploymentDto> createDeployment(@Context UriInfo uriInfo, MultipartFormData multipartFormData);

    @GET
    @Path("/{id}/resources")
    @Produces(MediaType.APPLICATION_JSON)
    List<DeploymentResourceDto> getDeploymentResources(@PathParam("id") String id);

    @GET
    @Path("/{id}/resources/{resourceId}/data")
    Response getDeploymentResourceData(@PathParam("id") String id, @PathParam("resourceId") String resourceId);

}
