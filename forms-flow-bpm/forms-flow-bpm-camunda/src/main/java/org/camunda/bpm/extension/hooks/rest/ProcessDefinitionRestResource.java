package org.camunda.bpm.extension.hooks.rest;

import org.bpm.utils.dto.ProcessDefinitionDiagramDto;
import org.bpm.utils.dto.ProcessInstanceDto;
import org.bpm.utils.dto.ProcessDefinitionDto;
import org.bpm.utils.dto.StartProcessInstanceDto;
import org.camunda.bpm.engine.rest.dto.CountResultDto;

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
    ProcessDefinitionDto getProcessDefinition(@PathParam("key") String key);

    @GET
    @Path("/key/{key}/xml")
    @Produces(MediaType.APPLICATION_JSON)
    ProcessDefinitionDiagramDto getProcessDefinitionBpmn20Xml(@QueryParam("tenantId") String tenantId, @PathParam("key") String key);

    @POST
    @Path("/key/{key}/start")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    ProcessInstanceDto startProcessInstanceByKey(
            @Context UriInfo context, StartProcessInstanceDto parameters, @PathParam("key") String key, @QueryParam("tenantId") String tenantId);

    @GET
    @Path("/count")
    @Produces(MediaType.APPLICATION_JSON)
    CountResultDto getProcessDefinitionsCount(@Context UriInfo uriInfo);
}
