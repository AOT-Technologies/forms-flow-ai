package org.camunda.bpm.extension.hooks.rest.impl;

import com.fasterxml.jackson.core.JsonProcessingException;

import org.camunda.bpm.engine.rest.dto.CountResultDto;
import org.camunda.bpm.extension.hooks.rest.TaskFilterRestResource;
import org.camunda.bpm.extension.hooks.rest.dto.TaskQueryDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.hateoas.CollectionModel;
import org.springframework.hateoas.EntityModel;
import org.springframework.stereotype.Component;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

import javax.ws.rs.core.Request;
import javax.ws.rs.core.UriInfo;
import java.util.List;
import java.util.Map;

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

    @Override
    public List<Map<String, Object>> queryCount(List<TaskQueryDto> filterQuery) {
        return restService.queryCount(filterQuery);
    }

    @Override
    public EntityModel<CountResultDto> getFiltersCount(UriInfo uriInfo) {
        CountResultDto dto = restService.getFiltersCount(uriInfo);
        return EntityModel.of(dto,
                linkTo(methodOn(TaskFilterRestResourceImpl.class).getFiltersCount(uriInfo)).withSelfRel());
    }
}