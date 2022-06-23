package org.camunda.bpm.extension.hooks.rest;

import org.camunda.bpm.extension.hooks.rest.dto.ActivityInstanceDto;
import org.springframework.hateoas.EntityModel;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import javax.ws.rs.core.MediaType;

@RequestMapping(RestResource.BASE_PATH+ProcessInstanceRestResource.PATH)
public interface ProcessInstanceRestResource  extends RestResource{

    String PATH = "/process-instance/{id}";

    @GetMapping(value = "/activity-instances", produces = MediaType.APPLICATION_JSON)
    EntityModel<ActivityInstanceDto> getActivityInstanceTree();
}
