package org.camunda.bpm.extension.hooks.rest;

import org.camunda.bpm.engine.rest.dto.CountResultDto;
import org.camunda.bpm.engine.rest.dto.VariableValueDto;
import org.camunda.bpm.engine.rest.dto.task.CompleteTaskDto;
import org.camunda.bpm.engine.rest.dto.task.IdentityLinkDto;
import org.camunda.bpm.engine.rest.dto.task.TaskDto;
import org.camunda.bpm.engine.rest.dto.task.TaskQueryDto;
import org.camunda.bpm.engine.rest.hal.Hal;
import org.camunda.bpm.extension.hooks.rest.dto.UserIdDto;
import org.springframework.hateoas.EntityModel;

import javax.ws.rs.Consumes;
import javax.ws.rs.Path;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.DefaultValue;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.UriInfo;
import javax.ws.rs.core.Request;
import javax.ws.rs.core.Response;
import java.util.List;
import java.util.Map;

@Produces(MediaType.APPLICATION_JSON)
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
    List<TaskDto> queryTasks(TaskQueryDto query,
                             @QueryParam("firstResult") Integer firstResult, @QueryParam("maxResults") Integer maxResults);
    @GET
    @Path("/count")
    @Produces(MediaType.APPLICATION_JSON)
    EntityModel<CountResultDto> getTasksCount(@Context UriInfo uriInfo);

    @GET
    @Path("/{id}")
    @Produces({MediaType.APPLICATION_JSON, Hal.APPLICATION_HAL_JSON})
    Object getTask(@Context Request request, @PathParam("id") String id);

    @PUT
    @Path("/{id}")
    @Consumes(MediaType.APPLICATION_JSON)
    void updateTask(TaskDto task, @PathParam("id") String id);

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
    List<IdentityLinkDto> getIdentityLinks(@QueryParam("type") String type, @PathParam("id") String id);

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
    Response submit(CompleteTaskDto dto, @PathParam("id") String id);
}
