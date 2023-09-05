package org.camunda.bpm.extension.hooks.rest;

import com.fasterxml.jackson.core.JsonProcessingException;

import org.camunda.bpm.engine.rest.dto.CountResultDto;
import org.camunda.bpm.engine.rest.hal.Hal;
import org.camunda.bpm.extension.hooks.rest.dto.TaskQueryDto;
import org.springframework.hateoas.CollectionModel;
import org.springframework.hateoas.EntityModel;

import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Request;
import javax.ws.rs.core.UriInfo;
import java.util.List;
import java.util.Map;

@Produces(MediaType.APPLICATION_JSON)
public interface TaskFilterRestResource {

    String PATH = "/task-filters";
    @POST
    @Produces({MediaType.APPLICATION_JSON, Hal.APPLICATION_HAL_JSON})
    @Consumes(MediaType.APPLICATION_JSON)
    Object queryList(@Context Request request, TaskQueryDto extendingQuery, @QueryParam("firstResult") Integer firstResult, @QueryParam("maxResults") Integer maxResults) throws JsonProcessingException;

    @POST
    @Path("/count")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    List<Map<String, Object>> queryCount(List<TaskQueryDto> filterQuery);

    @GET
    @Path("/count")
    @Produces(MediaType.APPLICATION_JSON)
    EntityModel<CountResultDto> getFiltersCount(@Context UriInfo uriInfo);

}