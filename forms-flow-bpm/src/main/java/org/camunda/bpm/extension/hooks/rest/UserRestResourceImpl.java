package org.camunda.bpm.extension.hooks.rest;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.camunda.bpm.extension.commons.connector.HTTPServiceInvoker;
import org.camunda.bpm.extension.hooks.rest.dto.UserProfileDto;
import org.springframework.hateoas.CollectionModel;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

@RestController
@RequestMapping(RestResource.BASE_PATH+"/v1"+UserRestResource.PATH)
public class UserRestResourceImpl implements UserRestResource{

    private final HTTPServiceInvoker httpServiceInvoker;
    private final Properties properties;
    @Resource(name = "bpmObjectMapper")
    private ObjectMapper bpmObjectMapper;

    public UserRestResourceImpl(HTTPServiceInvoker httpServiceInvoker, Properties integrationCredentialProperties){
        this.httpServiceInvoker = httpServiceInvoker;
        this.properties = integrationCredentialProperties;
    }

    @Override
    public CollectionModel<UserProfileDto> queryUsers(Map<String, Object> parameters) throws JsonProcessingException {

        List<UserProfileDto> response = null;
        String url = properties.getProperty("bpm.url")+"/camunda/engine-rest/user";
        ResponseEntity<String> data = httpServiceInvoker.executeWithParams(url, HttpMethod.GET, parameters);
        if(data.getStatusCode().is2xxSuccessful()) {
            UserProfileDto[] userProfileDtos = bpmObjectMapper.readValue(data.getBody(), UserProfileDto[].class);
            response = Arrays.asList(userProfileDtos);
        }
        return CollectionModel.of(response,
                linkTo(methodOn(UserRestResourceImpl.class).queryUsers(parameters)).withSelfRel());
    }
}
