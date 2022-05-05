package org.camunda.bpm.extension.hooks.listeners.execution;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.lang.StringUtils;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.ExecutionListener;
import org.camunda.bpm.engine.delegate.Expression;
import org.camunda.bpm.extension.commons.connector.HTTPServiceInvoker;
import org.camunda.bpm.extension.hooks.exceptions.ApplicationServiceException;
import org.camunda.bpm.extension.hooks.listeners.BaseListener;
import org.camunda.bpm.extension.hooks.services.FormSubmissionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import javax.annotation.Resource;
import javax.inject.Named;


import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * External Submission Listener.
 * This class supports creation of submission for instances created from external system
 */
@Named("ExternalSubmissionListener")
public class ExternalSubmissionListener extends BaseListener implements ExecutionListener {

    private static final Logger LOGGER = LoggerFactory.getLogger(ExternalSubmissionListener.class);

    @Autowired
    private FormSubmissionService formSubmissionService;
    @Resource(name = "bpmObjectMapper")
    private ObjectMapper bpmObjectMapper;
    @Autowired
    private HTTPServiceInvoker httpServiceInvoker;

    private Expression formName;

    @Override
    public void notify(DelegateExecution execution) {
        try {
            String formUrl = getFormUrl(execution);
            String submissionId = formSubmissionService.createSubmission(formUrl, formSubmissionService.createFormSubmissionData(execution.getVariables()));
            if(StringUtils.isNotBlank(submissionId)){
                execution.setVariable("formUrl", formUrl+"/"+submissionId);
                createApplication(execution, true);
            }
        } catch(IOException | RuntimeException ex) {
            handleException(execution, ExceptionSource.EXECUTION, ex);
        }
    }

    private String getFormId(DelegateExecution execution) throws IOException {
        String formName =  String.valueOf(this.formName.getValue(execution));
        return formSubmissionService.getFormIdByName(httpServiceInvoker.getProperties().getProperty("formio.url")+"/"+formName);
    }

    private String getFormUrl(DelegateExecution execution) throws IOException {
        return httpServiceInvoker.getProperties().getProperty("formio.url")+"/form/"+getFormId(execution)+"/submission";

    }

    /**
     *
     * @param execution - DelegateExecution data
     * @param retryOnce - If formsflow api failed to respond 201 then the application will try once again and then it fail.
     * @throws JsonProcessingException
     */
    private void createApplication(DelegateExecution execution, boolean retryOnce) throws JsonProcessingException {
        Map<String,Object> data = new HashMap<>();
        String formUrl = String.valueOf(execution.getVariable("formUrl"));
        data.put("formUrl",formUrl);
        data.put("formId",StringUtils.substringBetween(formUrl, "/form/", "/submission/"));
        data.put("submissionId",StringUtils.substringAfter(formUrl, "/submission/"));
        data.put("processInstanceId",execution.getProcessInstanceId());
        ResponseEntity<String> response = httpServiceInvoker.execute(httpServiceInvoker.getProperties().getProperty("api.url")+"/application/create", HttpMethod.POST, bpmObjectMapper.writeValueAsString(data));
        if(response.getStatusCode().value() == HttpStatus.CREATED.value()) {
            JsonNode jsonNode = bpmObjectMapper.readTree(response.getBody());
            String applicationId = jsonNode.get("id").asText();
            execution.setVariable("applicationId", applicationId);
        } else {
            if(retryOnce) {
                LOGGER.warn("Retrying the application create once more due to previous failure");
                createApplication(execution, false);
            } else {
                throw new ApplicationServiceException("Unable to create application " + ". Message Body: " +
                        response.getBody());
            }
        }
    }
}
