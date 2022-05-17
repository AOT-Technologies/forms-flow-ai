package org.camunda.bpm.extension.hooks.rest;

import org.camunda.bpm.extension.commons.connector.HTTPServiceInvoker;
import org.camunda.bpm.extension.hooks.rest.dto.UserProfileDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.hateoas.EntityModel;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;
import java.util.Properties;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

@RestController
@RequestMapping(RestResource.BASE_PATH+"/v1"+UserRestResource.PATH)
public class UserRestResourceImpl implements UserRestResource{

    private HTTPServiceInvoker httpServiceInvoker;

    @Autowired
    private Properties integrationCredentialProperties;

    public UserRestResourceImpl(HTTPServiceInvoker httpServiceInvoker){
        this.httpServiceInvoker = httpServiceInvoker;
    }

    @Override
    public EntityModel<String> queryUsers(Map<String, Object> parameters) {

        List<UserProfileDto> response = null;
        String url = integrationCredentialProperties.getProperty("bpm.url")+"/camunda/engine-rest/user";
        ResponseEntity<String> data = httpServiceInvoker.executeWithParams(url, HttpMethod.GET, parameters);

        return EntityModel.of(data.getBody(),
                linkTo(methodOn(UserRestResourceImpl.class).queryUsers(parameters)).withSelfRel());
    }
}
