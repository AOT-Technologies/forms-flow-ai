package org.camunda.bpm.extension.hooks.listeners;

import lombok.Data;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.DelegateTask;
import org.camunda.bpm.engine.delegate.ExecutionListener;
import org.camunda.bpm.engine.delegate.TaskListener;
import org.camunda.bpm.extension.commons.connector.HTTPServiceInvoker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.Properties;
import java.util.logging.Logger;

/**
 * This class updates the application state and also capture audit.
 *
 * @author sumathi.thirumani@aot-technologies.com
 */
@Component
public class ApplicationStateListener extends ApplicationAuditListener implements ExecutionListener, TaskListener {

    @Autowired
    private Application application;

    @Override
    public void notify(DelegateExecution execution) {
        invokeApplicationService(execution);
        invokeApplicationAuditService(execution);
    }

    @Override
    public void notify(DelegateTask delegateTask) {
        invokeApplicationService(delegateTask.getExecution());
        invokeApplicationAuditService(delegateTask.getExecution());

    }

    private void invokeApplicationService(DelegateExecution execution) {
        Application application = prepareApplication(execution);
        getHTTPServiceInvoker().execute(getUrl(execution), HttpMethod.PUT, application);
    }

    private Application prepareApplication(DelegateExecution execution) {
        application.setApplicationStatus(String.valueOf(execution.getVariable("application_status")));
        application.setFormUrl(String.valueOf(execution.getVariable("form_url")));
        return application;
    }

    private String getUrl(DelegateExecution execution){
        return getHTTPServiceInvoker().getProperties().getProperty("api.url")+"/application/"+execution.getVariable("application_id");
    }



}
@Component
@Scope("prototype")
@Data
class Application{
    private String applicationStatus;
    private String formUrl;
}