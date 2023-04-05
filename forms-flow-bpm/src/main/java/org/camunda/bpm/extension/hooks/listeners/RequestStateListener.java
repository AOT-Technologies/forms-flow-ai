package org.camunda.bpm.extension.hooks.listeners;

import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.DelegateTask;
import org.camunda.bpm.engine.delegate.ExecutionListener;
import org.camunda.bpm.engine.delegate.TaskListener;
import org.camunda.bpm.extension.commons.connector.HTTPServiceInvoker;
import org.camunda.bpm.extension.hooks.exceptions.ApplicationServiceException;
import org.camunda.bpm.extension.hooks.listeners.data.RequestStateData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

import java.io.IOException;

import static org.camunda.bpm.extension.commons.utils.VariableConstants.*;

@Component
public class RequestStateListener extends BaseListener implements ExecutionListener, TaskListener {


    @Autowired
    private HTTPServiceInvoker httpServiceInvoker;

    @Override
    public void notify(DelegateExecution execution) {
        try {
            invokeRequestService(execution);
        } catch (IOException e) {
            handleException(execution, ExceptionSource.EXECUTION, e);
        }
    }

    @Override
    public void notify(DelegateTask delegateTask) {
        try {
            invokeRequestService(delegateTask.getExecution());
        } catch (IOException e) {
            handleException(delegateTask.getExecution(), ExceptionSource.TASK, e);
        }
    }

    private void invokeRequestService(DelegateExecution execution) throws IOException {
        ResponseEntity<String> response = httpServiceInvoker.execute(getRequestAuditUrl(execution), HttpMethod.POST, prepareRequestDataUrl(execution));
        if (response.getStatusCodeValue() != HttpStatus.CREATED.value()) {
            throw new ApplicationServiceException("Unable to process request for application" + ". Message Body: " +
                    response.getBody());
        }
    }

    protected RequestStateData prepareRequestDataUrl(DelegateExecution execution) {
        String formUrl = String.valueOf(execution.getVariable(FORM_URL));
        String requestType = String.valueOf(execution.getVariable(REQUEST_TYPE));
        String requestStatus = String.valueOf(execution.getVariable(REQUEST_STATUS));
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String submittedBy = null;
        if (authentication != null) {
            if (authentication instanceof JwtAuthenticationToken authToken) {
                submittedBy = authToken.getToken().getClaimAsString("preferred_username");
                if (submittedBy.startsWith("service-account")) {
                    submittedBy = ANONYMOUS_USER;
                }
            }
        } else {
            submittedBy = SERVICE_ACCOUNT;
        }
        return new RequestStateData(formUrl, submittedBy, requestType, requestStatus, true);
    }

    /**
     * Returns the endpoint of application API.
     *
     * @param execution
     * @return
     */
    private String getRequestAuditUrl(DelegateExecution execution) {
        return httpServiceInvoker.getProperties().getProperty("api.url") + "/application/" + execution.getVariable(APPLICATION_ID) + "/history";
    }
}

