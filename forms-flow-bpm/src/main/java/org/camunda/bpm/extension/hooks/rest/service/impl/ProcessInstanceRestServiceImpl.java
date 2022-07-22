package org.camunda.bpm.extension.hooks.rest.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import org.camunda.bpm.extension.commons.connector.HTTPServiceInvoker;
import org.camunda.bpm.extension.hooks.rest.constant.BpmClient;
import org.camunda.bpm.extension.hooks.rest.dto.ActivityInstanceDto;
import org.camunda.bpm.extension.hooks.rest.service.AbstractRestService;
import org.camunda.bpm.extension.hooks.rest.service.ProcessInstanceRestService;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.text.MessageFormat;
import java.util.HashMap;
import java.util.Properties;

@Service
public class ProcessInstanceRestServiceImpl  extends AbstractRestService implements ProcessInstanceRestService {

    public ProcessInstanceRestServiceImpl(HTTPServiceInvoker httpServiceInvoker, Properties integrationCredentialProperties) {
        super(httpServiceInvoker, integrationCredentialProperties);
    }

    @Override
    public ResponseEntity<ActivityInstanceDto> getActivityInstanceTree(String id) {

        ActivityInstanceDto response = null;
        if(BpmClient.CAMUNDA.getName().equals(bpmClient)) {
            String url = bpmUrl + "/camunda/engine-rest/process-instance/{0}/activity-instances";
            url = MessageFormat.format(url, id);
            ResponseEntity<String> data = httpServiceInvoker.executeWithParamsAndPayload(url, HttpMethod.GET, new HashMap<>(), null);
            if (data.getStatusCode().is2xxSuccessful()) {
                try {
                    response = bpmObjectMapper.readValue(data.getBody(), ActivityInstanceDto.class);
                } catch (JsonProcessingException e) {
                    e.printStackTrace();
                }
            }
        }
        return ResponseEntity.ok(response);
    }
}
