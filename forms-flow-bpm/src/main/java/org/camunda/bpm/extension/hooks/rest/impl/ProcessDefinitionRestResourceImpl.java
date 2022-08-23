package org.camunda.bpm.extension.hooks.rest.impl;

import org.camunda.bpm.engine.rest.dto.repository.ProcessDefinitionDiagramDto;
import org.camunda.bpm.engine.rest.dto.repository.ProcessDefinitionDto;
import org.camunda.bpm.engine.rest.dto.runtime.ProcessInstanceDto;
import org.camunda.bpm.engine.rest.dto.runtime.StartProcessInstanceDto;
import org.camunda.bpm.extension.hooks.rest.ProcessDefinitionRestResource;
import org.springframework.hateoas.EntityModel;

import javax.ws.rs.core.UriInfo;
import java.util.List;
import java.util.logging.Logger;
import java.util.stream.Collectors;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;


public class ProcessDefinitionRestResourceImpl implements ProcessDefinitionRestResource {

    private final Logger LOGGER = Logger.getLogger(ProcessDefinitionRestResourceImpl.class.getName());

    private final org.camunda.bpm.engine.rest.ProcessDefinitionRestService restService;

    public ProcessDefinitionRestResourceImpl(org.camunda.bpm.engine.rest.ProcessDefinitionRestService processEngineRestService) {
        restService = processEngineRestService;
    }

    @Override
    public List<ProcessDefinitionDto> getProcessDefinitions(UriInfo uriInfo, Integer firstResult, Integer maxResults) {
        List<ProcessDefinitionDto> response = restService.getProcessDefinitions(uriInfo, firstResult, maxResults);
        if (uriInfo.getQueryParameters() != null && uriInfo.getQueryParameters().containsKey("excludeInternal")) {
            response = response.stream()
                    .filter(processDefinitionDto -> processDefinitionDto.getName() != null
                            && !processDefinitionDto.getName().strip().endsWith("(Internal)"))
                    .collect(Collectors.toList());
        }
        return response;
    }

    @Override
    public EntityModel<ProcessDefinitionDto> getProcessDefinition(String key) {
        ProcessDefinitionDto dto = restService.getProcessDefinitionByKey(key).getProcessDefinition();
        return EntityModel.of(dto, linkTo(methodOn(ProcessDefinitionRestResourceImpl.class).getProcessDefinition(key)).withSelfRel());
    }

    @Override
    public EntityModel<ProcessDefinitionDiagramDto> getProcessDefinitionBpmn20Xml(String tenantId, String key) {
        ProcessDefinitionDiagramDto dto;
        if (tenantId!= null){
            dto =  restService.getProcessDefinitionByKeyAndTenantId(key, tenantId).getProcessDefinitionBpmn20Xml();
        }
        else{
            dto =  restService.getProcessDefinitionByKey(key).getProcessDefinitionBpmn20Xml();
        }

        return EntityModel.of(dto, linkTo(methodOn(ProcessDefinitionRestResourceImpl.class).getProcessDefinitionBpmn20Xml(tenantId, key)).withSelfRel());
    }

    @Override
    public EntityModel<ProcessInstanceDto> startProcessInstanceByKey(UriInfo context, StartProcessInstanceDto parameters, String key, String tenantId) {
        ProcessInstanceDto processInstanceDto;
        if (tenantId!= null){
            processInstanceDto = restService.getProcessDefinitionByKeyAndTenantId(key, tenantId).startProcessInstance(context, parameters);
        }
        else{
            processInstanceDto = restService.getProcessDefinitionByKey(key).startProcessInstance(context, parameters);
        }
        return EntityModel.of(processInstanceDto,
                linkTo(methodOn(ProcessDefinitionRestResourceImpl.class).startProcessInstanceByKey(context, parameters, key, tenantId)).withSelfRel());
    }
}
