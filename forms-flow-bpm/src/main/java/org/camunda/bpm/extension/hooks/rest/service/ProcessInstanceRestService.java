package org.camunda.bpm.extension.hooks.rest.service;

import org.camunda.bpm.extension.hooks.rest.dto.ActivityInstanceDto;
import org.springframework.http.ResponseEntity;

public interface ProcessInstanceRestService {
    ResponseEntity<ActivityInstanceDto> getActivityInstanceTree();
}
