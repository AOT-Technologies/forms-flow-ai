package org.camunda.bpm.extension.hooks.rest;

import org.camunda.bpm.extension.hooks.rest.dto.ProcessDefinitionDiagramDto;
import org.camunda.bpm.extension.hooks.rest.dto.ProcessDefinitionDto;
import org.camunda.bpm.extension.hooks.rest.dto.ProcessInstanceDto;
import org.camunda.bpm.extension.hooks.rest.dto.StartProcessInstanceDto;
import org.springframework.hateoas.CollectionModel;
import org.springframework.hateoas.EntityModel;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

import javax.ws.rs.core.MediaType;
import java.util.Map;

public interface ProcessDefinitionRestResource extends RestResource{

    String PATH = "/process-definition";

    @GetMapping(produces = MediaType.APPLICATION_JSON)
    CollectionModel<ProcessDefinitionDto> getProcessDefinition(@RequestParam  Map<String, Object> parameters);

    @GetMapping(value = "/key/{key}/xml", produces = MediaType.APPLICATION_JSON)
    EntityModel<ProcessDefinitionDiagramDto> getProcessDefinitionBpmn20Xml(
            @RequestParam Map<String, Object> parameters,
            @PathVariable("key") String key);

    @PostMapping(value = "/key/{key}/start", consumes = MediaType.APPLICATION_JSON, produces = MediaType.APPLICATION_JSON)
    EntityModel<ProcessInstanceDto> startProcessInstanceByKey(
            @RequestParam Map<String, Object> parameters, @RequestBody StartProcessInstanceDto dto,
            @PathVariable("key") String key);
}
