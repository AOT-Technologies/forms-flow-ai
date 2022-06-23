package org.camunda.bpm.extension.hooks.rest.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import org.camunda.bpm.extension.commons.connector.HTTPServiceInvoker;
import org.camunda.bpm.extension.hooks.rest.constant.BpmClient;
import org.camunda.bpm.extension.hooks.rest.dto.UserProfileDto;
import org.camunda.bpm.extension.hooks.rest.service.AbstractRestService;
import org.camunda.bpm.extension.hooks.rest.service.UserRestService;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Properties;

@Service
public class UserRestServiceImpl extends AbstractRestService implements UserRestService {

    public UserRestServiceImpl(HTTPServiceInvoker httpServiceInvoker, Properties integrationCredentialProperties){
        super(httpServiceInvoker, integrationCredentialProperties);
    }

    @Override
    public ResponseEntity<List<UserProfileDto>> queryUsers(Map<String, Object> parameters){
        List<UserProfileDto> response = null;
        if(BpmClient.CAMUNDA.getName().equals(bpmClient)) {
            String url = bpmUrl + "/camunda/engine-rest/user";
            ResponseEntity<String> data = httpServiceInvoker.executeWithParamsAndPayload(url, HttpMethod.GET, parameters, null);
            if (data.getStatusCode().is2xxSuccessful()) {
                UserProfileDto[] userProfileDtos = new UserProfileDto[0];
                try {
                    userProfileDtos = bpmObjectMapper.readValue(data.getBody(), UserProfileDto[].class);
                } catch (JsonProcessingException e) {
                    e.printStackTrace();
                }
                response = Arrays.asList(userProfileDtos);
            }
        }
        return ResponseEntity.ok(response);
    }
}
