package org.camunda.bpm.extension.hooks.rest.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.camunda.bpm.engine.ProcessEngine;
import org.camunda.bpm.engine.impl.AbstractQuery;
import org.camunda.bpm.engine.query.Query;
import org.camunda.bpm.engine.rest.dto.AbstractQueryDto;
import org.camunda.bpm.engine.rest.dto.task.TaskDto;
import org.camunda.bpm.engine.rest.exception.InvalidRequestException;
import org.camunda.bpm.engine.rest.hal.Hal;
import org.camunda.bpm.engine.rest.hal.task.HalTaskList;
import org.camunda.bpm.engine.task.Task;
import org.camunda.bpm.engine.task.TaskQuery;
import org.camunda.bpm.extension.hooks.rest.dto.TaskQueryDto;
import org.camunda.bpm.extension.hooks.rest.service.FilterRestService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Request;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Variant;
import java.util.ArrayList;
import java.util.List;

public class FilterRestServiceImpl implements FilterRestService {
    public static final List<Variant> VARIANTS = Variant.mediaTypes(MediaType.APPLICATION_JSON_TYPE, Hal.APPLICATION_HAL_JSON_TYPE).add().build();
    private static final Logger LOGGER = LoggerFactory.getLogger(FilterRestServiceImpl.class);
    private final ObjectMapper objectMapper;
    private final ProcessEngine processEngine;

    public FilterRestServiceImpl(ObjectMapper objectMapper, ProcessEngine processEngine) {
        this.objectMapper = objectMapper;
        this.processEngine = processEngine;
    }

    @Override
    public Object queryList(Request request, String extendingQuery, Integer firstResult, Integer maxResults) throws JsonProcessingException {
        return executeQueryList(request, extendingQuery, firstResult, maxResults);

    }

    private Object executeQueryList(Request request, String extendingQuery, Integer firstResult, Integer maxResults) throws JsonProcessingException {
        if (firstResult == null) {
            firstResult = 0;
        }
        if (maxResults == null) {
            maxResults = Integer.MAX_VALUE;
        }
//        ((TaskQuery) query).initializeFormKeys();
//        ((AbstractQuery) query).enableMaxResultsLimit();
        return executeList(request, executeQuery(extendingQuery), firstResult, maxResults);
    }

    private Query executeQuery(String extendingQuery) throws JsonProcessingException {
        objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        AbstractQueryDto<?> queryDto = objectMapper.readValue(extendingQuery, TaskQueryDto.class);
        queryDto.setObjectMapper(objectMapper);
        return queryDto.toQuery(processEngine);
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

