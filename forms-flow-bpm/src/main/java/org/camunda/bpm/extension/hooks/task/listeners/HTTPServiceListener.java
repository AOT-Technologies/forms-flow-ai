package org.camunda.bpm.extension.hooks.task.listeners;

import org.apache.commons.lang3.StringUtils;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.DelegateTask;
import org.camunda.bpm.engine.delegate.Expression;
import org.camunda.bpm.engine.delegate.TaskListener;
import org.camunda.bpm.extension.hooks.services.connector.HTTPServiceInvoker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.logging.Logger;

/**
 * @author  sumathi.thirumani@aot-technologies.com
 */
@Component
public class HTTPServiceListener implements TaskListener {

    private final Logger LOGGER = Logger.getLogger(HTTPServiceListener.class.getName());

    private Expression url;
    private Expression method;
    private Expression payload;

    @Autowired
    private HTTPServiceInvoker httpServiceInvoker;

    @Override
    public void notify(DelegateTask delegateTask) {
        LOGGER.info("Invoking REST API for instance"+delegateTask.getProcessInstanceId());
        LOGGER.info(getURL(delegateTask));
        LOGGER.info(getMethod(delegateTask).name());
        LOGGER.info(getPayload(delegateTask));
        httpServiceInvoker.execute(getURL(delegateTask), getMethod(delegateTask), getPayload(delegateTask),false);
    }

    private String getURL(DelegateTask delegateTask) {
        return applyProcessVariables(delegateTask.getExecution(),String.valueOf(this.url.getValue(delegateTask)));
    }

    private HttpMethod getMethod(DelegateTask delegateTask) {
        return HttpMethod.resolve(String.valueOf(this.method.getValue(delegateTask)));

    }

    private String getPayload(DelegateTask delegateTask) {
        return applyProcessVariables(delegateTask.getExecution(),String.valueOf(this.payload.getValue(delegateTask)));
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
