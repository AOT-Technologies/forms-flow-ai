package org.camunda.bpm.extension.hooks.listeners;

import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.DelegateTask;
import org.camunda.bpm.engine.delegate.ExecutionListener;
import org.camunda.bpm.engine.delegate.TaskListener;
import org.camunda.bpm.extension.commons.connector.HTTPServiceInvoker;
import org.camunda.bpm.extension.hooks.exceptions.ApplicationServiceException;
import org.camunda.bpm.extension.hooks.listeners.data.Application;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import java.io.IOException;
import java.util.*;

import static org.camunda.bpm.extension.commons.utils.VariableConstants.*;

/**
 * Application Audit Listener.
 * This class creates / updates an audit entry in formsflow.ai system.
 */
@Component
public class ApplicationAuditListener extends BaseListener implements ExecutionListener, TaskListener {

    @Autowired
    private HTTPServiceInvoker httpServiceInvoker;

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
    protected Application prepareApplicationAudit(DelegateExecution execution) {
        String applicationStatus = String.valueOf(execution.getVariable(APPLICATION_STATUS));
        String formUrl = String.valueOf(execution.getVariable(FORM_URL));
        String submitterName = String.valueOf(execution.getVariable(SUBMITTER_NAME));
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String submittedBy = null;
        if (authentication != null) {
            if (authentication instanceof JwtAuthenticationToken authToken) {
                submittedBy = authToken.getToken().getClaimAsString("preferred_username");
                if(submittedBy.startsWith("service-account")){
                    submittedBy = ANONYMOUS_USER;
                }
            }
        }
        else {
            submittedBy = SERVICE_ACCOUNT;
        }
        return new Application(applicationStatus, formUrl, submittedBy);
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
