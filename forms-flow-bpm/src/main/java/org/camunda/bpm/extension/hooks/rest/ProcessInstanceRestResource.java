package org.camunda.bpm.extension.hooks.rest;

import org.springframework.hateoas.EntityModel;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

@Produces(MediaType.APPLICATION_JSON)
public interface ProcessInstanceRestResource extends RestResource {

    String PATH = "/process-instance";

    @GET
    @Path("/{id}/activity-instances")
    @Produces(MediaType.APPLICATION_JSON)
    EntityModel<org.camunda.bpm.engine.rest.dto.runtime.ActivityInstanceDto> getActivityInstanceTree(@PathParam("id") String id);

}
