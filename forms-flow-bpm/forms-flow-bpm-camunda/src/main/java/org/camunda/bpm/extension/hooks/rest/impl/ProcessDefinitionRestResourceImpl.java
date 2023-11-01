package org.camunda.bpm.extension.hooks.rest.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.camunda.bpm.engine.rest.dto.runtime.StartProcessInstanceDto;
import org.camunda.bpm.engine.rest.dto.CountResultDto;
import org.camunda.bpm.extension.hooks.rest.ProcessDefinitionRestResource;
import org.bpm.utils.dto.ProcessInstanceDto;
import org.bpm.utils.dto.ProcessDefinitionDiagramDto;
import org.bpm.utils.dto.ProcessDefinitionDto;

import javax.ws.rs.core.UriInfo;
import java.util.List;
import java.util.logging.Logger;
import java.util.stream.Collectors;


public class ProcessDefinitionRestResourceImpl implements ProcessDefinitionRestResource {

    private final Logger LOG = Logger.getLogger(ProcessDefinitionRestResourceImpl.class.getName());

    private final org.camunda.bpm.engine.rest.ProcessDefinitionRestService restService;

    private ObjectMapper bpmObjectMapper = new ObjectMapper();

    public ProcessDefinitionRestResourceImpl(org.camunda.bpm.engine.rest.ProcessDefinitionRestService processEngineRestService) {
        restService = processEngineRestService;
    }

    @Override
    public List<ProcessDefinitionDto> getProcessDefinitions(UriInfo uriInfo, Integer firstResult, Integer maxResults) {
        List<ProcessDefinitionDto> response = bpmObjectMapper.convertValue(
                restService.getProcessDefinitions(uriInfo, firstResult, maxResults),
                new TypeReference<List<ProcessDefinitionDto>>(){});
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
        ProcessDefinitionDto dto = bpmObjectMapper.convertValue(
                restService.getProcessDefinitionByKey(key).getProcessDefinition(), ProcessDefinitionDto.class);
        return dto;
    }

    @Override
    public ProcessDefinitionDiagramDto getProcessDefinitionBpmn20Xml(String tenantId, String key) {
        ProcessDefinitionDiagramDto dto;
        if (tenantId!= null){
            dto =  bpmObjectMapper.convertValue(
                    restService.getProcessDefinitionByKeyAndTenantId(key, tenantId).getProcessDefinitionBpmn20Xml(),
                    ProcessDefinitionDiagramDto.class);
        }
        else{
            dto =  bpmObjectMapper.convertValue(
                    restService.getProcessDefinitionByKey(key).getProcessDefinitionBpmn20Xml(),
                    ProcessDefinitionDiagramDto.class);
        }
        return dto;
    }

    @Override
    public ProcessInstanceDto startProcessInstanceByKey(
            UriInfo context, org.bpm.utils.dto.StartProcessInstanceDto parameters, String key, String tenantId) {
        ProcessInstanceDto processInstanceDto;
        StartProcessInstanceDto params = bpmObjectMapper.convertValue(
                parameters, StartProcessInstanceDto.class);
        if (tenantId!= null){
            processInstanceDto = bpmObjectMapper.convertValue(
                    restService.getProcessDefinitionByKeyAndTenantId(key, tenantId).startProcessInstance(context, params),
                    ProcessInstanceDto.class);
        }
        else{
            processInstanceDto = bpmObjectMapper.convertValue(
                    restService.getProcessDefinitionByKey(key).startProcessInstance(context, params),
                    ProcessInstanceDto.class);
        }
        return processInstanceDto;
    }
    
    @Override
    public CountResultDto getProcessDefinitionsCount(UriInfo uriInfo){
        return restService.getProcessDefinitionsCount(uriInfo);
    }
}
