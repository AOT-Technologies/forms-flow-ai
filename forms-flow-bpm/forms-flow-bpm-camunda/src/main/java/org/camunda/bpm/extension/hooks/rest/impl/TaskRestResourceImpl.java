package org.camunda.bpm.extension.hooks.rest.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.camunda.bpm.engine.rest.TaskRestService;
import org.bpm.utils.dto.TaskDto;
import org.bpm.utils.dto.IdentityLinkDto;
import org.bpm.utils.dto.CompleteTaskDto;
import org.bpm.utils.dto.VariableValueDto;
import org.bpm.utils.dto.CountResultDto;
import org.camunda.bpm.engine.rest.dto.task.TaskQueryDto;
import org.camunda.bpm.extension.hooks.rest.TaskRestResource;
import org.bpm.utils.dto.UserIdDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ws.rs.core.Request;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriInfo;
import java.util.List;
import java.util.Map;


public class TaskRestResourceImpl implements TaskRestResource {

    private static final Logger LOG = LoggerFactory.getLogger(TaskRestResourceImpl.class);

    private final TaskRestService restService;

    ObjectMapper bpmObjectMapper = new ObjectMapper();

    public TaskRestResourceImpl(TaskRestService taskRestService) {
        restService = taskRestService;
    }

    @Override
    public Object getTasks(Request request, UriInfo uriInfo, Integer firstResult, Integer maxResults) {
        return bpmObjectMapper.convertValue(restService.getTasks(request, uriInfo, firstResult, maxResults),
                new TypeReference<List<TaskDto>>(){});
    }

    @Override
    public List<TaskDto>  queryTasks(TaskQueryDto query, Integer firstResult, Integer maxResults) {
       return bpmObjectMapper.convertValue(restService.queryTasks(query, firstResult, maxResults),
               new TypeReference<List<TaskDto>>(){});
    }

    @Override
    public CountResultDto getTasksCount(UriInfo uriInfo) {
        CountResultDto dto = bpmObjectMapper.convertValue(restService.getTasksCount(uriInfo), CountResultDto.class);
        return dto;
    }

    @Override
    public Object getTask(Request request, String id) {
        return bpmObjectMapper.convertValue(restService.getTask(id).getTask(request),org.bpm.utils.dto.TaskDto.class);
    }

    @Override
    public void updateTask(TaskDto task, String id) {
        restService.getTask(id).updateTask(
                bpmObjectMapper.convertValue(task, org.camunda.bpm.engine.rest.dto.task.TaskDto.class));
    }

    @Override
    public void claim(org.bpm.utils.dto.UserIdDto userIdDto, String id) {
        restService.getTask(id).claim(
                bpmObjectMapper.convertValue(userIdDto, org.camunda.bpm.engine.rest.dto.task.UserIdDto.class));
    }

    @Override
    public void unClaim(String id) {
        restService.getTask(id).unclaim();
    }

    @Override
    public void setAssignee(UserIdDto userIdDto, String id) {
        restService.getTask(id).setAssignee(
                bpmObjectMapper.convertValue(userIdDto, org.camunda.bpm.engine.rest.dto.task.UserIdDto.class));
    }

    @Override
    public Map<String, VariableValueDto> getVariables(boolean deserializeValues, String id) {
        return bpmObjectMapper.convertValue(restService.getTask(id).getVariables().getVariables(deserializeValues),
                new TypeReference<Map<String, VariableValueDto>>() {
        });
    }

    @Override
    public List<IdentityLinkDto> getIdentityLinks(String type, String id) {
        return bpmObjectMapper.convertValue(restService.getTask(id).getIdentityLinks(type),
                new TypeReference<>() {
                });
    }

    @Override
    public void addIdentityLink(IdentityLinkDto identityLink, String id) {
        restService.getTask(id).addIdentityLink(
                bpmObjectMapper.convertValue(identityLink, org.camunda.bpm.engine.rest.dto.task.IdentityLinkDto.class));
    }

    @Override
    public void deleteIdentityLink(IdentityLinkDto identityLink, String id) {
        restService.getTask(id).deleteIdentityLink(
                bpmObjectMapper.convertValue(identityLink, org.camunda.bpm.engine.rest.dto.task.IdentityLinkDto.class));
    }

    @Override
    public Response submit(CompleteTaskDto completeTaskDto, String id) {
       return restService.getTask(id).submit(
               bpmObjectMapper.convertValue(completeTaskDto, org.camunda.bpm.engine.rest.dto.task.CompleteTaskDto.class));
    }
}
