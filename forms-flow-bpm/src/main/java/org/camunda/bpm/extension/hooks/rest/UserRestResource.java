package org.camunda.bpm.extension.hooks.rest;

import org.springframework.hateoas.EntityModel;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import javax.ws.rs.core.MediaType;
import java.util.Map;

public interface UserRestResource extends RestResource{

    String PATH = "/user";

    @GetMapping(produces = MediaType.APPLICATION_JSON)
    EntityModel<String> queryUsers(@RequestParam Map<String, Object> parameters);
}
