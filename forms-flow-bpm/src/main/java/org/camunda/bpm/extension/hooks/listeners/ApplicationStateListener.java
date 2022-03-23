package org.camunda.bpm.extension.hooks.listeners;

import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.DelegateTask;
import org.camunda.bpm.engine.delegate.ExecutionListener;
import org.camunda.bpm.engine.delegate.TaskListener;
import org.camunda.bpm.extension.commons.connector.HTTPServiceInvoker;
import org.camunda.bpm.extension.hooks.exceptions.ApplicationServiceException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.*;

/**
 * This class updates the application state and also capture audit.
 *
 * @author sumathi.thirumani@aot-technologies.com
 * @author Shibin Thomas
 */
@Component
public class ApplicationStateListener extends BaseListener implements ExecutionListener, TaskListener {


    @Autowired
    private HTTPServiceInvoker httpServiceInvoker;

    @Autowired
    private ApplicationAuditListener applicationAuditListener;

    @Override
    public void notify(DelegateExecution execution) {
        try {
            invokeApplicationService(execution);
            applicationAuditListener.invokeApplicationAuditService(execution);
        } catch (IOException e) {
            handleException(execution, ExceptionSource.EXECUTION, e);
        }
    }

    @Override
    public void notify(DelegateTask delegateTask) {
        try {
            invokeApplicationService(delegateTask.getExecution());
            applicationAuditListener.invokeApplicationAuditService(delegateTask.getExecution());
        } catch (IOException e) {
            handleException(delegateTask.getExecution(), ExceptionSource.TASK, e);
        }
    }

    /**
     * This method invokes the HTTP service invoker for application.
     *
     * @param execution
     */
    private void invokeApplicationService(DelegateExecution execution) throws IOException {
        ResponseEntity<String> response = httpServiceInvoker.execute(getApplicationUrl(execution), HttpMethod.PUT,  applicationAuditListener.prepareApplicationAudit(execution));
        if(response.getStatusCodeValue() != HttpStatus.OK.value()) {
            throw new ApplicationServiceException("Unable to update application "+ ". Message Body: " +
                    response.getBody());
        }
    }


    /**
     * Returns the endpoint of application API.
     * @param execution
     * @return
     */
    private String getApplicationUrl(DelegateExecution execution){
        return httpServiceInvoker.getProperties().getProperty("api.url")+"/application/"+execution.getVariable("applicationId");
    }
}
