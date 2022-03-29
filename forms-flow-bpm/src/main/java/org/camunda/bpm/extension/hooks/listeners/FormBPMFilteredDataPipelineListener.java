package org.camunda.bpm.extension.hooks.listeners;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.DeserializationFeature;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.DelegateTask;
import org.camunda.bpm.engine.delegate.ExecutionListener;
import org.camunda.bpm.engine.delegate.TaskListener;
import org.camunda.bpm.extension.commons.connector.HTTPServiceInvoker;
import org.camunda.bpm.extension.hooks.exceptions.ApplicationServiceException;
import org.camunda.bpm.extension.hooks.listeners.data.FilterInfo;
import org.camunda.bpm.extension.hooks.listeners.data.FormProcessMappingData;
import org.camunda.bpm.extension.hooks.services.FormSubmissionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class FormBPMFilteredDataPipelineListener   extends BaseListener implements TaskListener, ExecutionListener {

    private static final Logger LOGGER = LoggerFactory.getLogger(FormBPMFilteredDataPipelineListener.class);

    @Autowired
    private FormSubmissionService formSubmissionService;
    @Autowired
    private HTTPServiceInvoker httpServiceInvoker;

    @Override
    public void notify(DelegateExecution execution) {
        try {
            syncFormVariables(execution);
        } catch (IOException | ApplicationServiceException e) {
            handleException(execution, ExceptionSource.EXECUTION, e);
        }
    }

    @Override
    public void notify(DelegateTask delegateTask) {
        try {
            syncFormVariables(delegateTask.getExecution());
        } catch (IOException | ApplicationServiceException e) {
            handleException(delegateTask.getExecution(), ExceptionSource.TASK, e);
        }
    }

    private void syncFormVariables(DelegateExecution execution) throws IOException {
        ResponseEntity<String> response = httpServiceInvoker.execute(getApplicationUrl(execution), HttpMethod.GET,  null);
        if(response.getStatusCodeValue() != HttpStatus.OK.value()) {
            throw new ApplicationServiceException("Unable to update application "+ ". Message Body: " +
                    response.getBody());
        }
        ObjectMapper mapper = new ObjectMapper();
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

        Map<String, FilterInfo> filterInfoMap = new HashMap<>();
        try {
            FormProcessMappingData body = mapper.readValue(response.getBody(), FormProcessMappingData.class);
            List<FilterInfo> filterInfoList = body.getTaskVariable();
            filterInfoMap = filterInfoList.stream()
                    .collect(Collectors.toMap(FilterInfo::getKey, Function.identity()));
        } catch (JsonProcessingException e) {
            e.printStackTrace();
            throw new ApplicationServiceException(e.getMessage(), e);
        }

        if(!filterInfoMap.isEmpty()){
            Map<String,Object> dataMap = formSubmissionService.retrieveFormValues(String.valueOf(execution.getVariables().get("formUrl")));
            for (Map.Entry<String, Object> entry: dataMap.entrySet()) {
                if(filterInfoMap.containsKey(entry.getKey())) {
                    execution.setVariable(entry.getKey(), entry.getValue());
                }
            }
        }

    }

    /**
     * Returns the endpoint of application API.
     * @param execution
     * @return
     */
    private String getApplicationUrl(DelegateExecution execution){
        return httpServiceInvoker.getProperties().getProperty("api.url")+"/form/applicationid/"+execution.getVariable("applicationId");
    }
}
