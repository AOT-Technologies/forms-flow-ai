package org.camunda.bpm.extension.hooks.rest.impl;

import org.camunda.bpm.engine.rest.TaskRestService;
import org.camunda.bpm.extension.hooks.rest.RestResource;
import org.camunda.bpm.extension.hooks.rest.TaskRestResource;
import org.camunda.bpm.extension.hooks.rest.dto.CountResultDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.ws.rs.core.UriInfo;

public class TaskRestResourceImpl implements TaskRestResource{

    private final TaskRestService restService;

    public TaskRestResourceImpl(TaskRestService restService){
        this.restService = restService;
    }

    @Override
    public ResponseEntity<CountResultDto> getTasksCount(UriInfo uriInfo) {
        return null;
    }
}
