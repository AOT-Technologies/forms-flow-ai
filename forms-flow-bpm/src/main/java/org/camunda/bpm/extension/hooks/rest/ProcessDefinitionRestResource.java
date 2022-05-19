package org.camunda.bpm.extension.hooks.rest;

import org.camunda.bpm.extension.hooks.rest.dto.ProcessInstanceDto;
import org.camunda.bpm.extension.hooks.rest.dto.StartProcessInstanceDto;
import org.springframework.hateoas.EntityModel;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import javax.ws.rs.core.MediaType;
import java.util.Map;

public interface ProcessDefinitionRestResource extends RestResource{

    String PATH = "/process-definition/{id}";

    @PostMapping(value = "/start", consumes = MediaType.APPLICATION_JSON, produces = MediaType.APPLICATION_JSON)
    EntityModel<ProcessInstanceDto> startProcessInstance(
            @RequestParam Map<String, Object> parameters, @RequestBody StartProcessInstanceDto dto,
            @PathVariable("id") String id);
}
