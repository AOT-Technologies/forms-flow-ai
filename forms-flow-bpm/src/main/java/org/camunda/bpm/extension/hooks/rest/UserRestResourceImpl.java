package org.camunda.bpm.extension.hooks.rest;

import org.camunda.bpm.extension.hooks.rest.dto.UserProfileDto;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping(RestResource.BASE_PATH+"/v1"+TaskRestResource.PATH)
public class UserRestResourceImpl implements UserRestResource{

    private WebClient webClient;

    public UserRestResourceImpl(WebClient webClient){
        this.webClient = webClient;
    }

    @Override
    public List<UserProfileDto> queryUsers(Map<String, Object> parameters) {


        return new ArrayList<>();
    }
}
