package org.camunda.bpm.extension.hooks.rest.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.camunda.bpm.extension.commons.ro.req.IRequest;

import java.io.Serializable;

@JsonIgnoreProperties(ignoreUnknown = true)
public class StartProcessInstanceDto extends org.camunda.bpm.engine.rest.dto.runtime.StartProcessInstanceDto implements Serializable, IRequest {
    private static final long serialVersionUID = 1L;
}
