package org.camunda.bpm.extension.hooks.listeners;

import org.apache.commons.lang3.StringUtils;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.DelegateTask;
import org.camunda.bpm.engine.delegate.ExecutionListener;
import org.camunda.bpm.engine.delegate.TaskListener;
import org.camunda.bpm.extension.hooks.services.FormSubmissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

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
    private FormSubmissionService formSubmissionService;

    @Override
    public void notify(DelegateExecution execution) {
        createRevision(execution);
    }

    @Override
    public void notify(DelegateTask delegateTask) {
        createRevision(delegateTask.getExecution());
    }

    private void createRevision(DelegateExecution execution) {
        String submissionId = formSubmissionService.createRevision(String.valueOf(execution.getVariables().get("formUrl")));
        execution.setVariable("formUrl", getUrl(execution) + "/" + submissionId);
    }

    private String getUrl(DelegateExecution execution){
        return StringUtils.substringBeforeLast(String.valueOf(execution.getVariables().get("formUrl")),"/");
    }

}
