package org.camunda.bpm.extension.hooks.rest;

import java.util.Map;

import jakarta.ws.rs.DefaultValue;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import org.camunda.bpm.engine.rest.dto.runtime.ActivityInstanceDto;
import org.camunda.bpm.engine.rest.dto.VariableValueDto;
import org.springframework.hateoas.EntityModel;

@Produces(MediaType.APPLICATION_JSON)
public interface ProcessInstanceRestResource extends RestResource {

    String PATH = "/process-instance";
    
    public final static String DESERIALIZE_VALUE_QUERY_PARAM = "deserializeValue";

    @GET
    @Path("/{id}/activity-instances")
    @Produces(MediaType.APPLICATION_JSON)
    ActivityInstanceDto getActivityInstanceTree(@PathParam("id") String id);
    
    @GET
    @Path("/{id}/variables")
    @Produces(MediaType.APPLICATION_JSON)
    Map<String, VariableValueDto> getVariables(@QueryParam(DESERIALIZE_VALUE_QUERY_PARAM) @DefaultValue("true") boolean deserializeValues, @PathParam("id") String id);

}
