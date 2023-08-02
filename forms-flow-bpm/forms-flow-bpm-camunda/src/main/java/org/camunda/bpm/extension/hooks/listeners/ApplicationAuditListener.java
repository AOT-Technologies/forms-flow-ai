package org.camunda.bpm.extension.hooks.listeners;

import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.DelegateTask;
import org.camunda.bpm.engine.delegate.ExecutionListener;
import org.camunda.bpm.engine.delegate.TaskListener;
import org.camunda.bpm.extension.commons.connector.HTTPServiceInvoker;
import org.camunda.bpm.extension.commons.utils.RestAPIBuilderConfigProperties;
import org.camunda.bpm.extension.commons.utils.RestAPIBuilderUtil;
import org.camunda.bpm.extension.hooks.exceptions.ApplicationServiceException;
import org.camunda.bpm.extension.hooks.listeners.data.ApplicationAudit;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import java.io.IOException;

import static org.camunda.bpm.extension.commons.utils.VariableConstants.*;

/**
 * Application Audit Listener.
 * This class creates / updates an audit entry in formsflow.ai system.
 */
@Component
public class ApplicationAuditListener extends BaseListener implements ExecutionListener, TaskListener {

    @Autowired
    private HTTPServiceInvoker httpServiceInvoker;

    @Autowired
    private RestAPIBuilderConfigProperties restAPIBuilderConfigProperties;

    private Logger LOGGER = LoggerFactory.getLogger(ApplicationAuditListener.class);

    @Override
    public void notify(DelegateExecution execution) {
        try {
            invokeApplicationAuditService(execution);
        } catch (IOException e) {
            handleException(execution, ExceptionSource.EXECUTION, e);
        }
    }

    @Override
    public void notify(DelegateTask delegateTask) {
        try {
            invokeApplicationAuditService(delegateTask.getExecution());
        } catch (IOException e) {
            handleException(delegateTask.getExecution(), ExceptionSource.TASK, e);
        }
    }

    /**
     * This method invokes the HTTP service invoker for audit.
     *
     * @param execution
     */
    protected void invokeApplicationAuditService(DelegateExecution execution) throws IOException {
        ResponseEntity<String> response = httpServiceInvoker.execute(getApplicationAuditUrl(execution), HttpMethod.POST, prepareApplicationAudit(execution));
        if(response.getStatusCodeValue() != HttpStatus.CREATED.value()) {
            throw new ApplicationServiceException("Unable to capture audit for application "+ ". Message Body: " +
                    response.getBody());
        }
    }

    /**
     * Prepares and returns the ApplicationAudit object.
     *
     * @param execution
     * @return
     */
    protected ApplicationAudit prepareApplicationAudit(DelegateExecution execution) {
        String applicationStatus = String.valueOf(execution.getVariable(APPLICATION_STATUS));
        String formUrl = String.valueOf(execution.getVariable(FORM_URL));
        String color = (execution.getVariable(COLOR) != null) ? String.valueOf(execution.getVariable(COLOR)) : null;
        String percentageStr = String.valueOf(execution.getVariable(PERCENTAGE));
        Double percentage = null;
        try {
            percentage = (execution.getVariable(PERCENTAGE) != null) ? Double.valueOf((percentageStr)) : null;
        } catch (NumberFormatException e) {
            LOGGER.error("Invalid percentage format: " + percentageStr);
        }
        return new ApplicationAudit(applicationStatus, formUrl, RestAPIBuilderUtil.fetchUserName((restAPIBuilderConfigProperties.getUserNameAttribute())),
                color, percentage);
    }


    /**
     * Returns the endpoint of application audit API.
     * @param execution
     * @return
     */
    private String getApplicationAuditUrl(DelegateExecution execution){
        return httpServiceInvoker.getProperties().getProperty("api.url")+"/application/"+execution.getVariable(APPLICATION_ID)+"/history";
    }

}
