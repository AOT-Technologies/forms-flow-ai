package org.camunda.bpm.extension.hooks.rest;

import org.camunda.bpm.engine.rest.dto.CountResultDto;
import org.camunda.bpm.engine.rest.dto.runtime.FilterDto;
import org.camunda.bpm.engine.rest.hal.Hal;
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
import javax.ws.rs.core.Request;

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
    EntityModel<CountResultDto> executeCount(@PathParam("id") String id);

}
