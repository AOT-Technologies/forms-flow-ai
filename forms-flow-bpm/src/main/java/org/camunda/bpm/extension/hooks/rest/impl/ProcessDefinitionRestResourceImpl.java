package org.camunda.bpm.extension.hooks.rest.impl;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

import java.util.List;

import org.camunda.bpm.engine.rest.dto.repository.ProcessDefinitionDiagramDto;
import org.camunda.bpm.engine.rest.dto.repository.ProcessDefinitionDto;
import org.camunda.bpm.engine.rest.dto.runtime.ProcessInstanceDto;
import org.camunda.bpm.engine.rest.dto.runtime.StartProcessInstanceDto;
import org.camunda.bpm.extension.hooks.rest.ProcessDefinitionRestResource;
import org.springframework.hateoas.CollectionModel;
import org.springframework.hateoas.EntityModel;

import javax.ws.rs.core.UriInfo;


public class ProcessDefinitionRestResourceImpl implements ProcessDefinitionRestResource {

    private final org.camunda.bpm.engine.rest.ProcessDefinitionRestService restService;

    public ProcessDefinitionRestResourceImpl(org.camunda.bpm.engine.rest.ProcessDefinitionRestService processEngineRestService){
        restService = processEngineRestService;
    }

    @Override
    public CollectionModel<org.camunda.bpm.engine.rest.dto.repository.ProcessDefinitionDto> getProcessDefinitions(UriInfo uriInfo, Integer firstResult, Integer maxResults) {
        List<ProcessDefinitionDto> definitions = restService.getProcessDefinitions(uriInfo, firstResult, maxResults);
        return CollectionModel.of(definitions,
                linkTo(methodOn(ProcessDefinitionRestResourceImpl.class).getProcessDefinitions(uriInfo, firstResult, maxResults)).withSelfRel().withSelfRel());
    }

    @Override
    public EntityModel<org.camunda.bpm.engine.rest.dto.repository.ProcessDefinitionDiagramDto> getProcessDefinitionBpmn20Xml(String key){

        ProcessDefinitionDiagramDto dto = restService.getProcessDefinitionByKey(key).getProcessDefinitionBpmn20Xml();

        return EntityModel.of(dto,
                linkTo(methodOn(ProcessDefinitionRestResourceImpl.class).getProcessDefinitionBpmn20Xml(key)).withSelfRel().withSelfRel());
    }

    @Override
    public EntityModel<ProcessInstanceDto> startProcessInstanceByKey(UriInfo context, StartProcessInstanceDto parameters, String key){

        org.camunda.bpm.engine.rest.dto.runtime.ProcessInstanceDto processInstanceDto = restService.getProcessDefinitionByKey(key).startProcessInstance(context, parameters);

        return EntityModel.of(processInstanceDto,
                linkTo(methodOn(ProcessDefinitionRestResourceImpl.class).startProcessInstanceByKey(context, parameters, key)).withSelfRel());
    }
}
