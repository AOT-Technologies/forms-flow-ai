package org.camunda.bpm.extension.hooks.listeners.task;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nimbusds.oauth2.sdk.util.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.camunda.bpm.engine.ProcessEngineException;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.DelegateTask;
import org.camunda.bpm.engine.delegate.Expression;
import org.camunda.bpm.engine.delegate.TaskListener;
import org.camunda.bpm.extension.hooks.listeners.BaseListener;
import org.camunda.bpm.extension.hooks.services.IMessageEvent;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

/**
 * Assignment Task Listener to start a message event when a task is created
 * Extended to emails to additional groups of interest.
 *
 * @author yichun.zhao@aot-technologies.com, sumathi.thirumani@aot-technologies.com
 */
@Component
public class NotifyListener extends BaseListener implements TaskListener, IMessageEvent {

    private static final Logger LOGGER = Logger.getLogger(NotifyListener.class.getName());

    private Expression messageId;
    private Expression category;

    private Expression emailGroups;
    private Expression groupsOnly;

    /**
     * This provides the necessary information to send message.
     *
     * @param delegateTask: The task which sends the message
     */
    public void notify(DelegateTask delegateTask) {
        List<String> toEmails =  new ArrayList<>();
        if(!"Y".equals(getGroupsOnly(delegateTask.getExecution()))) {
            toEmails.addAll(getEmailsOfUnassignedTask(delegateTask));
        }
        List<String> emailGroups = null;
        try {
            emailGroups = getEmailGroups(delegateTask.getExecution());
        } catch (IOException e) {
           handleException(delegateTask.getExecution(), ExceptionSource.TASK, e);
        }
        if (CollectionUtils.isNotEmpty(emailGroups)) {
            for (String entry : emailGroups) {
                toEmails.addAll(getEmailsForGroup(delegateTask.getExecution(), entry));
            }
        }
        sendEmailNotification(delegateTask, toEmails ,delegateTask.getId());



    }

    /**
     *
     * @param delegateTask
     * @param toEmails
     * @param taskId
     */
    private void sendEmailNotification(DelegateTask delegateTask,List<String> toEmails,String taskId) {
        String toAddress = CollectionUtils.isNotEmpty(toEmails) ? StringUtils.join(toEmails,",") : null;
        if(StringUtils.isNotEmpty(toAddress)) {
            Map<String, Object> emailAttributes = new HashMap<>();
            emailAttributes.put("email_to", toAddress);
            emailAttributes.put("category", getCategory(delegateTask.getExecution()));
            emailAttributes.put("name",getDefaultAddresseName());
            emailAttributes.put("taskid",taskId);
            if(StringUtils.isNotBlank(toAddress) && StringUtils.indexOf(toAddress,"@") > 0) {
                sendMessage(delegateTask.getExecution(), emailAttributes,getMessageId(delegateTask.getExecution()));
            }
        }
    }
    private String getCategory(DelegateExecution delegateExecution){
        return String.valueOf(this.category.getValue(delegateExecution));
    }

    /**
     *
     * @param delegateExecution
     * @return
     */
    private String getMessageId(DelegateExecution delegateExecution){
        return String.valueOf(this.messageId.getValue(delegateExecution));
    }

    private List<String> getEmailGroups(DelegateExecution delegateExecution) throws JsonProcessingException {
        List<String> emailGroups = new ArrayList<>();
        if(this.emailGroups != null &&
                StringUtils.isNotBlank(String.valueOf(this.emailGroups.getValue(delegateExecution)))) {
            emailGroups = this.emailGroups != null && this.emailGroups.getValue(delegateExecution) != null ?
                    getObjectMapper().readValue(String.valueOf(this.emailGroups.getValue(delegateExecution)), List.class) : null;
        }
        return  emailGroups;
    }

    private String getGroupsOnly(DelegateExecution delegateExecution){

        if(this.groupsOnly != null &&
                StringUtils.isNotBlank(String.valueOf(this.groupsOnly.getValue(delegateExecution)))) {
            return this.groupsOnly != null && this.groupsOnly.getValue(delegateExecution) != null ?
                    String.valueOf(this.groupsOnly.getValue(delegateExecution)) : null;
        }
        return  "N";
    }

    /**
     * Returns Object Mapper Instance
     * @return
     */
    private ObjectMapper getObjectMapper(){
        return new ObjectMapper();
    }

}
