package org.camunda.bpm.extension.hooks.rest.impl;

import org.camunda.bpm.engine.rest.UserRestService;
import org.camunda.bpm.engine.rest.dto.identity.UserProfileDto;
import org.camunda.bpm.extension.hooks.rest.UserRestResource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.hateoas.CollectionModel;

import javax.ws.rs.core.UriInfo;
import java.util.List;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

public class UserRestResourceImpl implements UserRestResource {

    private static final Logger LOG = LoggerFactory.getLogger(UserRestResourceImpl.class);

    private static UserRestService restService;

    public UserRestResourceImpl(UserRestService restService) {
        this.restService = restService;
    }

    @Override
    public List<UserProfileDto> queryUsers(
            UriInfo uriInfo, Integer firstResult, Integer maxResults) {

        return restService.queryUsers(uriInfo, firstResult, maxResults);
    }
}
