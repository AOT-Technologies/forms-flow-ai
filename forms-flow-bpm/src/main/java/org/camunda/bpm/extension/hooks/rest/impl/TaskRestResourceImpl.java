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
import org.springframework.hateoas.CollectionModel;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.Link;
import org.springframework.http.ResponseEntity;

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
    public CollectionModel<TaskDto> queryTasks(TaskQueryDto query, Integer firstResult, Integer maxResults) {
       List<TaskDto> dto = restService.queryTasks(query, firstResult, maxResults);
       return CollectionModel.of(dto, linkTo(methodOn(TaskRestResourceImpl.class).queryTasks(query, firstResult, maxResults)).withSelfRel().withSelfRel());
    }

    @Override
    public EntityModel<CountResultDto> getTasksCount(UriInfo uriInfo) {
        CountResultDto result = restService.getTasksCount(uriInfo);
        return EntityModel.of(result, linkTo(methodOn(TaskRestResourceImpl.class).getTasksCount(uriInfo)).withSelfRel().withSelfRel());
    }

    @Override
    public EntityModel<Object> getTask(Request request, String id) {
        Object getTask = restService.getTask(id).getTask(request);
        return EntityModel.of(getTask, linkTo(methodOn(TaskRestResourceImpl.class).getTask(request, id)).withSelfRel().withSelfRel());
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
    public CollectionModel<IdentityLinkDto> getIdentityLinks(String type, String id) {
        List<IdentityLinkDto> identityLinks = restService.getTask(id).getIdentityLinks(type);
        return CollectionModel.of(identityLinks, linkTo(methodOn(TaskRestResourceImpl.class).getIdentityLinks(type, id)).withSelfRel().withSelfRel());
    }

    @Override
    public void addIdentityLink(IdentityLinkDto identityLinkDto, String id) {
        restService.getTask(id).addIdentityLink(identityLinkDto);
    }

    @Override
    public void deleteIdentityLink(IdentityLinkDto identityLink, String id) {
        restService.getTask(id).deleteIdentityLink(identityLink);
    }

    @Override
    public EntityModel<Response> submit(CompleteTaskDto completeTaskDto, String id) {
        Response response = restService.getTask(id).submit(completeTaskDto);
        return EntityModel.of(response, linkTo(methodOn(TaskRestResourceImpl.class).submit(completeTaskDto, id)).withSelfRel().withSelfRel());
    }
}
