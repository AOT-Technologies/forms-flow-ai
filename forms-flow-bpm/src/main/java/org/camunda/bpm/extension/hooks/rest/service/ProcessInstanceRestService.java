package org.camunda.bpm.extension.hooks.rest.service;

import org.camunda.bpm.extension.hooks.rest.dto.ActivityInstanceDto;
import org.springframework.http.ResponseEntity;

import java.util.Map;

public interface ProcessInstanceRestService {
    ResponseEntity<ActivityInstanceDto> getActivityInstanceTree(String id);
}
