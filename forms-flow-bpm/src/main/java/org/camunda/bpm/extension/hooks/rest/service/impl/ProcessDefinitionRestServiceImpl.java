package org.camunda.bpm.extension.hooks.rest.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import org.camunda.bpm.extension.commons.connector.HTTPServiceInvoker;
import org.camunda.bpm.extension.hooks.rest.constant.BpmClient;
import org.camunda.bpm.extension.hooks.rest.dto.ProcessDefinitionDiagramDto;
import org.camunda.bpm.extension.hooks.rest.dto.ProcessDefinitionDto;
import org.camunda.bpm.extension.hooks.rest.dto.ProcessInstanceDto;
import org.camunda.bpm.extension.hooks.rest.dto.StartProcessInstanceDto;
import org.camunda.bpm.extension.hooks.rest.service.AbstractRestService;
import org.camunda.bpm.extension.hooks.rest.service.ProcessDefinitionRestService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.text.MessageFormat;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.stream.Collectors;

@Service
public class ProcessDefinitionRestServiceImpl extends AbstractRestService implements ProcessDefinitionRestService {

    private static final Logger LOG = LoggerFactory.getLogger(ProcessDefinitionRestServiceImpl.class);

    public ProcessDefinitionRestServiceImpl(HTTPServiceInvoker httpServiceInvoker, Properties integrationCredentialProperties){
        super(httpServiceInvoker, integrationCredentialProperties);
    }

    @Override
    public ResponseEntity<List<ProcessDefinitionDto>> getProcessDefinition(Map<String, Object> parameters){

        List<ProcessDefinitionDto> response = null;
        if(BpmClient.CAMUNDA.getName().equals(bpmClient)) {
            String url = getBpmUrl("process-definition");
            ResponseEntity<String> data = httpServiceInvoker.executeWithParamsAndPayload(url, HttpMethod.GET, parameters, null);
            if (data.getStatusCode().is2xxSuccessful()) {
                ProcessDefinitionDto[] processDefinitionDtos = new ProcessDefinitionDto[0];
                try {
                    processDefinitionDtos = bpmObjectMapper.readValue(data.getBody(), ProcessDefinitionDto[].class);
                } catch (JsonProcessingException e) {
                    e.printStackTrace();
                }
                response = Arrays.asList(processDefinitionDtos);
            }
        }

        if(parameters != null && parameters.containsKey("excludeInternal")){
            if(Boolean.parseBoolean(parameters.get("excludeInternal").toString())){
                response = response.stream()
                        .filter(processDefinitionDto -> processDefinitionDto.getName() != null
                                && !processDefinitionDto.getName().strip().endsWith("(Internal)"))
                        .collect(Collectors.toList());
            }
        }

        return ResponseEntity.ok(response);
    }

    @Override
    public ResponseEntity<ProcessDefinitionDiagramDto> getProcessDefinitionBpmn20Xml(Map<String, Object> parameters, String key) {

        ProcessDefinitionDiagramDto response = null;
        if(BpmClient.CAMUNDA.getName().equals(bpmClient)) {
            String url = null;
            if(parameters.containsKey("tenantId")){
                url = bpmUrl + "/camunda/engine-rest/process-definition/key/{0}/tenant-id/{1}/xml";
                url = MessageFormat.format(url, key, parameters.get("tenantId"));
                parameters.remove("tenantId");
            } else {
                url = bpmUrl + "/camunda/engine-rest/process-definition/key/{0}/xml";
                url = MessageFormat.format(url, key);
            }
            ResponseEntity<String> data = httpServiceInvoker.executeWithParamsAndPayload(url, HttpMethod.GET, parameters, null);
            if (data.getStatusCode().is2xxSuccessful()) {
                try {
                    response = bpmObjectMapper.readValue(data.getBody(), ProcessDefinitionDiagramDto.class);
                } catch (JsonProcessingException e) {
                    e.printStackTrace();
                }
            }
        }
        return ResponseEntity.ok(response);
    }

    @Override
    public ResponseEntity<ProcessInstanceDto> startProcessInstanceByKey(Map<String, Object> parameters, StartProcessInstanceDto dto, String key) {

        ProcessInstanceDto response = null;
        if(BpmClient.CAMUNDA.getName().equals(bpmClient)) {
            String url = null;
            if(parameters.containsKey("tenantId")){
                url = bpmUrl + "/camunda/engine-rest/process-definition/key/{0}/tenant-id/{1}/start";
                url = MessageFormat.format(url, key, parameters.get("tenantId"));
                parameters.remove("tenantId");
            } else {
                url = bpmUrl + "/camunda/engine-rest/process-definition/key/{0}/start";
                url = MessageFormat.format(url, key);
            }
            ResponseEntity<String> data = httpServiceInvoker.executeWithParamsAndPayload(url, HttpMethod.POST, parameters, dto);
            if (data.getStatusCode().is2xxSuccessful()) {
                try {
                    response = bpmObjectMapper.readValue(data.getBody(), ProcessInstanceDto.class);
                } catch (JsonProcessingException e) {
                    e.printStackTrace();
                }
            }
        }
        return ResponseEntity.ok(response);
    }
}
