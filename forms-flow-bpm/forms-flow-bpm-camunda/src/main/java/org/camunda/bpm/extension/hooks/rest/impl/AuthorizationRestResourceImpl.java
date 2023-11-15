package org.camunda.bpm.extension.hooks.rest.impl;

import org.camunda.bpm.engine.rest.AuthorizationRestService;
import org.camunda.bpm.engine.rest.dto.authorization.AuthorizationDto;
import org.camunda.bpm.extension.hooks.rest.AuthorizationRestResource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ws.rs.core.UriInfo;
import java.util.List;

public class AuthorizationRestResourceImpl implements AuthorizationRestResource {

    private final AuthorizationRestService restService;

    private static final Logger LOG = LoggerFactory.getLogger(FilterRestResourceImpl.class);

    public AuthorizationRestResourceImpl(AuthorizationRestService restService) {
        this.restService = restService;
    }

    @Override
    public List<AuthorizationDto> queryAuthorizations(UriInfo uriInfo, Integer firstResult, Integer maxResults) {
        return restService.queryAuthorizations(uriInfo, firstResult, maxResults);
    }
}
