package org.camunda.bpm.extension.hooks.rest.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import org.camunda.bpm.extension.hooks.rest.TaskFilterRestResource;
import org.camunda.bpm.extension.hooks.rest.dto.TaskQueryDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import javax.ws.rs.core.Request;

@Component
public class TaskFilterRestResourceImpl implements TaskFilterRestResource {

    private static final Logger LOG = LoggerFactory.getLogger(TaskFilterRestResourceImpl.class);

    private final org.camunda.bpm.extension.hooks.rest.service.TaskFilterRestService restService;

    public TaskFilterRestResourceImpl(org.camunda.bpm.extension.hooks.rest.service.TaskFilterRestService taskFilterRestService) {
        restService = taskFilterRestService;
    }

    @Override
    public Object queryList(Request request, TaskQueryDto extendingQuery, Integer firstResult, Integer maxResults) throws JsonProcessingException {
        return restService.queryList(request, extendingQuery, firstResult, maxResults);
    }
}
