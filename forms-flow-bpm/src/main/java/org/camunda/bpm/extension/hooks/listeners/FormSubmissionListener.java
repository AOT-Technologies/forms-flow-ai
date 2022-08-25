package org.camunda.bpm.extension.hooks.listeners;

import org.apache.commons.lang3.StringUtils;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.DelegateTask;
import org.camunda.bpm.engine.delegate.ExecutionListener;
import org.camunda.bpm.engine.delegate.TaskListener;
import org.camunda.bpm.extension.hooks.services.FormSubmissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;


import java.io.IOException;
import java.util.logging.Logger;

import static org.camunda.bpm.extension.commons.utils.VariableConstants.FORM_URL;
import static org.camunda.bpm.extension.commons.utils.VariableConstants.WEB_FORM_URL;
/**
 * Form Submission Listener.
 * This class creates a new submission from the current submission.
 */
@Component
public class FormSubmissionListener extends BaseListener implements ExecutionListener, TaskListener {


    @Autowired
    private FormSubmissionService formSubmissionService;

    @Override
    public void notify(DelegateExecution execution) {
        try {
            createRevision(execution);
        } catch (IOException e) {
            handleException(execution, ExceptionSource.EXECUTION, e);
        }
    }

    @Override
    public void notify(DelegateTask delegateTask) {
        try {
            createRevision(delegateTask.getExecution());
        } catch (IOException e) {
            handleException(delegateTask.getExecution(), ExceptionSource.TASK, e);
        }

    }

    private void createRevision(DelegateExecution execution) throws IOException {
        String submissionId = formSubmissionService.createRevision(String.valueOf(execution.getVariables().get(FORM_URL)));
        execution.setVariable(FORM_URL, getUrl(execution) + "/" + submissionId);
        execution.setVariable(WEB_FORM_URL, getWebUrl(execution) + "/" + submissionId);
    }

    private String getUrl(DelegateExecution execution){
        return StringUtils.substringBeforeLast(String.valueOf(execution.getVariables().get(FORM_URL)),"/");
    }

    private String getWebUrl(DelegateExecution execution){
        return StringUtils.substringBeforeLast(String.valueOf(execution.getVariables().get(WEB_FORM_URL)),"/");
    }
}
