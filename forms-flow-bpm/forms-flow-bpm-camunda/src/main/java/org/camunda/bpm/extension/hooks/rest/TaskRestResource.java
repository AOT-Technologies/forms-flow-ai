package org.camunda.bpm.extension.hooks.rest;

import org.camunda.bpm.engine.rest.dto.task.TaskQueryDto;
import org.camunda.bpm.engine.rest.hal.Hal;
import org.bpm.utils.dto.UserIdDto;
import org.bpm.utils.dto.TaskDto;
import org.bpm.utils.dto.IdentityLinkDto;
import org.bpm.utils.dto.CompleteTaskDto;
import org.bpm.utils.dto.VariableValueDto;
import org.bpm.utils.dto.CountResultDto;

import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.DefaultValue;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.UriInfo;
import jakarta.ws.rs.core.Request;
import jakarta.ws.rs.core.Response;
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
    CountResultDto getTasksCount(@Context UriInfo uriInfo);

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
