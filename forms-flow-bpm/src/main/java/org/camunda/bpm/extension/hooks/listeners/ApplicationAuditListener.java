package org.camunda.bpm.extension.hooks.listeners;

import lombok.Data;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.DelegateTask;
import org.camunda.bpm.engine.delegate.ExecutionListener;
import org.camunda.bpm.engine.delegate.TaskListener;
import org.camunda.bpm.extension.commons.connector.HTTPServiceInvoker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;


/**
 * This class creates an audit entry in formsflow.ai system.
 *
 * @author sumathi.thirumani@aot-technolgies.com
 */
@Component
public class ApplicationAuditListener implements ExecutionListener, TaskListener {

    @Autowired
    private HTTPServiceInvoker httpServiceInvoker;

    @Autowired
    private ApplicationAudit applicationAudit;

    @Override
    public void notify(DelegateExecution execution) throws Exception {
        invokeApplicationAuditService(execution);
    }

    @Override
    public void notify(DelegateTask delegateTask) {
        invokeApplicationAuditService(delegateTask.getExecution());
    }

    /**
     * This method invokes the HTTP service invoker for audit.
     *
     * @param execution
     */
    protected void invokeApplicationAuditService(DelegateExecution execution) {
        getHTTPServiceInvoker().execute(getApplicationAuditUrl(execution), HttpMethod.POST, prepareApplicationAudit(execution));
    }

    /**
     * Prepares and returns the ApplicationAudit object.
     *
     * @param execution
     * @return
     */
    private ApplicationAudit prepareApplicationAudit(DelegateExecution execution) {
            applicationAudit.setApplicationStatus(String.valueOf(execution.getVariable("applicationStatus")));
            applicationAudit.setFormUrl(String.valueOf(execution.getVariable("formUrl")));
            return applicationAudit;
    }

    /**
     * Returns the HTTPServiceInvoker instance.
     *
     * @return
     */
    public HTTPServiceInvoker getHTTPServiceInvoker() {
        return httpServiceInvoker;
    }

    /**
     * Returns the endpoint of application audit API.
     * @param execution
     * @return
     */
    private String getApplicationAuditUrl(DelegateExecution execution){
        return getHTTPServiceInvoker().getProperties().getProperty("api.url")+"/application/"+execution.getVariable("applicationId")+"/history";
    }

}
@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
@Data
class ApplicationAudit{
    private String applicationStatus;
    private String formUrl;
}