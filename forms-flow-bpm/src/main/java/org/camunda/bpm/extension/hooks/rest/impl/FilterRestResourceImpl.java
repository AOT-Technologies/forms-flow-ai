package org.camunda.bpm.extension.hooks.rest.impl;

import javax.ws.rs.core.Request;

import org.camunda.bpm.extension.hooks.rest.FilterRestResource;
import org.camunda.bpm.extension.hooks.rest.dto.TaskQueryDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonProcessingException;

@Component
public class FilterRestResourceImpl implements FilterRestResource {

    private static final Logger LOG = LoggerFactory.getLogger(FilterRestResourceImpl.class);

    private final org.camunda.bpm.extension.hooks.rest.service.FilterRestService restService;

    public FilterRestResourceImpl(org.camunda.bpm.extension.hooks.rest.service.FilterRestService filterRestService) {
        restService = filterRestService;
    }

    @Override
    public Object queryList(Request request, TaskQueryDto extendingQuery, Integer firstResult, Integer maxResults) throws JsonProcessingException {
        return restService.queryList(request, extendingQuery, firstResult, maxResults);
    }


}
