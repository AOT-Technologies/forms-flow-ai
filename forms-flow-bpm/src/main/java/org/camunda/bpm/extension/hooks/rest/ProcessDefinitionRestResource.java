package org.camunda.bpm.extension.hooks.rest;

import org.camunda.bpm.extension.hooks.rest.dto.ProcessDefinitionDto;
import org.camunda.bpm.extension.hooks.rest.dto.ProcessInstanceDto;
import org.camunda.bpm.extension.hooks.rest.dto.StartProcessInstanceDto;
import org.springframework.hateoas.CollectionModel;
import org.springframework.hateoas.EntityModel;
import org.springframework.web.bind.annotation.*;

import javax.ws.rs.core.MediaType;
import java.util.Map;

public interface ProcessDefinitionRestResource extends RestResource{

    String PATH = "/process-definition";

    @GetMapping(produces = MediaType.APPLICATION_JSON)
    CollectionModel<ProcessDefinitionDto> getProcessDefinition(@RequestParam  Map<String, Object> parameters);

    @PostMapping(value = "/start/key/{key}", consumes = MediaType.APPLICATION_JSON, produces = MediaType.APPLICATION_JSON)
    EntityModel<ProcessInstanceDto> startProcessInstanceByKey(
            @RequestParam Map<String, Object> parameters, @RequestBody StartProcessInstanceDto dto,
            @PathVariable("key") String key);
}
