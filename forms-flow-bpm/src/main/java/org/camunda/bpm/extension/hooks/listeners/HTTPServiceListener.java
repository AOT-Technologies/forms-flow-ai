package org.camunda.bpm.extension.hooks.listeners;

import org.apache.commons.lang3.StringUtils;
import org.camunda.bpm.engine.delegate.*;
import org.camunda.bpm.extension.commons.connector.HTTPServiceInvoker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.logging.Logger;

/**
 * This class intends to invoke the REST services from task and execution listeners.
 *
 * @author  sumathi.thirumani@aot-technologies.com
 */
@Component
public class HTTPServiceListener implements TaskListener, ExecutionListener {

    private final Logger LOGGER = Logger.getLogger(HTTPServiceListener.class.getName());

    private Expression url;
    private Expression method;
    private Expression payload;

    @Autowired
    private HTTPServiceInvoker httpServiceInvoker;

    @Override
    public void notify(DelegateTask delegateTask) {
        LOGGER.info("Invoking REST API for instance"+delegateTask.getProcessInstanceId());
        httpServiceInvoker.execute(getURL(delegateTask.getExecution()), getMethod(delegateTask.getExecution()), getPayload(delegateTask.getExecution()));
    }

    @Override
    public void notify(DelegateExecution delegateExecution) throws Exception {
        LOGGER.info("Invoking REST API for instance"+delegateExecution.getProcessInstanceId());
        httpServiceInvoker.execute(getURL(delegateExecution), getMethod(delegateExecution), getPayload(delegateExecution));
    }

    private String getURL(DelegateExecution delegateExecution) {
        return applyProcessVariables(delegateExecution,String.valueOf(this.url.getValue(delegateExecution)));
    }

    private HttpMethod getMethod(DelegateExecution delegateExecution) {
        return HttpMethod.resolve(String.valueOf(this.method.getValue(delegateExecution)));

    }

    private String getPayload(DelegateExecution delegateExecution) {
        return applyProcessVariables(delegateExecution,String.valueOf(this.payload.getValue(delegateExecution)));
    }

    private String applyProcessVariables(DelegateExecution execution, String data){
        for(Map.Entry<String,Object> entry : execution.getVariables().entrySet()) {
            if(StringUtils.contains(data, "@".concat(entry.getKey()))) {
                data = StringUtils.replace(data,"@".concat(entry.getKey()), String.valueOf(entry.getValue()));
            }
        }
        return data;
    }

}
