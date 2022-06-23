package org.camunda.bpm.extension.hooks.listeners.execution;

import com.nimbusds.oauth2.sdk.util.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.ExecutionListener;
import org.camunda.bpm.engine.variable.Variables;
import org.camunda.bpm.extension.hooks.services.IUser;

import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

import static org.camunda.bpm.extension.commons.utils.VariableConstants.*;

/**
 * Email Attributes Listener.
 * This class prepares and populates the variables of email within camunda context.
 */
public class EmailAttributesListener implements ExecutionListener, IUser {

    private final Logger LOGGER = Logger.getLogger(EmailAttributesListener.class.getName());

    @Override
    public void notify(DelegateExecution execution) {
       LOGGER.info("EmailAttributesListener input : "+execution.getVariables());
       Map<String,Object> dmnMap = getDMNTemplate(execution);
       String emailto = getAddressValue(execution,dmnMap,"to");
       String groupName = String.valueOf(execution.getVariable(GROUP_NAME));
       List<String> emailgroup = getEmailsForGroup(execution,groupName);
       if(CollectionUtils.isNotEmpty(emailgroup)) {
           if(emailto.length() > 0) {
               emailto = emailto.concat(",").concat(String.join(",", emailgroup));
           } else {
               emailto = String.join(",", emailgroup);
           }
       }
        tranformEmailContent(execution,dmnMap);
        execution.setVariable(EMAIL_CC, getAddressValue(execution,dmnMap,"cc"));
        if(StringUtils.isNotBlank(emailto)) {
            execution.setVariable(EMAIL_TO, emailto);
        }
    }

    /**
     * This method transforms the variables of data in both email body and subject.
     * @param execution
     * @param dmnMap
     */
    private void tranformEmailContent(DelegateExecution execution,Map<String,Object> dmnMap) {
        String emailBody = getTextValue(dmnMap,"body");
        String emailSubject = getTextValue(dmnMap,"subject");
        for(Map.Entry<String,Object> entry : execution.getVariables().entrySet()) {
            if(!TEMPLATE.equals(entry.getKey())) {
                emailBody = StringUtils.replace(emailBody,"@"+entry.getKey(), entry.getValue()+StringUtils.EMPTY);
                emailSubject = StringUtils.replace(emailSubject,"@"+entry.getKey(), entry.getValue()+StringUtils.EMPTY);
            }
        }
        execution.setVariable(EMAIL_BODY, Variables.stringValue(emailBody,true));
        execution.setVariable(EMAIL_SUBJECT, emailSubject);
    }

    /**
     * This method makes the assumption that email object will be placed on key template.
     * @param execution
     * @return
     */
    private Map<String, Object> getDMNTemplate(DelegateExecution execution) {
        return (Map<String, Object>) execution.getVariables().get(TEMPLATE);
    }

    /**
     *  Returns the text value of name from DMN
     * @param dmnMap
     * @param name
     * @return
     */
    private String getTextValue(Map<String, Object> dmnMap, String name) {
        if(dmnMap.containsKey(name)) {
            return  String.valueOf(dmnMap.get(name));
        }
        return null;
    }

    /**
     * Utility method to parse and send the email address. DMN takes precedence over execution.
     *
     * @param execution
     * @param dmnMap
     * @param name
     * @return
     */
    private String getAddressValue(DelegateExecution execution,Map<String, Object> dmnMap, String name) {
        String dmnData = dmnMap.containsKey(name) && dmnMap.get(name) != null ? String.valueOf(dmnMap.get(name)) : null;
        if(StringUtils.isNotBlank(dmnData) && StringUtils.indexOf(dmnData,"@") > 0) {
            return dmnData;
        }
        String execData = execution.getVariables().containsKey(name) && execution.getVariable(name) !=null ? String.valueOf(execution.getVariable("to")) : null;
        if(StringUtils.isNotBlank(execData) && StringUtils.indexOf(execData,"@") > 0) {
            return execData;
        }
        return StringUtils.EMPTY;
    }
}
