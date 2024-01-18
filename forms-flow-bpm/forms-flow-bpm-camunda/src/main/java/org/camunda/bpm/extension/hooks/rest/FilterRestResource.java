package org.camunda.bpm.extension.hooks.rest;

import org.camunda.bpm.engine.rest.dto.CountResultDto;
import org.camunda.bpm.engine.rest.dto.runtime.FilterDto;
import org.camunda.bpm.engine.rest.hal.Hal;
import org.springframework.hateoas.EntityModel;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.UriInfo;
import jakarta.ws.rs.core.Request;

import java.util.List;

@Produces(MediaType.APPLICATION_JSON)
public interface FilterRestResource extends RestResource {

    String PATH = "/filter";

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    List<FilterDto> getFilters(@Context UriInfo uriInfo, @QueryParam("itemCount") Boolean itemCount,
                                          @QueryParam("firstResult") Integer firstResult, @QueryParam("maxResults") Integer maxResults);

    @GET
    @Path("/{id}/list")
    @Produces({MediaType.APPLICATION_JSON, Hal.APPLICATION_HAL_JSON})
    Object executeList(@Context Request request, @QueryParam("firstResult") Integer firstResult, @QueryParam("maxResults") Integer maxResults, @PathParam("id") String id);

    @POST
    @Path("/{id}/list")
    @Produces({MediaType.APPLICATION_JSON, Hal.APPLICATION_HAL_JSON})
    @Consumes(MediaType.APPLICATION_JSON)
    Object queryList(@Context Request request, String extendingQuery,
                     @QueryParam("firstResult") Integer firstResult, @QueryParam("maxResults") Integer maxResults, @PathParam("id") String id);

    @GET
    @Path("/{id}/count")
    @Produces(MediaType.APPLICATION_JSON)
    CountResultDto executeCount(@PathParam("id") String id);

}
