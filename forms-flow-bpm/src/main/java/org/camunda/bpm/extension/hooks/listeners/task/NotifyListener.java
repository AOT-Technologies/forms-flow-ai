package org.camunda.bpm.extension.hooks.listeners.task;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nimbusds.oauth2.sdk.util.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.camunda.bpm.engine.delegate.DelegateTask;
import org.camunda.bpm.engine.delegate.Expression;
import org.camunda.bpm.engine.delegate.TaskListener;
import org.camunda.bpm.extension.hooks.services.IMessageEvent;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Assignment Task Listener to start a message event when a task is created
 * Extended to emails to additional groups of interest.
 *
 * @author yichun.zhao@aot-technologies.com, sumathi.thirumani@aot-technologies.com
 */
@Component
public class NotifyListener implements TaskListener, IMessageEvent {

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
        if(!"Y".equals(getGroupsOnly(delegateTask))) {
            toEmails.addAll(getEmailsOfUnassignedTask(delegateTask));

        }

            if (CollectionUtils.isNotEmpty(getEmailGroups(delegateTask))) {
                for (String entry : getEmailGroups(delegateTask)) {
                    toEmails.addAll(getEmailsForGroup(delegateTask.getExecution(), entry));
                }
            }
            sendEmailNotification(delegateTask, toEmails, delegateTask.getId());
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
            emailAttributes.put("category", getCategory(delegateTask));
            emailAttributes.put("name",getDefaultAddresseName());
            emailAttributes.put("taskid",taskId);
            if(StringUtils.isNotBlank(toAddress) && StringUtils.indexOf(toAddress,"@") > 0) {
                sendMessage(delegateTask.getExecution(), emailAttributes,getMessageId(delegateTask));
            }
        }
    }

    /**
     *
     * @param delegateTask
     * @return
     */
    private String getCategory(DelegateTask delegateTask){
        return String.valueOf(this.category.getValue(delegateTask));
    }

    /**
     *
     * @param delegateTask
     * @return
     */
    private String getMessageId(DelegateTask delegateTask){
        return String.valueOf(this.messageId.getValue(delegateTask));
    }

    private List<String> getEmailGroups(DelegateTask delegateTask){
        List<String> emailGroups = new ArrayList<>();
        try {
            if(this.emailGroups != null &&
                    StringUtils.isNotBlank(String.valueOf(this.emailGroups.getValue(delegateTask)))) {
                emailGroups = this.emailGroups != null && this.emailGroups.getValue(delegateTask) != null ?
                        getObjectMapper().readValue(String.valueOf(this.emailGroups.getValue(delegateTask)), List.class) : null;
            }
        } catch (JsonProcessingException e) {
            LOGGER.log(Level.SEVERE, "Exception occured in reading additionalEmailGroups" , e);
        }
        return  emailGroups;
    }

    private String getGroupsOnly(DelegateTask delegateTask){

        if(this.groupsOnly != null &&
                StringUtils.isNotBlank(String.valueOf(this.groupsOnly.getValue(delegateTask)))) {
            return this.groupsOnly != null && this.groupsOnly.getValue(delegateTask) != null ?
                    String.valueOf(this.groupsOnly.getValue(delegateTask)) : null;
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
