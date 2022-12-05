package org.camunda.bpm.extension.hooks.rest.service;

import javax.ws.rs.core.Request;

import org.camunda.bpm.engine.rest.dto.CountResultDto;
import org.camunda.bpm.extension.hooks.rest.dto.TaskQueryDto;

import com.fasterxml.jackson.core.JsonProcessingException;

public interface TaskFilterRestService {

    Object queryList(Request request, TaskQueryDto extendingQuery, Integer firstResult, Integer maxResults) throws JsonProcessingException;

    CountResultDto queryCount(TaskQueryDto filterQuery);
}
