package org.camunda.bpm.extension.hooks.listeners;

import lombok.Data;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.DelegateTask;
import org.camunda.bpm.engine.delegate.ExecutionListener;
import org.camunda.bpm.engine.delegate.TaskListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;

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

    /**
     * This method invokes the HTTP service invoker for application.
     *
     * @param execution
     */
    private void invokeApplicationService(DelegateExecution execution) {
        getHTTPServiceInvoker().execute(getApplicationUrl(execution), HttpMethod.PUT,  prepareApplication(execution));
    }

    /**
     * Prepares and returns the Application object.
     * @param execution
     * @return
     */
    private Application prepareApplication(DelegateExecution execution) {
        application.setApplicationStatus(String.valueOf(execution.getVariable("applicationStatus")));
        application.setFormUrl(String.valueOf(execution.getVariable("formUrl")));
        return application;
    }

    /**
     * Returns the endpoint of application API.
     * @param execution
     * @return
     */
    private String getApplicationUrl(DelegateExecution execution){
        return getHTTPServiceInvoker().getProperties().getProperty("api.url")+"/application/"+execution.getVariable("applicationId");
    }



}
@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
@Data
class Application{
    private String applicationStatus;
    private String formUrl;
}