package org.camunda.bpm.extension.hooks.rest.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.io.Serializable;

@JsonIgnoreProperties(ignoreUnknown = true)
public class CompleteTaskDto extends org.camunda.bpm.engine.rest.dto.task.CompleteTaskDto implements Serializable {
    private static final long serialVersionUID = 1L;
}
