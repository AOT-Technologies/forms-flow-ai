package org.camunda.bpm.extension.hooks.rest.service;

import org.camunda.bpm.extension.hooks.rest.dto.UserProfileDto;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;

public interface UserRestService {

    ResponseEntity<List<UserProfileDto>> queryUsers(Map<String, Object> parameters);
}
