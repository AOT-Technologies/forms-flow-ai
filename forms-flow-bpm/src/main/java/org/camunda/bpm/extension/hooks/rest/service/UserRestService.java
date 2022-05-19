package org.camunda.bpm.extension.hooks.rest.service;

import org.camunda.bpm.extension.hooks.rest.dto.UserProfileDto;

import java.util.List;
import java.util.Map;

public interface UserRestService {

    List<UserProfileDto> queryUsers(Map<String, Object> parameters);
}
