package org.camunda.bpm.extension.hooks.rest.service;

import org.camunda.bpm.extension.hooks.rest.dto.ProcessDefinitionDto;
import org.camunda.bpm.extension.hooks.rest.dto.ProcessInstanceDto;
import org.camunda.bpm.extension.hooks.rest.dto.StartProcessInstanceDto;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;

public interface ProcessDefinitionRestService {

    ResponseEntity<List<ProcessDefinitionDto>> getProcessDefinition(Map<String, Object> parameters);
    ResponseEntity<ProcessInstanceDto> startProcessInstanceByKey(Map<String, Object> parameters, StartProcessInstanceDto dto, String key);
}
