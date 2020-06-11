package org.camunda.bpm.extension.hooks.services;

import org.apache.commons.lang3.StringUtils;
import org.camunda.bpm.engine.IdentityService;
import org.camunda.bpm.engine.RuntimeService;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.DelegateTask;
import org.camunda.bpm.engine.identity.User;
import org.joda.time.DateTime;

import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;

/**
 * Interface containing method to send message to start a message event
 * Feature: Changes to pass the message ID and inject variables in light mode.
 *
 * @author yichun.zhao@aot-technologies.com, sumathi.thirumani@aot-technologies.com
 */
public interface IMessageEvent extends IUser{

    Logger log = Logger.getLogger(IMessageEvent.class.getName());


    default void sendMessage(DelegateExecution execution, Map<String,Object> messageVariables,String messageId){
        RuntimeService runtimeService = execution.getProcessEngineServices().getRuntimeService();
        Map<String,Object> eMessageVariables = new HashMap<>();
        eMessageVariables.putAll(messageVariables);
        eMessageVariables.putAll(injectFormDataInLightMode(execution));
        runtimeService.startProcessInstanceByMessage(messageId,eMessageVariables);
        log.info("\n\nMessage sent! " + eMessageVariables+ "\n\n");
    }


    default Map<String,Object> injectFormDataInLightMode(DelegateExecution execution) {
        Map<String,Object> formMap = new HashMap<>();
        for(Map.Entry<String,Object> entry : execution.getVariables().entrySet()) {
                if(!StringUtils.endsWithIgnoreCase(entry.getKey(),"_file")) {
                    formMap.put(entry.getKey(),entry.getValue());
                }
        }
        return formMap;
    }




}
