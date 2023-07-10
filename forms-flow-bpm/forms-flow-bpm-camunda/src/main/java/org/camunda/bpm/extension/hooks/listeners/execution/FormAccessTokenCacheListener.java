package org.camunda.bpm.extension.hooks.listeners.execution;

import org.apache.commons.lang.StringUtils;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.ExecutionListener;
import org.camunda.bpm.extension.hooks.listeners.BaseListener;
import org.camunda.bpm.extension.hooks.services.FormSubmissionService;
import org.springframework.beans.factory.annotation.Autowired;

import javax.inject.Named;
import java.util.logging.Logger;

/**
 * Form Access Token Cache Listener.
 * Deprecated - This listener will be removed in the upcoming releases
 * Not a supported way to generate formio access token
 * This class supports caching of formio access token in generic variable scope.
 */
@Deprecated
@Named("FormAccessTokenCacheListener")
public class FormAccessTokenCacheListener extends BaseListener implements ExecutionListener {

    private final Logger LOGGER = Logger.getLogger(FormAccessTokenCacheListener.class.getName());

    @Autowired
    private FormSubmissionService formSubmissionService;

    @Override
    public void notify(DelegateExecution delegateExecution) {
        String accessToken = formSubmissionService.getAccessToken();
        if(StringUtils.isNotEmpty(accessToken)) {
            delegateExecution.getProcessEngine().getRuntimeService().setVariable(delegateExecution.getId(),getTokenName(),accessToken);
        }
    }

    private String getTokenName() {
        return "formio_access_token";
    }
}
