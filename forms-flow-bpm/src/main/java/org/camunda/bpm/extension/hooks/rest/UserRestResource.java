package org.camunda.bpm.extension.hooks.rest;

import org.camunda.bpm.engine.rest.dto.identity.UserProfileDto;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.UriInfo;
import java.util.List;

@RequestMapping(RestResource.BASE_PATH+TaskRestResource.PATH)
public interface UserRestResource extends RestResource{

    String PATH = "/v1/user";

    @GetMapping(produces = MediaType.APPLICATION_JSON)
    List<UserProfileDto> queryUsers(@Context UriInfo uriInfo,
                                    @QueryParam("firstResult") Integer firstResult, @QueryParam("maxResults") Integer maxResults);
}
