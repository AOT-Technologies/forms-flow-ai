package org.camunda.bpm.extension.hooks.listeners.execution;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.lang.StringUtils;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.ExecutionListener;
import org.camunda.bpm.engine.delegate.Expression;
import org.camunda.bpm.extension.commons.connector.HTTPServiceInvoker;
import org.camunda.bpm.extension.hooks.listeners.BaseListener;
import org.camunda.bpm.extension.hooks.services.FormSubmissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import javax.inject.Named;


import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;

/**
 * This class supports creation of submission for instances created from external system
 * @author sumathi.thirumani@aot-technologies.com
 */
@Named("ExternalSubmissionListener")
public class ExternalSubmissionListener extends BaseListener implements ExecutionListener {

    private final Logger LOGGER = Logger.getLogger(ExternalSubmissionListener.class.getName());

    @Autowired
    private FormSubmissionService formSubmissionService;

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
                createApplication(execution);
            }
        } catch(IOException ex) {
            handleException(execution, ExceptionSource.EXECUTION, ex);
        }
    }

    private boolean isExists(DelegateExecution execution) {
        return execution.getVariables().containsKey("formUrl");
    }

    private String getFormId(DelegateExecution execution) throws IOException {
        String formName =  String.valueOf(this.formName.getValue(execution));
        return formSubmissionService.getFormIdByName(httpServiceInvoker.getProperties().getProperty("formio.url")+"/"+formName);
    }

    private String getFormUrl(DelegateExecution execution) throws IOException {
        return httpServiceInvoker.getProperties().getProperty("formio.url")+"/form/"+getFormId(execution)+"/submission";

    }

    private void createApplication(DelegateExecution execution) throws JsonProcessingException {
        Map<String,Object> data = new HashMap<>();
        String formUrl = String.valueOf(execution.getVariable("formUrl"));
        data.put("formUrl",formUrl);
        data.put("formId",StringUtils.substringBetween(formUrl, "/form/", "/submission/"));
        data.put("submissionId",StringUtils.substringAfter(formUrl, "/submission/"));
        data.put("processInstanceId",execution.getProcessInstanceId());
        ResponseEntity<String> response = httpServiceInvoker.execute(httpServiceInvoker.getProperties().getProperty("api.url")+"/application/create", HttpMethod.POST, getObjectMapper().writeValueAsString(data));
        if(response.getStatusCode().value() == HttpStatus.CREATED.value()) {
            JsonNode jsonNode = getObjectMapper().readTree(response.getBody());
            String applicationId = jsonNode.get("id").asText();
            execution.setVariable("applicationId", applicationId);
        }
    }

    private ObjectMapper getObjectMapper(){
        return new ObjectMapper();
    }

}
