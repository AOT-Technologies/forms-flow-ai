package org.camunda.bpm.extension.hooks.rest.impl;

import org.camunda.bpm.engine.rest.TaskRestService;
import org.camunda.bpm.engine.rest.dto.CountResultDto;
import org.camunda.bpm.engine.rest.dto.VariableValueDto;
import org.camunda.bpm.engine.rest.dto.task.CompleteTaskDto;
import org.camunda.bpm.engine.rest.dto.task.IdentityLinkDto;
import org.camunda.bpm.engine.rest.dto.task.TaskDto;
import org.camunda.bpm.engine.rest.dto.task.TaskQueryDto;
import org.camunda.bpm.extension.hooks.rest.TaskRestResource;
import org.camunda.bpm.extension.hooks.rest.dto.UserIdDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.hateoas.EntityModel;

import javax.ws.rs.core.Request;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriInfo;
import java.util.List;
import java.util.Map;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

public class TaskRestResourceImpl implements TaskRestResource {

    private static final Logger LOG = LoggerFactory.getLogger(TaskRestResourceImpl.class);

    private final TaskRestService restService;

    public TaskRestResourceImpl(TaskRestService taskRestService) {
        restService = taskRestService;
    }

    @Override
    public Object getTasks(Request request, UriInfo uriInfo, Integer firstResult, Integer maxResults) {
        return restService.getTasks(request, uriInfo, firstResult, maxResults);
    }

    @Override
    public List<TaskDto>  queryTasks(TaskQueryDto query, Integer firstResult, Integer maxResults) {
       return restService.queryTasks(query, firstResult, maxResults);
    }

    @Override
    public EntityModel<CountResultDto> getTasksCount(UriInfo uriInfo) {
        CountResultDto dto = restService.getTasksCount(uriInfo);
        return EntityModel.of(dto, linkTo(methodOn(TaskRestResourceImpl.class).getTasksCount(uriInfo)).withSelfRel());
    }

    @Override
    public Object getTask(Request request, String id) {
        return restService.getTask(id).getTask(request);
    }

    @Override
    public void updateTask(TaskDto task, String id) {
        restService.getTask(id).updateTask(task);
    }

    @Override
    public void claim(UserIdDto userIdDto, String id) {
        restService.getTask(id).claim(userIdDto);
    }

    @Override
    public void unClaim(String id) {
        restService.getTask(id).unclaim();
    }

    @Override
    public void setAssignee(UserIdDto userIdDto, String id) {
        restService.getTask(id).setAssignee(userIdDto);
    }

    @Override
    public Map<String, VariableValueDto> getVariables(boolean deserializeValues, String id) {
        return restService.getTask(id).getVariables().getVariables(deserializeValues);
    }

    @Override
    public List<IdentityLinkDto> getIdentityLinks(String type, String id) {
        return restService.getTask(id).getIdentityLinks(type);
    }

    @Override
    public void addIdentityLink(IdentityLinkDto identityLink, String id) {
        restService.getTask(id).addIdentityLink(identityLink);
    }

    @Override
    public void deleteIdentityLink(IdentityLinkDto identityLink, String id) {
        restService.getTask(id).deleteIdentityLink(identityLink);
    }

    @Override
    public Response submit(CompleteTaskDto completeTaskDto, String id) {
       return restService.getTask(id).submit(completeTaskDto);
    }
}
