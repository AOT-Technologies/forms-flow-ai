package org.camunda.bpm.extension.hooks.rest;

import org.camunda.bpm.extension.hooks.rest.dto.UserProfileDto;
import org.springframework.hateoas.EntityModel;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

@RestController
@RequestMapping(RestResource.BASE_PATH+"/v1"+TaskRestResource.PATH)
public class UserRestResourceImpl implements UserRestResource{

    private WebClient webClient;

    public UserRestResourceImpl(WebClient webClient){
        this.webClient = webClient;
    }

    @Override
    public EntityModel<List<UserProfileDto>> queryUsers(Map<String, Object> parameters) {

        List<UserProfileDto> response = null;

        return EntityModel.of(response,
                linkTo(methodOn(UserRestResourceImpl.class).queryUsers(parameters)).withSelfRel());
    }
}
