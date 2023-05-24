package org.camunda.bpm.extension.hooks.rest;

import org.camunda.bpm.engine.rest.dto.CountResultDto;
import org.camunda.bpm.engine.rest.dto.externaltask.*;

import javax.ws.rs.*;
import javax.ws.rs.container.AsyncResponse;
import javax.ws.rs.container.Suspended;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.UriInfo;
import java.util.List;

@Produces(MediaType.APPLICATION_JSON)
public interface ExternalTaskRestResource extends RestResource {

    String PATH = "/external-task";

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    List<ExternalTaskDto> getExternalTasks(@Context UriInfo uriInfo,
                                           @QueryParam("firstResult") Integer firstResult,
                                           @QueryParam("maxResults") Integer maxResults);

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    List<ExternalTaskDto> queryExternalTasks(ExternalTaskQueryDto query,
                                             @QueryParam("firstResult") Integer firstResult,
                                             @QueryParam("maxResults") Integer maxResults);

    @GET
    @Path("/count")
    @Produces(MediaType.APPLICATION_JSON)
    CountResultDto getExternalTasksCount(@Context UriInfo uriInfo);

    @POST
    @Path("/count")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    CountResultDto queryExternalTasksCount(ExternalTaskQueryDto query);

    @POST
    @Path("/fetchAndLock")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    void fetchAndLock(FetchExternalTasksExtendedDto dto, @Suspended final AsyncResponse asyncResponse);

    @GET
    @Path("/topic-names")
    @Produces(MediaType.APPLICATION_JSON)
    List<String> getTopicNames(@QueryParam("withLockedTasks") boolean withLockedTasks,
                               @QueryParam("withUnlockedTasks") boolean withUnlockedTasks,
                               @QueryParam("withRetriesLeft") boolean withRetriesLeft);
    @GET
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    ExternalTaskDto getExternalTask(@PathParam("id") String id);

    @POST
    @Path("/{id}/complete")
    @Consumes(MediaType.APPLICATION_JSON)
    void complete(@PathParam("id") String id, CompleteExternalTaskDto dto);

    @POST
    @Path("/{id}/failure")
    @Consumes(MediaType.APPLICATION_JSON)
    void handleFailure(@PathParam("id") String id, ExternalTaskFailureDto dto);

    @POST
    @Path("/{id}/extendLock")
    @Consumes(MediaType.APPLICATION_JSON)
    void extendLock(@PathParam("id") String id, ExtendLockOnExternalTaskDto extendLockDto);

    @GET
    @Path("/{id}/errorDetails")
    @Produces(MediaType.TEXT_PLAIN)
    String getErrorDetails(@PathParam("id") String id);

}
