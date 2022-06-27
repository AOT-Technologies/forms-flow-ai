package org.camunda.bpm.extension.hooks.rest.service;

import org.camunda.bpm.extension.hooks.rest.dto.ProcessDefinitionDiagramDto;
import org.camunda.bpm.extension.hooks.rest.dto.ProcessDefinitionDto;
import org.camunda.bpm.extension.hooks.rest.dto.ProcessInstanceDto;
import org.camunda.bpm.extension.hooks.rest.dto.StartProcessInstanceDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.Map;

public interface ProcessDefinitionRestService {

    ResponseEntity<List<ProcessDefinitionDto>> getProcessDefinition(Map<String, Object> parameters);

    ResponseEntity<ProcessDefinitionDiagramDto> getProcessDefinitionBpmn20Xml(@RequestParam Map<String, Object> parameters, String key);

    ResponseEntity<ProcessInstanceDto> startProcessInstanceByKey(Map<String, Object> parameters, StartProcessInstanceDto dto, String key);
}
