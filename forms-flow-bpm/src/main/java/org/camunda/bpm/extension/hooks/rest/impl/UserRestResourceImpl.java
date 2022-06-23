package org.camunda.bpm.extension.hooks.rest.impl;

import org.camunda.bpm.extension.hooks.rest.RestResource;
import org.camunda.bpm.extension.hooks.rest.UserRestResource;
import org.camunda.bpm.extension.hooks.rest.dto.UserProfileDto;
import org.camunda.bpm.extension.hooks.rest.service.UserRestService;
import org.springframework.hateoas.CollectionModel;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

@RestController
@RequestMapping(RestResource.BASE_PATH+"/v1"+ UserRestResource.PATH)
public class UserRestResourceImpl implements UserRestResource{

    private final UserRestService userRestService;

    public UserRestResourceImpl(UserRestService userRestService){
        this.userRestService = userRestService;
    }

    @Override
    public CollectionModel<UserProfileDto> queryUsers(Map<String, Object> parameters) {

        ResponseEntity<List<UserProfileDto>> response = userRestService.queryUsers(parameters);
        return CollectionModel.of(response.getBody(),
                linkTo(methodOn(UserRestResourceImpl.class).queryUsers(parameters)).withSelfRel());
    }
}
