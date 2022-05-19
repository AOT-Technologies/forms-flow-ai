package org.camunda.bpm.extension.hooks.rest.dto;

import org.camunda.bpm.extension.commons.ro.req.IRequest;

import java.io.Serializable;

public class StartProcessInstanceDto extends org.camunda.bpm.engine.rest.dto.runtime.StartProcessInstanceDto implements Serializable, IRequest {
	private static final long serialVersionUID = 1L;
}
