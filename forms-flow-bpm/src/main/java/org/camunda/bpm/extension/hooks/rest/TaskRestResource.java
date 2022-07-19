package org.camunda.bpm.extension.hooks.rest;

import org.camunda.bpm.extension.hooks.rest.dto.CountResultDto;
import org.springframework.http.ResponseEntity;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.UriInfo;

@Produces({MediaType.APPLICATION_JSON})
public interface TaskRestResource extends RestResource {

    String PATH = "/task";

    @GET
    @Path("/count")
    @Produces({MediaType.APPLICATION_JSON})
    ResponseEntity<CountResultDto> getTasksCount(@Context UriInfo uriInfo);
}
