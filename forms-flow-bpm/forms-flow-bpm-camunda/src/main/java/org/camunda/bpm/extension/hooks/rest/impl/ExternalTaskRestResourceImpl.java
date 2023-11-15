package org.camunda.bpm.extension.hooks.rest.impl;

import org.camunda.bpm.engine.rest.ExternalTaskRestService;
import org.camunda.bpm.engine.rest.dto.CountResultDto;
import org.camunda.bpm.engine.rest.dto.externaltask.*;
import org.camunda.bpm.extension.hooks.rest.ExternalTaskRestResource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ws.rs.container.AsyncResponse;
import javax.ws.rs.core.UriInfo;
import java.util.List;

public class ExternalTaskRestResourceImpl implements ExternalTaskRestResource {

    private static final Logger LOG = LoggerFactory.getLogger(ExternalTaskRestResourceImpl.class);

    private final ExternalTaskRestService restService;

    public ExternalTaskRestResourceImpl(ExternalTaskRestService externalTaskRestService) {
        restService = externalTaskRestService;
    }

    @Override
    public List<ExternalTaskDto> getExternalTasks(UriInfo uriInfo, Integer firstResult, Integer maxResults) {
        return restService.getExternalTasks(uriInfo, firstResult, maxResults);
    }

    @Override
    public List<ExternalTaskDto> queryExternalTasks(ExternalTaskQueryDto query, Integer firstResult, Integer maxResults) {
        return restService.queryExternalTasks(query, firstResult, maxResults);
    }

    @Override
    public CountResultDto getExternalTasksCount(UriInfo uriInfo) {
        return restService.getExternalTasksCount(uriInfo);
    }

    @Override
    public CountResultDto queryExternalTasksCount(ExternalTaskQueryDto query) {
        return restService.queryExternalTasksCount(query);
    }

    @Override
    public void fetchAndLock(FetchExternalTasksExtendedDto dto, AsyncResponse asyncResponse) {
        restService.fetchAndLock(dto, asyncResponse);
    }

    @Override
    public List<String> getTopicNames(boolean withLockedTasks, boolean withUnlockedTasks, boolean withRetriesLeft) {
        return restService.getTopicNames(withLockedTasks, withUnlockedTasks, withRetriesLeft);
    }

    @Override
    public ExternalTaskDto getExternalTask(String id) {
        return restService.getExternalTask(id).getExternalTask();
    }

    @Override
    public void complete(String id, CompleteExternalTaskDto dto) {
        restService.getExternalTask(id).complete(dto);
    }

    @Override
    public void handleFailure(String id, ExternalTaskFailureDto dto) {
        restService.getExternalTask(id).handleFailure(dto);
    }

    @Override
    public void extendLock(String id, ExtendLockOnExternalTaskDto extendLockDto) {
        restService.getExternalTask(id).extendLock(extendLockDto);
    }

    @Override
    public String getErrorDetails(String id) {
        return restService.getExternalTask(id).getErrorDetails();
    }

}
