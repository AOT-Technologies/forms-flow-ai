package org.camunda.bpm.extension.hooks.listeners;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.lang3.StringUtils;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.DelegateTask;
import org.camunda.bpm.engine.delegate.ExecutionListener;
import org.camunda.bpm.engine.delegate.TaskListener;
import org.camunda.bpm.extension.commons.connector.HTTPServiceInvoker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * This class from the current submission creates a new submission.
 *
 * @author sumathi.thirumani@aot-technologies.com
 */
@Component
public class FormSubmissionListener implements ExecutionListener, TaskListener {

    private final Logger LOGGER = Logger.getLogger(FormSubmissionListener.class.getName());

    @Autowired
    private HTTPServiceInvoker httpServiceInvoker;

    @Override
    public void notify(DelegateExecution execution) {
        createRevision(execution);
    }

    @Override
    public void notify(DelegateTask delegateTask) {
        createRevision(delegateTask.getExecution());
    }

    private String readSubmission(String formUrl) {
        ResponseEntity<String> response =  httpServiceInvoker.execute(formUrl, HttpMethod.GET, null);
        if(response.getStatusCode().value() == HttpStatus.OK.value()) {
            return response.getBody();
        }
        return null;
    }

    private void createRevision(DelegateExecution execution) {
        String submission =  readSubmission(String.valueOf(execution.getVariables().get("form_url")));
        if(StringUtils.isBlank(submission)) {
            LOGGER.log(Level.SEVERE,"Unable to read submission for "+execution.getVariables().get("form_url"));
            return;
        }
        ObjectMapper objectMapper = new ObjectMapper();
        try {
            JsonNode submissionObj = objectMapper.readTree(submission);
            ResponseEntity<String> response =  httpServiceInvoker.execute(getUrl(execution), HttpMethod.POST, submissionObj);
            if(response.getStatusCode().value() == HttpStatus.CREATED.value()) {
                JsonNode jsonNode = objectMapper.readTree(response.getBody());
                String submissionId = jsonNode.get("_id").asText();
                execution.setVariable("form_url", getUrl(execution) + "/" + submissionId);
            }
        } catch (JsonProcessingException e) {
            LOGGER.log(Level.SEVERE,"Exception occurred in creating submission", e);
        }
    }

    private String getUrl(DelegateExecution execution){
        return StringUtils.substringBeforeLast(String.valueOf(execution.getVariables().get("form_url")),"/");
    }

}
