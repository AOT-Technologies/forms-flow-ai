package org.camunda.bpm.extension.hooks.rest;

import com.fasterxml.jackson.core.JsonProcessingException;
import org.camunda.bpm.engine.rest.dto.identity.UserProfileDto;
import org.camunda.bpm.engine.rest.hal.Hal;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.UriInfo;
import java.util.List;

@Produces(MediaType.APPLICATION_JSON)
public interface UserRestResource extends RestResource {

    String PATH = "/user";

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    List<UserProfileDto> queryUsers(
            @Context UriInfo uriInfo, @QueryParam("firstResult") Integer firstResult, @QueryParam("maxResults") Integer maxResults) throws JsonProcessingException;
}
