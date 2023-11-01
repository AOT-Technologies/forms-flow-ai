package org.camunda.bpm.extension.hooks.rest;

import org.bpm.utils.dto.ProcessDefinitionDiagramDto;
import org.bpm.utils.dto.ProcessInstanceDto;
import org.bpm.utils.dto.ProcessDefinitionDto;
import org.bpm.utils.dto.StartProcessInstanceDto;
import org.camunda.bpm.engine.rest.dto.CountResultDto;

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
