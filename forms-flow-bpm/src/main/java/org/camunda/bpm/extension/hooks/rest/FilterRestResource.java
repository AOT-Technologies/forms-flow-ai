package org.camunda.bpm.extension.hooks.rest;

import com.fasterxml.jackson.core.JsonProcessingException;
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

    @POST
    @Path("/tasks")
    @Produces({MediaType.APPLICATION_JSON, Hal.APPLICATION_HAL_JSON})
    @Consumes(MediaType.APPLICATION_JSON)
    Object queryList(@Context Request request, String extendingQuery, @QueryParam("firstResult") Integer firstResult, @QueryParam("maxResults") Integer maxResults) throws JsonProcessingException;


}
