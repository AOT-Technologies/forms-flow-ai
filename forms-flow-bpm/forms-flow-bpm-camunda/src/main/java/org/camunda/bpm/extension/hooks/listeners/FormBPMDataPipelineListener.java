package org.camunda.bpm.extension.hooks.listeners;


import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.DelegateTask;
import org.camunda.bpm.engine.delegate.ExecutionListener;
import org.camunda.bpm.engine.delegate.TaskListener;
import org.camunda.bpm.extension.hooks.services.FormSubmissionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;

import static org.camunda.bpm.extension.commons.utils.VariableConstants.FORM_URL;
/**
 * FormBPMDataPipelineListener.
 * This class copies all the form document data into CAM variables.
 */

@Qualifier("FormBPMDataPipelineListener")
@Component
public class FormBPMDataPipelineListener  extends BaseListener implements TaskListener, ExecutionListener {

    private static final Logger LOGGER = LoggerFactory.getLogger(FormBPMDataPipelineListener.class);

    @Autowired
    private FormSubmissionService formSubmissionService;

    @Override
    public void notify(DelegateExecution execution) {
        try {
            syncFormVariables(execution);
        } catch (IOException e) {
            handleException(execution, ExceptionSource.EXECUTION, e);
        }
    }

    @Override
    public void notify(DelegateTask delegateTask) {
        try {
            syncFormVariables(delegateTask.getExecution());
        } catch (IOException e) {
            handleException(delegateTask.getExecution(), ExceptionSource.TASK, e);
        }
    }

    private void syncFormVariables(DelegateExecution execution) throws IOException {
        Map<String,Object> dataMap = formSubmissionService.retrieveFormValues(String.valueOf(execution.getVariables().get(FORM_URL)));
        for (Map.Entry<String, Object> entry: dataMap.entrySet()) {
            execution.setVariable(entry.getKey(), entry.getValue());
        }
    }
}
