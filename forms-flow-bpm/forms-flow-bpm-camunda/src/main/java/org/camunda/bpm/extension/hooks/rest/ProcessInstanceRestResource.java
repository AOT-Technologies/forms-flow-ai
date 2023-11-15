package org.camunda.bpm.extension.hooks.rest;

import java.util.Map;

import javax.ws.rs.DefaultValue;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;

import org.camunda.bpm.engine.rest.dto.VariableValueDto;
import org.springframework.hateoas.EntityModel;

@Produces(MediaType.APPLICATION_JSON)
public interface ProcessInstanceRestResource extends RestResource {

    String PATH = "/process-instance";
    
    public final static String DESERIALIZE_VALUE_QUERY_PARAM = "deserializeValue";

    @GET
    @Path("/{id}/activity-instances")
    @Produces(MediaType.APPLICATION_JSON)
    EntityModel<org.camunda.bpm.engine.rest.dto.runtime.ActivityInstanceDto> getActivityInstanceTree(@PathParam("id") String id);
    
    @GET
    @Path("/{id}/variables")
    @Produces(MediaType.APPLICATION_JSON)
    Map<String, VariableValueDto> getVariables(@QueryParam(DESERIALIZE_VALUE_QUERY_PARAM) @DefaultValue("true") boolean deserializeValues, @PathParam("id") String id);

}
