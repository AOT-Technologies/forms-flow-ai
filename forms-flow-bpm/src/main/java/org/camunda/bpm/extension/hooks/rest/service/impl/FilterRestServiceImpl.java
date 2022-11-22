package org.camunda.bpm.extension.hooks.rest.service.impl;

import java.util.ArrayList;
import java.util.List;

import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Request;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Variant;

import org.camunda.bpm.engine.ProcessEngine;
import org.camunda.bpm.engine.query.Query;
import org.camunda.bpm.engine.rest.dto.task.TaskDto;
import org.camunda.bpm.engine.rest.exception.InvalidRequestException;
import org.camunda.bpm.engine.rest.hal.Hal;
import org.camunda.bpm.engine.rest.hal.task.HalTaskList;
import org.camunda.bpm.engine.task.Task;
import org.camunda.bpm.extension.hooks.rest.dto.TaskQueryDto;
import org.camunda.bpm.extension.hooks.rest.service.FilterRestService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;

public class FilterRestServiceImpl implements FilterRestService {
    
    private static final Logger LOGGER = LoggerFactory.getLogger(FilterRestServiceImpl.class);
    
    public static final List<Variant> VARIANTS = Variant.mediaTypes(MediaType.APPLICATION_JSON_TYPE, Hal.APPLICATION_HAL_JSON_TYPE).add().build();
    private final ObjectMapper objectMapper;
    private final ProcessEngine processEngine;

    public FilterRestServiceImpl(ObjectMapper objectMapper, ProcessEngine processEngine) {
        this.objectMapper = objectMapper;
        this.processEngine = processEngine;
    }

    @Override
    public Object queryList(Request request, TaskQueryDto filterQuery, Integer firstResult, Integer maxResults) throws JsonProcessingException {
        return executeQueryList(request, filterQuery, firstResult, maxResults);

    }

    private Object executeQueryList(Request request, TaskQueryDto filterQuery, Integer firstResult, Integer maxResults) throws JsonProcessingException {
        if (firstResult == null) {
            firstResult = 0;
        }
        if (maxResults == null) {
            maxResults = Integer.MAX_VALUE;
        }
        return executeList(request, executeQuery(filterQuery.getCriteria()), firstResult, maxResults);
    }

    private Query executeQuery(org.camunda.bpm.engine.rest.dto.task.TaskQueryDto extendingQuery) throws JsonProcessingException {
        objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        extendingQuery.setObjectMapper(objectMapper);
        return extendingQuery.toQuery(processEngine);
    }

    private Object executeList(Request request, Query query, Integer firstResult, Integer maxResults) {
        Variant variant = request.selectVariant(VARIANTS);
        if (variant != null) {
            if (MediaType.APPLICATION_JSON_TYPE.equals(variant.getMediaType())) {
                return queryJsonList(query);
            } else if (Hal.APPLICATION_HAL_JSON_TYPE.equals(variant.getMediaType())) {
                return queryHalList(query, firstResult, maxResults);
            }
        }
        throw new InvalidRequestException(Response.Status.NOT_ACCEPTABLE, "No acceptable content-type found");
    }

    private Object queryHalList(Query query, Integer firstResult, Integer maxResults) {
        List<Task> entities = query.listPage(firstResult, maxResults);
        return HalTaskList.generate(entities, query.count(), processEngine);
    }

    public List<Object> queryJsonList(Query query) {
        List<?> entities = query.list();
        List<Object> dtoList = new ArrayList<>();
        for (Object entity : entities) {
            dtoList.add(TaskDto.fromEntity((Task) entity));
        }
        return dtoList;
    }

}

