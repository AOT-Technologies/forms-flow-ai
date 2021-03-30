package org.camunda.bpm.extension.hooks.listeners;


import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.DelegateTask;
import org.camunda.bpm.engine.delegate.ExecutionListener;
import org.camunda.bpm.engine.delegate.TaskListener;
import org.camunda.bpm.extension.hooks.services.FormSubmissionService;
import org.springframework.beans.factory.annotation.Autowired;

import javax.inject.Named;
import java.io.IOException;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * This class transforms all the form document data into CAM variables
 *
 * @author sumathi.thirumani@aot-technologies.com
 */
@Named("FormBPMDataPipelineListener")
public class FormBPMDataPipelineListener implements TaskListener, ExecutionListener {

    private final Logger LOGGER = Logger.getLogger(FormBPMDataPipelineListener.class.getName());

    @Autowired
    private FormSubmissionService formSubmissionService;

    @Override
    public void notify(DelegateExecution execution) throws Exception {
            syncFormVariables(execution);
    }

    @Override
    public void notify(DelegateTask delegateTask) {
        syncFormVariables(delegateTask.getExecution());
    }

    private void syncFormVariables(DelegateExecution execution) {
        try {
            Map<String,Object> dataMap = formSubmissionService.retrieveFormValues(String.valueOf(execution.getVariables().get("formUrl")));
            for (Map.Entry<String, Object> entry: dataMap.entrySet()) {
                execution.setVariable(entry.getKey(), entry.getValue());
            }
        } catch (IOException e) {
            LOGGER.log(Level.SEVERE,"Exception occured in transforming form content");
        }

    }
}
