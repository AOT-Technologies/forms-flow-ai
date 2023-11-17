package org.camunda.bpm.extension.hooks.rest.impl;

import org.camunda.bpm.engine.rest.ProcessInstanceRestService;
import org.camunda.bpm.engine.rest.dto.VariableValueDto;
import org.camunda.bpm.engine.rest.dto.runtime.ActivityInstanceDto;
import org.camunda.bpm.extension.hooks.rest.ProcessInstanceRestResource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;

public class ProcessInstanceRestResourceImpl implements ProcessInstanceRestResource {

    private static final Logger LOG = LoggerFactory.getLogger(ProcessInstanceRestResourceImpl.class);

    private final ProcessInstanceRestService restService;

    public ProcessInstanceRestResourceImpl(ProcessInstanceRestService processInstanceRestService) {
        this.restService = processInstanceRestService;
    }

    @Override
    public ActivityInstanceDto getActivityInstanceTree(String id) {
        return restService.getProcessInstance(id).getActivityInstanceTree();
    }

	@Override
	public Map<String, VariableValueDto> getVariables(boolean deserializeValues, String id) {
		return restService.getProcessInstance(id).getVariablesResource().getVariables(deserializeValues);
	}
}
