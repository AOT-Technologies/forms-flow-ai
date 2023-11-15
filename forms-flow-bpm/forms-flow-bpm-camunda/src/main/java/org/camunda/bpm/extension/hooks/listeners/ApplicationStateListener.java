package org.camunda.bpm.extension.hooks.listeners;

import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.DelegateTask;
import org.camunda.bpm.engine.delegate.ExecutionListener;
import org.camunda.bpm.engine.delegate.TaskListener;
import org.camunda.bpm.extension.commons.connector.HTTPServiceInvoker;
import org.camunda.bpm.extension.commons.utils.RestAPIBuilderConfigProperties;
import org.camunda.bpm.extension.commons.utils.RestAPIBuilderUtil;
import org.camunda.bpm.extension.hooks.exceptions.ApplicationServiceException;
import org.camunda.bpm.extension.hooks.listeners.data.Application;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.*;

import static org.camunda.bpm.extension.commons.utils.VariableConstants.*;

/**
 * Application State Listener.
 * This class updates the application state and also capture audit.
 */
@Component
public class ApplicationStateListener extends BaseListener implements ExecutionListener, TaskListener {

    private static final Logger LOGGER = LoggerFactory.getLogger(ApplicationStateListener.class);

    @Autowired
    private HTTPServiceInvoker httpServiceInvoker;

    @Autowired
    private RestAPIBuilderConfigProperties restAPIBuilderConfigProperties;

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
        ResponseEntity<String> response = httpServiceInvoker.execute(getApplicationUrl(execution), HttpMethod.PUT,  prepareApplication(execution));
        if(response.getStatusCodeValue() != HttpStatus.OK.value()) {
            throw new ApplicationServiceException("Unable to update application "+ ". Message Body: " +
                    response.getBody());
        }
    }

    /**
     * Prepares and returns the Application object.
     *
     * @param execution
     * @return
     */
    protected Application prepareApplication(DelegateExecution execution) {
        String applicationStatus = String.valueOf(execution.getVariable(APPLICATION_STATUS));
        String formUrl = String.valueOf(execution.getVariable(FORM_URL));
        Object resubmit = execution.getVariable(IS_RESUBMIT);
        boolean isResubmit = (resubmit != null && resubmit instanceof Boolean) ? (Boolean) resubmit : false;
        String eventName = (execution.getVariable(EVENT_NAME) != null) ? String.valueOf(execution.getVariable(EVENT_NAME)) : null;
        if (isResubmit && eventName == null) {
            eventName = DEFAULT_EVENT_NAME;
        }
        return new Application(applicationStatus, formUrl,
                               RestAPIBuilderUtil.fetchUserName((restAPIBuilderConfigProperties.getUserNameAttribute())),
                               isResubmit, eventName);
    }

    /**
     * Returns the endpoint of application API.
     * @param execution
     * @return
     */
    private String getApplicationUrl(DelegateExecution execution){
        return httpServiceInvoker.getProperties().getProperty("api.url")+"/application/"+execution.getVariable(APPLICATION_ID);
    }
}
