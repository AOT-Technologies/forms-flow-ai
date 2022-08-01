package org.camunda.bpm.extension.hooks.rest;

import org.camunda.bpm.engine.rest.dto.CountResultDto;
import org.camunda.bpm.engine.rest.dto.VariableValueDto;
import org.camunda.bpm.engine.rest.dto.task.CompleteTaskDto;
import org.camunda.bpm.engine.rest.dto.task.IdentityLinkDto;
import org.camunda.bpm.engine.rest.dto.task.TaskDto;
import org.camunda.bpm.engine.rest.dto.task.TaskQueryDto;
import org.camunda.bpm.engine.rest.hal.Hal;
import org.camunda.bpm.extension.hooks.rest.dto.UserIdDto;
import org.springframework.hateoas.CollectionModel;
import org.springframework.hateoas.EntityModel;

import javax.ws.rs.*;
import javax.ws.rs.core.*;
import java.util.Map;

@Produces({MediaType.APPLICATION_JSON})
public interface TaskRestResource extends RestResource {

    public final static String DESERIALIZE_VALUE_QUERY_PARAM = "deserializeValue";
    public final static String DESERIALIZE_VALUES_QUERY_PARAM = DESERIALIZE_VALUE_QUERY_PARAM + "s";

    String PATH = "/task";

    @GET
    @Produces({MediaType.APPLICATION_JSON, Hal.APPLICATION_HAL_JSON})
    Object getTasks(@Context Request request, @Context UriInfo uriInfo,
                                                          @QueryParam("firstResult") Integer firstResult, @QueryParam("maxResults") Integer maxResults);

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    CollectionModel<TaskDto> queryTasks(TaskQueryDto query,
                             @QueryParam("firstResult") Integer firstResult, @QueryParam("maxResults") Integer maxResults);
    @GET
    @Path("/count")
    @Produces({MediaType.APPLICATION_JSON})
    EntityModel<CountResultDto> getTasksCount(@Context UriInfo uriInfo);

    @GET
    @Path("/{id}")
    @Produces({MediaType.APPLICATION_JSON, Hal.APPLICATION_HAL_JSON})
    EntityModel<Object> getTask(@Context Request request, @PathParam("id") String id);

    @POST
    @Path("/{id}/claim")
    @Consumes(MediaType.APPLICATION_JSON)
    void claim(UserIdDto userIdDto, @PathParam("id") String id);

    @POST
    @Path("/{id}/unclaim")
    void unClaim(@PathParam("id") String id);

    @POST
    @Path("/{id}/assignee")
    @Consumes(MediaType.APPLICATION_JSON)
    void setAssignee(UserIdDto dto, @PathParam("id") String id);

    @GET
    @Path("/{id}/variables")
    @Produces(MediaType.APPLICATION_JSON)
    Map<String, VariableValueDto> getVariables(@QueryParam(DESERIALIZE_VALUES_QUERY_PARAM) @DefaultValue("true") boolean deserializeValues, @PathParam("id") String id);

    @GET
    @Path("/{id}/identity-links")
    @Produces(MediaType.APPLICATION_JSON)
    CollectionModel<IdentityLinkDto> getIdentityLinks(@QueryParam("type") String type, @PathParam("id") String id);

    @POST
    @Path("/{id}/identity-links")
    @Consumes(MediaType.APPLICATION_JSON)
    void addIdentityLink(IdentityLinkDto identityLink, @PathParam("id") String id);

    @POST
    @Path("/{id}/identity-links/delete")
    @Consumes(MediaType.APPLICATION_JSON)
    void deleteIdentityLink(IdentityLinkDto identityLink, @PathParam("id") String id);

    @POST
    @Path("/{id}/submit-form")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    EntityModel<Response> submit(CompleteTaskDto dto, @PathParam("id") String id);
}
