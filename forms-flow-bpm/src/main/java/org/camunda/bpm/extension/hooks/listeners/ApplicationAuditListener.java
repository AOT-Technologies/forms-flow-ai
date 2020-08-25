package org.camunda.bpm.extension.hooks.listeners;

import lombok.Data;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.DelegateTask;
import org.camunda.bpm.engine.delegate.ExecutionListener;
import org.camunda.bpm.engine.delegate.TaskListener;
import org.camunda.bpm.extension.commons.connector.HTTPServiceInvoker;
import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.Properties;
import java.util.logging.Logger;

/**
 * This class creates an entry of audit
 *
 * @author sumathi.thirumani@aot-technolgies.com
 */
@Component
public class ApplicationAuditListener {

    private final Logger LOGGER = Logger.getLogger(ApplicationAuditListener.class.getName());

    @Autowired
    private HTTPServiceInvoker httpServiceInvoker;

    @Autowired
    private ApplicationAudit applicationAudit;

    protected void invokeApplicationAuditService(DelegateExecution execution) {
        ApplicationAudit audit = prepareApplicationAudit(execution);
        getHTTPServiceInvoker().execute(getUrl(execution), HttpMethod.POST, audit);
    }

    private ApplicationAudit prepareApplicationAudit(DelegateExecution execution) {
            applicationAudit.setApplicationStatus(String.valueOf(execution.getVariable("application_status")));
            applicationAudit.setFormUrl(String.valueOf(execution.getVariable("form_url")));
            return applicationAudit;
    }

    public HTTPServiceInvoker getHTTPServiceInvoker() {
        return httpServiceInvoker;
    }

    private String getUrl(DelegateExecution execution){
        return getHTTPServiceInvoker().getProperties().getProperty("api.url")+"/application/"+execution.getVariable("application_id")+"/history";
    }


}
@Component
@Scope("prototype")
@Data
class ApplicationAudit{
    private String applicationStatus;
    private String formUrl;
}