package org.camunda.bpm.extension.hooks.rest;

import org.camunda.bpm.engine.rest.dto.authorization.AuthorizationDto;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.UriInfo;
import java.util.List;

@Produces(MediaType.APPLICATION_JSON)
public interface AuthorizationRestResource extends RestResource{

    String PATH = "/authorization";

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    List<AuthorizationDto> queryAuthorizations(@Context UriInfo uriInfo,
                                               @QueryParam("firstResult") Integer firstResult,
                                               @QueryParam("maxResults") Integer maxResults);
}
