package org.camunda.bpm.extension.hooks.rest;

import org.camunda.bpm.engine.rest.dto.identity.UserProfileDto;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;

import javax.ws.rs.core.UriInfo;
import java.util.List;

@RestController
@RequestMapping(RestResource.BASE_PATH+"/v1"+TaskRestResource.PATH)
public class UserRestResourceImpl implements UserRestResource{

    private WebClient webClient;

    public UserRestResourceImpl(WebClient webClient){
        this.webClient = webClient;
    }

    @Override
    public List<UserProfileDto> queryUsers(UriInfo uriInfo, Integer firstResult, Integer maxResults) {
        return null;
    }
}
