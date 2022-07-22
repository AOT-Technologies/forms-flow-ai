package org.camunda.bpm.extension.hooks.rest;

import org.camunda.bpm.extension.hooks.rest.dto.ActivityInstanceDto;
import org.springframework.hateoas.EntityModel;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import javax.ws.rs.core.MediaType;

public interface ProcessInstanceRestResource  extends RestResource{

    String PATH = "/process-instance/{id}";

    @GetMapping(value = "/activity-instances", produces = MediaType.APPLICATION_JSON)
    EntityModel<ActivityInstanceDto> getActivityInstanceTree(@PathVariable("id") String id);
}
