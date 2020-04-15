package org.camunda.bpm.extension.hooks.task.listeners;

import org.apache.commons.lang3.StringUtils;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.ExecutionListener;
import org.camunda.bpm.engine.variable.Variables;

import java.util.Map;
import java.util.logging.Logger;

/**
 * This class prepares and populates the variables of email within camunda context.
 *
 * @author  sumathi.thirumani@aot-technologies.com
 */
public class EmailAttributesListener implements ExecutionListener {

    private final Logger LOGGER = Logger.getLogger(EmailAttributesListener.class.getName());

    @Override
    public void notify(DelegateExecution execution) throws Exception {
        LOGGER.info("EmailAttributesListener input : "+execution.getVariables());
        Map<String,Object> dmnMap = (Map<String, Object>) execution.getVariables().get("template");
        String email_body = String.valueOf(dmnMap.get("body"));
        String email_subject = String.valueOf(dmnMap.get("subject"));
        for(Map.Entry<String,Object> entry : execution.getVariables().entrySet()) {
            if(!"template".equals(entry.getKey())) {
                email_body = StringUtils.replace(email_body,"@"+entry.getKey(), entry.getValue()+StringUtils.EMPTY);
                email_subject = StringUtils.replace(email_subject,"@"+entry.getKey(), entry.getValue()+StringUtils.EMPTY);
            }
        }
        String email_to = dmnMap.containsKey("to") && dmnMap.get("to") != null &&
                StringUtils.isNotEmpty(String.valueOf(dmnMap.get("to"))) ? String.valueOf(dmnMap.get("to"))
                : String.valueOf(execution.getVariable("to"));
       String email_cc = dmnMap.containsKey("cc") && dmnMap.get("cc") != null &&
                StringUtils.isNotEmpty(String.valueOf(dmnMap.get("cc"))) ? String.valueOf(dmnMap.get("cc")) : String.valueOf(execution.getVariable("cc"));
       if(StringUtils.isNotBlank(email_to) && StringUtils.indexOf(email_to,"@") > 0) {
           execution.setVariable("email_to", email_to);
       }
        if(StringUtils.isNotBlank(email_cc)  && StringUtils.indexOf(email_cc,"@") > 0) {
            execution.setVariable("email_cc", email_cc);
        } else {
            execution.setVariable("email_cc",StringUtils.EMPTY);
        }
        execution.setVariable("email_body", Variables.stringValue(email_body,true));
        execution.setVariable("email_subject", email_subject);
        LOGGER.info("EmailAttributesListener output: "+execution.getVariables());
    }
}
