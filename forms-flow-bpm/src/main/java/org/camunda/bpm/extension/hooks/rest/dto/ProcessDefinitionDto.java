package org.camunda.bpm.extension.hooks.rest.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.io.Serializable;

@JsonIgnoreProperties(ignoreUnknown = true)
public class ProcessDefinitionDto extends org.camunda.bpm.engine.rest.dto.repository.ProcessDefinitionDto implements Serializable {
}
