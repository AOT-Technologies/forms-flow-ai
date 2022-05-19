package org.camunda.bpm.extension.hooks.rest.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import org.camunda.bpm.extension.commons.connector.HTTPServiceInvoker;
import org.camunda.bpm.extension.hooks.rest.constant.BpmClient;
import org.camunda.bpm.extension.hooks.rest.dto.ProcessInstanceDto;
import org.camunda.bpm.extension.hooks.rest.dto.StartProcessInstanceDto;
import org.camunda.bpm.extension.hooks.rest.service.AbstractRestService;
import org.camunda.bpm.extension.hooks.rest.service.ProcessDefinitionRestService;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.text.MessageFormat;
import java.util.Map;
import java.util.Properties;

@Service
public class ProcessDefinitionRestServiceImpl extends AbstractRestService implements ProcessDefinitionRestService {

    public ProcessDefinitionRestServiceImpl(HTTPServiceInvoker httpServiceInvoker, Properties integrationCredentialProperties){
        super(httpServiceInvoker, integrationCredentialProperties);
    }

    @Override
    public ResponseEntity<ProcessInstanceDto> startProcessInstance(Map<String, Object> parameters, StartProcessInstanceDto dto, String id) {

        ProcessInstanceDto response = null;
        if(BpmClient.CAMUNDA.getName().equals(bpmClient)) {
            String url = bpmUrl + "/camunda/engine-rest//process-definition/{0}/start";
            url = MessageFormat.format(url, id);
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
