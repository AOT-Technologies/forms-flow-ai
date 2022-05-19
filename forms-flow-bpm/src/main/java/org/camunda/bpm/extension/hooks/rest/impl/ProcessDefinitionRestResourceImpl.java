package org.camunda.bpm.extension.hooks.rest.impl;

import org.camunda.bpm.extension.hooks.rest.dto.ProcessInstanceDto;
import org.camunda.bpm.extension.hooks.rest.dto.StartProcessInstanceDto;
import org.camunda.bpm.extension.hooks.rest.ProcessDefinitionRestResource;
import org.camunda.bpm.extension.hooks.rest.RestResource;
import org.camunda.bpm.extension.hooks.rest.service.ProcessDefinitionRestService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.hateoas.EntityModel;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

@RestController
@RequestMapping(RestResource.BASE_PATH+"/v1"+ ProcessDefinitionRestResource.PATH)
public class ProcessDefinitionRestResourceImpl implements ProcessDefinitionRestResource {

    Logger LOG = LoggerFactory.getLogger(ProcessDefinitionRestResourceImpl.class);

    private final ProcessDefinitionRestService restService;

    public ProcessDefinitionRestResourceImpl(ProcessDefinitionRestService processDefinitionRestService){
        this.restService = processDefinitionRestService;
    }

    @Override
    public EntityModel<ProcessInstanceDto> startProcessInstanceByKey(Map<String, Object> parameters, StartProcessInstanceDto dto, String key){

        ResponseEntity<ProcessInstanceDto> processInstanceDto = restService.startProcessInstanceByKey(parameters, dto, key);

        return EntityModel.of(processInstanceDto.getBody(),
                linkTo(methodOn(ProcessDefinitionRestResourceImpl.class).startProcessInstanceByKey(parameters, dto, key)).withSelfRel());
    }
}
