package org.camunda.bpm.extension.hooks.rest;

import org.camunda.bpm.engine.rest.dto.CountResultDto;
import org.camunda.bpm.engine.rest.dto.repository.DecisionDefinitionDiagramDto;
import org.camunda.bpm.engine.rest.dto.repository.DecisionDefinitionDto;
import org.springframework.hateoas.EntityModel;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.UriInfo;
import java.util.List;

@Produces({MediaType.APPLICATION_JSON})
public interface DecisionDefinitionRestResource extends RestResource {

    String PATH = "/decision-definition";

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    List<DecisionDefinitionDto> getDecisionDefinitions(@Context UriInfo uriInfo,
                                                       @QueryParam("firstResult") Integer firstResult,
                                                       @QueryParam("maxResults") Integer maxResults);

    @GET
    @Path("/key/{key}")
    @Produces(MediaType.APPLICATION_JSON)
    DecisionDefinitionDto getDecisionDefinition(@PathParam("key") String key);

    @GET
    @Path("/key/{key}/xml")
    @Produces(MediaType.APPLICATION_JSON)
    DecisionDefinitionDiagramDto getDecisionDefinitionDmnXml(@QueryParam("tenantId") String tenantId, @PathParam("key") String key);

    @GET
    @Path("/count")
    @Produces(MediaType.APPLICATION_JSON)
    CountResultDto getDecisionDefinitionsCount(@Context UriInfo uriInfo);
}
