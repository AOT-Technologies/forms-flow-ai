package org.camunda.bpm.extension.hooks.rest;

import jakarta.ws.rs.*;
import org.camunda.bpm.engine.rest.dto.repository.DeploymentDto;
import org.camunda.bpm.engine.rest.dto.repository.DeploymentResourceDto;
import org.camunda.bpm.engine.rest.mapper.MultipartFormData;

import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.UriInfo;
import jakarta.ws.rs.core.Response;
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
    DeploymentDto createDeployment(@Context UriInfo uriInfo, MultipartFormData multipartFormData);

    @GET
    @Path("/{id}/resources")
    @Produces(MediaType.APPLICATION_JSON)
    List<DeploymentResourceDto> getDeploymentResources(@PathParam("id") String id);

    @GET
    @Path("/{id}/resources/{resourceId}/data")
    Response getDeploymentResourceData(@PathParam("id") String id, @PathParam("resourceId") String resourceId);

    @DELETE
    @Path("/{id}")
    void deleteDeployment(@PathParam("id") String id, @Context UriInfo uriInfo);

}
