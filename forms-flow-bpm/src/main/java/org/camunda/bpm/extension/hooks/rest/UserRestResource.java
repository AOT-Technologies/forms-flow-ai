package org.camunda.bpm.extension.hooks.rest;

import com.fasterxml.jackson.core.JsonProcessingException;
import org.camunda.bpm.extension.hooks.rest.dto.UserProfileDto;
import org.springframework.hateoas.CollectionModel;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import javax.ws.rs.core.MediaType;
import java.util.Map;

@RequestMapping(RestResource.BASE_PATH+UserRestResource.PATH)
public interface UserRestResource extends RestResource{

    String PATH = "/user";

    @GetMapping(produces = MediaType.APPLICATION_JSON)
    CollectionModel<UserProfileDto> queryUsers(@RequestParam Map<String, Object> parameters) throws JsonProcessingException;
}
