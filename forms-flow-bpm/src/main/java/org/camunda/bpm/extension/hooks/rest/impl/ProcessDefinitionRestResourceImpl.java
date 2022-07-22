package org.camunda.bpm.extension.hooks.rest.impl;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

import java.util.List;
import java.util.Map;

import org.camunda.bpm.extension.hooks.rest.dto.ProcessDefinitionDiagramDto;
import org.camunda.bpm.extension.hooks.rest.dto.ProcessDefinitionDto;
import org.camunda.bpm.extension.hooks.rest.dto.ProcessInstanceDto;
import org.camunda.bpm.extension.hooks.rest.dto.StartProcessInstanceDto;
import org.camunda.bpm.extension.hooks.rest.ProcessDefinitionRestResource;
import org.camunda.bpm.extension.hooks.rest.RestResource;
import org.camunda.bpm.extension.hooks.rest.service.ProcessDefinitionRestService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.hateoas.CollectionModel;
import org.springframework.hateoas.EntityModel;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(RestResource.BASE_PATH+"/v1"+ ProcessDefinitionRestResource.PATH)
public class ProcessDefinitionRestResourceImpl implements ProcessDefinitionRestResource {

    Logger LOG = LoggerFactory.getLogger(ProcessDefinitionRestResourceImpl.class);

    private final ProcessDefinitionRestService restService;

    public ProcessDefinitionRestResourceImpl(ProcessDefinitionRestService processDefinitionRestService){
        this.restService = processDefinitionRestService;
    }

    @Override
    public CollectionModel<ProcessDefinitionDto> getProcessDefinition(Map<String, Object> parameters){

        ResponseEntity<List<ProcessDefinitionDto>> processDefinition = restService.getProcessDefinition(parameters);

        return CollectionModel.of(processDefinition.getBody(),
                linkTo(methodOn(ProcessDefinitionRestResourceImpl.class).getProcessDefinition(parameters)).withSelfRel(),
                linkTo(methodOn(ProcessDefinitionRestResourceImpl.class).startProcessInstanceByKey(parameters, null, "defaultflow")).withSelfRel());
    }

    @Override
    public EntityModel<ProcessDefinitionDiagramDto> getProcessDefinitionBpmn20Xml(@RequestParam Map<String, Object> parameters, String key){

        ResponseEntity<ProcessDefinitionDiagramDto> processDefinition = restService.getProcessDefinitionBpmn20Xml(parameters, key);

        return EntityModel.of(processDefinition.getBody(),
                linkTo(methodOn(ProcessDefinitionRestResourceImpl.class).getProcessDefinitionBpmn20Xml(parameters, key)).withSelfRel(),
                linkTo(methodOn(ProcessDefinitionRestResourceImpl.class).startProcessInstanceByKey(parameters, null, "defaultflow")).withSelfRel());
    }

    @Override
    public EntityModel<ProcessInstanceDto> startProcessInstanceByKey(Map<String, Object> parameters, StartProcessInstanceDto dto, String key){

        ResponseEntity<ProcessInstanceDto> processInstanceDto = restService.startProcessInstanceByKey(parameters, dto, key);

        return EntityModel.of(processInstanceDto.getBody(),
                linkTo(methodOn(ProcessDefinitionRestResourceImpl.class).startProcessInstanceByKey(parameters, dto, key)).withSelfRel());
    }
}
