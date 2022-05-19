package org.camunda.bpm.extension.hooks.rest.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.camunda.bpm.extension.commons.connector.HTTPServiceInvoker;
import org.camunda.bpm.extension.hooks.rest.dto.UserProfileDto;
import org.camunda.bpm.extension.hooks.rest.service.UserRestService;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Properties;

@Service
public class UserRestServiceImpl implements UserRestService {

    private final String bpmUrl;
    private final String bpmClient;
    @Resource(name = "bpmObjectMapper")
    private ObjectMapper bpmObjectMapper;
    private final HTTPServiceInvoker httpServiceInvoker;

    public UserRestServiceImpl(HTTPServiceInvoker httpServiceInvoker, Properties integrationCredentialProperties){
        this.httpServiceInvoker = httpServiceInvoker;
        this.bpmUrl = integrationCredentialProperties.getProperty("bpm.url");
        this.bpmClient = integrationCredentialProperties.getProperty("bpm.client");
    }

    @Override
    public List<UserProfileDto> queryUsers(Map<String, Object> parameters){
        List<UserProfileDto> response = null;
        String url = bpmUrl+"/camunda/engine-rest/user";
        ResponseEntity<String> data = httpServiceInvoker.executeWithParams(url, HttpMethod.GET, parameters);
        if(data.getStatusCode().is2xxSuccessful()) {
            UserProfileDto[] userProfileDtos = new UserProfileDto[0];
            try {
                userProfileDtos = bpmObjectMapper.readValue(data.getBody(), UserProfileDto[].class);
            } catch (JsonProcessingException e) {
                e.printStackTrace();
            }
            response = Arrays.asList(userProfileDtos);
        }
        return response;
    }
}
