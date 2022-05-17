package org.camunda.bpm.extension.hooks.rest;

import com.fasterxml.jackson.core.JsonProcessingException;
import org.camunda.bpm.extension.hooks.rest.dto.UserProfileDto;
import org.springframework.hateoas.CollectionModel;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Map;

public interface UserRestResource extends RestResource{

    String PATH = "/user";

    CollectionModel<UserProfileDto> queryUsers(@RequestParam Map<String, Object> parameters) throws JsonProcessingException;
}
