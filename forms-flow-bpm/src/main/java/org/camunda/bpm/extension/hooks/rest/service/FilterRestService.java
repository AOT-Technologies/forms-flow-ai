package org.camunda.bpm.extension.hooks.rest.service;

import com.fasterxml.jackson.core.JsonProcessingException;

import javax.ws.rs.core.Request;

public interface FilterRestService {

    Object queryList(Request request, String extendingQuery, Integer firstResult, Integer maxResults) throws JsonProcessingException;
}
