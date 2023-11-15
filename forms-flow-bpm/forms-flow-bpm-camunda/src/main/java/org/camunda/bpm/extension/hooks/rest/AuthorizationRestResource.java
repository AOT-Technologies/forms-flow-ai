package org.camunda.bpm.extension.hooks.rest;

import org.camunda.bpm.engine.rest.dto.authorization.AuthorizationDto;

import javax.ws.rs.GET;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.UriInfo;
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
