package org.camunda.bpm.extension.hooks.listeners;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.DelegateTask;
import org.camunda.bpm.engine.delegate.ExecutionListener;
import org.camunda.bpm.engine.delegate.TaskListener;
import org.camunda.bpm.extension.commons.connector.HTTPServiceInvoker;
import org.camunda.bpm.extension.commons.ro.res.IResponse;
import org.camunda.bpm.extension.commons.utils.RestAPIBuilderUtil;
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

import javax.annotation.Resource;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import static org.camunda.bpm.extension.commons.utils.VariableConstants.FORM_URL;
import static org.camunda.bpm.extension.commons.utils.VariableConstants.APPLICATION_ID;

/**
 * Form BPM Filtered Data Pipeline Listener.
 * This class copies specific data from form document data into CAM variables.
 */

@Component
public class FormBPMFilteredDataPipelineListener   extends BaseListener implements TaskListener, ExecutionListener {

    private static final Logger LOGGER = LoggerFactory.getLogger(FormBPMFilteredDataPipelineListener.class);

    @Resource(name = "bpmObjectMapper")
    private ObjectMapper bpmObjectMapper;
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
        ResponseEntity<IResponse> response = httpServiceInvoker.execute(getApplicationUrl(execution), HttpMethod.GET,  null, FormProcessMappingData.class);
        if(response.getStatusCodeValue() != HttpStatus.OK.value()) {
            throw new ApplicationServiceException("Unable to update application "+ ". Message Body: " +
                    response.getBody());
        }
        FormProcessMappingData body = (FormProcessMappingData) response.getBody();
        if(body != null) {
            List<FilterInfo> filterInfoList = Arrays.asList(body.getTaskVariableList(bpmObjectMapper));
            Map<String, FilterInfo> filterInfoMap = filterInfoList.stream()
                    .collect(Collectors.toMap(FilterInfo::getKey, Function.identity()));

            if (!filterInfoMap.isEmpty()) {
                Map<String, Object> dataMap = formSubmissionService.retrieveFormValues(String.valueOf(execution.getVariables().get(FORM_URL)));
                for (Map.Entry<String, Object> entry : dataMap.entrySet()) {
                    if (filterInfoMap.containsKey(entry.getKey())) {
                        execution.setVariable(entry.getKey(), entry.getValue());
                    }
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
        return RestAPIBuilderUtil.getApplicationUrl(String.valueOf(execution.getVariable(APPLICATION_ID)));
    }
}
