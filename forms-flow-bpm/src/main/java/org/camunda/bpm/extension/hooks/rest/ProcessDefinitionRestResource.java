package org.camunda.bpm.extension.hooks.rest;

import org.camunda.bpm.engine.rest.dto.repository.ProcessDefinitionDiagramDto;
import org.camunda.bpm.engine.rest.dto.repository.ProcessDefinitionDto;
import org.camunda.bpm.engine.rest.dto.runtime.ProcessInstanceDto;
import org.camunda.bpm.engine.rest.dto.runtime.StartProcessInstanceDto;
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
import java.util.List;

@Produces({MediaType.APPLICATION_JSON})
public interface ProcessDefinitionRestResource extends RestResource{

    String PATH = "/process-definition";

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    List<ProcessDefinitionDto> getProcessDefinitions(@Context UriInfo uriInfo, @QueryParam("firstResult") Integer firstResult, @QueryParam("maxResults") Integer maxResults);

    @GET
    @Path("/key/{key}")
    @Produces(MediaType.APPLICATION_JSON)
    EntityModel<ProcessDefinitionDto> getProcessDefinition(@PathParam("key") String key);

    @GET
    @Path("/key/{key}/xml")
    @Produces(MediaType.APPLICATION_JSON)
    EntityModel<ProcessDefinitionDiagramDto> getProcessDefinitionBpmn20Xml(@QueryParam("tenantId") String tenantId, @PathParam("key") String key);

    @POST
    @Path("/key/{key}/start")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    EntityModel<ProcessInstanceDto> startProcessInstanceByKey(
            @Context UriInfo context, StartProcessInstanceDto parameters, @PathParam("key") String key, @QueryParam("tenantId") String tenantId);
}
