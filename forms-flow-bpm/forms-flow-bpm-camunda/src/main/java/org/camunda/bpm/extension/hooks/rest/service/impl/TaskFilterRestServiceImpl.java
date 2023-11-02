package org.camunda.bpm.extension.hooks.rest.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.camunda.bpm.engine.ProcessEngine;
import org.camunda.bpm.engine.filter.FilterQuery;
import org.camunda.bpm.engine.impl.VariableInstanceQueryImpl;
import org.camunda.bpm.engine.impl.persistence.entity.VariableInstanceEntity;
import org.camunda.bpm.engine.query.Query;
import org.camunda.bpm.engine.rest.dto.CountResultDto;
import org.camunda.bpm.engine.rest.dto.runtime.FilterQueryDto;
import org.camunda.bpm.engine.rest.dto.task.TaskDto;
import org.camunda.bpm.engine.rest.exception.InvalidRequestException;
import org.camunda.bpm.engine.rest.hal.Hal;
import org.camunda.bpm.engine.rest.hal.HalResource;
import org.camunda.bpm.engine.rest.hal.HalVariableValue;
import org.camunda.bpm.engine.rest.hal.identitylink.HalIdentityLink;
import org.camunda.bpm.engine.rest.hal.task.HalTask;
import org.camunda.bpm.engine.rest.hal.task.HalTaskList;
import org.camunda.bpm.engine.runtime.VariableInstance;
import org.camunda.bpm.engine.task.IdentityLink;
import org.camunda.bpm.engine.task.Task;
import org.camunda.bpm.engine.task.TaskQuery;
import org.camunda.bpm.extension.hooks.rest.dto.TaskFilterResponse;
import org.camunda.bpm.extension.hooks.rest.dto.TaskFilterVariableQueryDto;
import org.camunda.bpm.extension.hooks.rest.dto.TaskQueryDto;
import org.camunda.bpm.extension.hooks.rest.service.TaskFilterRestService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ws.rs.core.*;
import java.util.*;

public class TaskFilterRestServiceImpl implements TaskFilterRestService {

    public static final List<Variant> VARIANTS = Variant.mediaTypes(MediaType.APPLICATION_JSON_TYPE, Hal.APPLICATION_HAL_JSON_TYPE).add().build();

    private static final Logger LOGGER = LoggerFactory.getLogger(TaskFilterRestServiceImpl.class);

    private final ObjectMapper objectMapper;

    private final ProcessEngine processEngine;


    public TaskFilterRestServiceImpl(ObjectMapper objectMapper, ProcessEngine processEngine) {
        this.objectMapper = objectMapper;
        this.processEngine = processEngine;
    }

    @Override
    public Object queryList(Request request, TaskQueryDto filterQuery, Integer firstResult, Integer maxResults) throws JsonProcessingException {
        return executeQueryList(request, filterQuery, firstResult, maxResults);

    }

    @Override
    public List<Map<String, Object>> queryCount(List<TaskQueryDto> filterQuery) {
        Map<String, Object> taskFilterQuerydata;
        List<Map<String, Object>> countList = new ArrayList<>();
        for (TaskQueryDto queryDto : filterQuery) {
            taskFilterQuerydata = executeFilterCount(queryDto);
            countList.add(taskFilterQuerydata);
        }
        return countList;
    }

    /**
     * This method execute the query and returns the count
     *
     * @param filterQuery
     * @return
     */
    protected Map<String, Object> executeFilterCount(TaskQueryDto filterQuery) {
        objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        filterQuery.getCriteria().setObjectMapper(objectMapper);
        Map<String, Object> dataMap = new HashMap<>();
        TaskQuery query = filterQuery.getCriteria().toQuery(processEngine);
        dataMap.put("name", filterQuery.getName());
        dataMap.put("id", filterQuery.getId());
        dataMap.put("count", query.count());
        return dataMap;
    }

    @Override
    public CountResultDto getFiltersCount(UriInfo uriInfo) {
        FilterQuery query = getQueryFromQueryParameters(uriInfo.getQueryParameters());
        return new CountResultDto(query.count());
    }

    protected FilterQuery getQueryFromQueryParameters(MultivaluedMap<String, String> queryParameters) {
        org.camunda.bpm.engine.rest.dto.runtime.FilterQueryDto queryDto = new FilterQueryDto(objectMapper, queryParameters);
        return queryDto.toQuery(processEngine);
    }

    private Object executeQueryList(Request request, TaskQueryDto filterQuery, Integer firstResult, Integer maxResults) throws JsonProcessingException {
        if (firstResult == null) {
            firstResult = 0;
        }
        if (maxResults == null) {
            maxResults = Integer.MAX_VALUE;
        }
        return executeList(request, filterQuery, firstResult, maxResults);
    }

    /**
     * This method validate the request media type and returns the tasklist
     *
     * @param filterQuery
     * @param firstResult
     * @param maxResults
     */
    private Object executeList(Request request, TaskQueryDto filterQuery, Integer firstResult, Integer maxResults) throws JsonProcessingException {
        Variant variant = request.selectVariant(VARIANTS);
        if (variant != null) {
            if (MediaType.APPLICATION_JSON_TYPE.equals(variant.getMediaType())) {
                return queryJsonList(filterQuery, firstResult, maxResults);
            } else if (Hal.APPLICATION_HAL_JSON_TYPE.equals(variant.getMediaType())) {
                return queryHalList(filterQuery, firstResult, maxResults);
            }
        }
        throw new InvalidRequestException(Response.Status.NOT_ACCEPTABLE, "No acceptable content-type found");
    }

    /**
     * This method returns json list of Task.
     *
     * @param filterQuery
     * @param firstResult
     * @param maxResults
     */
    private List<Object> queryJsonList(TaskQueryDto filterQuery, Integer firstResult, Integer maxResults) throws JsonProcessingException {
        Query<?, ?> query = executeFilterQuery(filterQuery.getCriteria());
        List<?> entities = query.listPage(firstResult, maxResults);
        List<Object> jsonTaskList = new ArrayList<>();
        for (Object entity : entities) {
            jsonTaskList.add(TaskDto.fromEntity((Task) entity));
        }
        jsonTaskList.add(filterQuery.getVariables());
        jsonTaskList.add(filterQuery.getTaskVisibleAttributes());
        jsonTaskList.add(query.count());
        return jsonTaskList;
    }

    /**
     * This method returns the Hal Tasklist
     */
    private Object queryHalList(TaskQueryDto filterQuery, Integer firstResult, Integer maxResults) throws JsonProcessingException {
        Query<?, ?> query = executeFilterQuery(filterQuery.getCriteria());
        List<Task> entities = (List<Task>) query.listPage(firstResult, maxResults);
        HalTaskList halTasks = HalTaskList.generate(entities, query.count(), processEngine);
        List<Object> taskList = new ArrayList<>();
        Map<String, List<VariableInstance>> variableInstances = getVariableInstancesForTasks(halTasks, filterQuery);
        if (variableInstances != null) {
            for (HalTask halTask : (List<HalTask>) halTasks.getEmbedded("task")) {
                embedVariableValuesInHalTask(halTask, variableInstances);
                halTask.addEmbedded("candidateGroups", getCandidateGroups(halTask));
            }
        }
        taskList.add(halTasks);
        taskList.add(new TaskFilterResponse(filterQuery.getVariables(), filterQuery.getTaskVisibleAttributes()));
        return taskList;
    }

    /**
     * This method executes the filterquery
     */
    private Query<?, ?> executeFilterQuery(org.camunda.bpm.engine.rest.dto.task.TaskQueryDto extendingQuery) throws JsonProcessingException {
        objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        extendingQuery.setObjectMapper(objectMapper);
        return extendingQuery.toQuery(processEngine);
    }

    private void embedVariableValuesInHalTask(HalTask halTask, Map<String, List<VariableInstance>> variableInstances) {
        List<HalResource<?>> variableValues = getVariableValuesForTask(halTask, variableInstances);
        halTask.addEmbedded("variable", variableValues);
    }

    private Map<String, List<VariableInstance>> getVariableInstancesForTasks(HalTaskList halTaskList, TaskQueryDto filterQuery) {
        List<HalTask> halTasks = (List<HalTask>) halTaskList.getEmbedded("task");
        return getVariableInstancesForTasks(filterQuery, halTasks.toArray(new HalTask[halTasks.size()]));
    }

    private Map<String, List<VariableInstance>> getVariableInstancesForTasks(TaskQueryDto filterQuery, HalTask... halTasks) {
        if (halTasks != null && halTasks.length > 0) {
            List<String> variableNames = new ArrayList<>();
            List<TaskFilterVariableQueryDto> variables = filterQuery.getVariables();
            for (TaskFilterVariableQueryDto dto : variables) {
                if (dto != null && dto.getName() != null) {
                    variableNames.add(dto.getName());
                }
            }
            if (!variableNames.isEmpty()) {
                LinkedHashSet<String> variableScopeIds = getVariableScopeIds(halTasks);
                return getSortedVariableInstances(variableNames, variableScopeIds);
            }
        }
        return null;
    }

    private LinkedHashSet<String> getVariableScopeIds(HalTask... halTasks) {
        // collect scope ids
        // the ordering is important because it specifies which variables are visible from a single task
        LinkedHashSet<String> variableScopeIds = new LinkedHashSet<>();
        if (halTasks != null) {
            for (HalTask halTask : halTasks) {
                variableScopeIds.add(halTask.getId());
                variableScopeIds.add(halTask.getExecutionId());
                variableScopeIds.add(halTask.getProcessInstanceId());
                variableScopeIds.add(halTask.getCaseExecutionId());
                variableScopeIds.add(halTask.getCaseInstanceId());
            }
        }
        // remove null from set which was probably added due an unset id
        variableScopeIds.remove(null);
        return variableScopeIds;
    }

    private Map<String, List<VariableInstance>> getSortedVariableInstances(Collection<String> variableNames, Collection<String> variableScopeIds) {
        List<VariableInstance> variableInstances = queryVariablesInstancesByVariableScopeIds(variableNames, variableScopeIds);
        Map<String, List<VariableInstance>> sortedVariableInstances = new HashMap<>();
        for (VariableInstance variableInstance : variableInstances) {
            String variableScopeId = ((VariableInstanceEntity) variableInstance).getVariableScopeId();
            if (!sortedVariableInstances.containsKey(variableScopeId)) {
                sortedVariableInstances.put(variableScopeId, new ArrayList<>());
            }
            sortedVariableInstances.get(variableScopeId).add(variableInstance);
        }
        return sortedVariableInstances;
    }

    private List<VariableInstance> queryVariablesInstancesByVariableScopeIds(Collection<String> variableNames, Collection<String> variableScopeIds) {

        VariableInstanceQueryImpl query = (VariableInstanceQueryImpl) processEngine.getRuntimeService()
                .createVariableInstanceQuery()
                .disableBinaryFetching()
                .disableCustomObjectDeserialization()
                .variableNameIn(variableNames.toArray(new String[0]))
                .variableScopeIdIn(variableScopeIds.toArray(new String[0]));
        return query.unlimitedList();
    }

    private List<HalResource<?>> getVariableValuesForTask(HalTask halTask, Map<String, List<VariableInstance>> variableInstances) {
        List<HalResource<?>> variableValues = new ArrayList<>();
        LinkedHashSet<String> variableScopeIds = getVariableScopeIds(halTask);
        for (String variableScopeId : variableScopeIds) {
            if (variableInstances.containsKey(variableScopeId)) {
                for (VariableInstance variableInstance : variableInstances.get(variableScopeId)) {
                    variableValues.add(HalVariableValue.generateVariableValue(variableInstance, variableScopeId));
                }
            }
        }

        return variableValues;
    }

    private List<HalResource<?>> getCandidateGroups(HalTask halTask) {
        List<IdentityLink> identityLinks = processEngine.getTaskService().getIdentityLinksForTask(halTask.getId());
        List<HalResource<?>> result = new ArrayList<>();
        if (identityLinks != null) {
            for (IdentityLink link : identityLinks) {
                result.add(HalIdentityLink.fromIdentityLink(link));
            }
        }
        return result;
    }
}