package org.camunda.bpm.extension.hooks.rest;

import com.fasterxml.jackson.core.JsonProcessingException;
import org.camunda.bpm.engine.rest.dto.identity.UserProfileDto;
import org.springframework.hateoas.CollectionModel;

import javax.ws.rs.GET;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.UriInfo;

@Produces({MediaType.APPLICATION_JSON})
public interface UserRestResource extends RestResource {

    String PATH = "/user";

    @GET
    @Produces({MediaType.APPLICATION_JSON})
    CollectionModel<UserProfileDto> queryUsers(
            @Context UriInfo uriInfo, @QueryParam("firstResult") Integer firstResult, @QueryParam("maxResults") Integer maxResults) throws JsonProcessingException;
}
