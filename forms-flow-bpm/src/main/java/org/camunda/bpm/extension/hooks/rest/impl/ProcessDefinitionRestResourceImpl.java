package org.camunda.bpm.extension.hooks.rest.impl;

import jakarta.ws.rs.core.UriInfo;
import org.camunda.bpm.engine.rest.dto.repository.ProcessDefinitionDiagramDto;
import org.camunda.bpm.engine.rest.dto.repository.ProcessDefinitionDto;
import org.camunda.bpm.engine.rest.dto.runtime.ProcessInstanceDto;
import org.camunda.bpm.engine.rest.dto.runtime.StartProcessInstanceDto;
import org.camunda.bpm.extension.hooks.rest.ProcessDefinitionRestResource;

import java.util.List;
import java.util.logging.Logger;
import java.util.stream.Collectors;


public class ProcessDefinitionRestResourceImpl implements ProcessDefinitionRestResource {

    private final Logger LOG = Logger.getLogger(ProcessDefinitionRestResourceImpl.class.getName());

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
    public ProcessDefinitionDto getProcessDefinition(String key) {
        return restService.getProcessDefinitionByKey(key).getProcessDefinition();

    }

    @Override
    public ProcessDefinitionDiagramDto getProcessDefinitionBpmn20Xml(String tenantId, String key) {
        ProcessDefinitionDiagramDto processDefinitionDiagramDto;
        if (tenantId != null) {
            processDefinitionDiagramDto = restService.getProcessDefinitionByKeyAndTenantId(key, tenantId).getProcessDefinitionBpmn20Xml();
        } else {
            processDefinitionDiagramDto = restService.getProcessDefinitionByKey(key).getProcessDefinitionBpmn20Xml();
        }
        return processDefinitionDiagramDto;

    }

    @Override
    public ProcessInstanceDto startProcessInstanceByKey(UriInfo context, StartProcessInstanceDto parameters, String key, String tenantId) {
        ProcessInstanceDto processInstanceDto;
        if (tenantId!= null){
            processInstanceDto = restService.getProcessDefinitionByKeyAndTenantId(key, tenantId).startProcessInstance(context, parameters);
        }
        else{
            processInstanceDto = restService.getProcessDefinitionByKey(key).startProcessInstance(context, parameters);
        }
        return processInstanceDto;
    }
}
