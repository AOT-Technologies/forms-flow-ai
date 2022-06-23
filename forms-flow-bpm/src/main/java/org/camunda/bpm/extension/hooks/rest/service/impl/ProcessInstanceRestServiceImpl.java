package org.camunda.bpm.extension.hooks.rest.service.impl;

import org.camunda.bpm.extension.commons.connector.HTTPServiceInvoker;
import org.camunda.bpm.extension.hooks.rest.dto.ActivityInstanceDto;
import org.camunda.bpm.extension.hooks.rest.service.AbstractRestService;
import org.camunda.bpm.extension.hooks.rest.service.ProcessInstanceRestService;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Properties;

@Service
public class ProcessInstanceRestServiceImpl  extends AbstractRestService implements ProcessInstanceRestService {

    public ProcessInstanceRestServiceImpl(HTTPServiceInvoker httpServiceInvoker, Properties integrationCredentialProperties) {
        super(httpServiceInvoker, integrationCredentialProperties);
    }

    @Override
    public ResponseEntity<ActivityInstanceDto> getActivityInstanceTree() {
        return null;
    }
}
