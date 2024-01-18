package org.camunda.bpm.extension.hooks.rest.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class TransitionInstanceDto extends org.camunda.bpm.engine.rest.dto.runtime.TransitionInstanceDto {
}
