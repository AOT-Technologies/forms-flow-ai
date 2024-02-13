package org.camunda.bpm.extension.hooks.listeners.task;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nimbusds.oauth2.sdk.util.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.DelegateTask;
import org.camunda.bpm.engine.delegate.Expression;
import org.camunda.bpm.engine.delegate.TaskListener;
import org.camunda.bpm.extension.hooks.listeners.BaseListener;
import org.camunda.bpm.extension.hooks.services.IMessageEvent;
import org.springframework.stereotype.Component;

import jakarta.annotation.Resource;

import java.io.IOException;
import java.util.*;
import java.util.logging.Logger;

import static org.camunda.bpm.extension.commons.utils.VariableConstants.EMAIL_TO;

/**
 * Notify Listener.
 * Assignment Task Listener to start a message event when a task is created
 * Extended to emails to additional groups of interest.
 */
@Component
public class NotifyListener extends BaseListener implements TaskListener, IMessageEvent {

    private static final Logger LOGGER = Logger.getLogger(NotifyListener.class.getName());

    private Expression messageId;
    private Expression category;
    private Expression emailGroups;
    private Expression groupsOnly;
    private Expression emailAddress;

    @Resource(name = "bpmObjectMapper")
    private ObjectMapper bpmObjectMapper;

    /**
     * This provides the necessary information to send message.
     *
     * @param delegateTask: The task which sends the message
     */
    public void notify(DelegateTask delegateTask) {
        Set<String> toEmails = new HashSet<>();
        if (!"Y".equals(getGroupsOnly(delegateTask.getExecution()))) {
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
        try {
            sendEmailNotification(delegateTask, toEmails, delegateTask.getId());
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * @param delegateTask
     * @param toEmails
     * @param taskId
     */
    private void sendEmailNotification(DelegateTask delegateTask, Set<String> toEmails, String taskId) throws JsonProcessingException {
        toEmails.addAll(getEmailAddress(delegateTask.getExecution()));
        String toAddress = CollectionUtils.isNotEmpty(toEmails) ? StringUtils.join(toEmails, ",") : null;
        if (StringUtils.isNotEmpty(toAddress)) {
            Map<String, Object> emailAttributes = new HashMap<>();
            emailAttributes.put(EMAIL_TO, toAddress);
            emailAttributes.put("category", getCategory(delegateTask.getExecution()));
            emailAttributes.put("name", getDefaultAddresseName());
            emailAttributes.put("taskid", taskId);
            if (StringUtils.isNotBlank(toAddress) && StringUtils.indexOf(toAddress, "@") > 0) {
                sendMessage(delegateTask.getExecution(), emailAttributes, getMessageId(delegateTask.getExecution()));
            }
        }
    }

    private String getCategory(DelegateExecution delegateExecution) {
        return String.valueOf(this.category.getValue(delegateExecution));
    }

    /**
     * @param delegateExecution
     * @return
     */
    private String getMessageId(DelegateExecution delegateExecution) {
        return String.valueOf(this.messageId.getValue(delegateExecution));
    }

    private List<String> getEmailGroups(DelegateExecution delegateExecution) throws JsonProcessingException {
      return getInjectedFields(delegateExecution, this.emailGroups);
    }

    private String getGroupsOnly(DelegateExecution delegateExecution) {
        if (this.groupsOnly != null &&
                StringUtils.isNotBlank(String.valueOf(this.groupsOnly.getValue(delegateExecution)))) {
            return this.groupsOnly != null && this.groupsOnly.getValue(delegateExecution) != null ?
                    String.valueOf(this.groupsOnly.getValue(delegateExecution)) : null;
        }
        return "N";
    }

    private List<String> getEmailAddress(DelegateExecution delegateExecution) throws JsonProcessingException {
        return getInjectedFields(delegateExecution, this.emailAddress);
    }

    private List<String> getInjectedFields(DelegateExecution delegateExecution, Expression injectedField) throws JsonProcessingException {
        List<String> fieldList = new ArrayList<>();
        if (injectedField != null &&
                StringUtils.isNotBlank(String.valueOf(injectedField.getValue(delegateExecution)))) {
            fieldList = injectedField != null && injectedField.getValue(delegateExecution) != null ?
                    bpmObjectMapper.readValue(String.valueOf(injectedField.getValue(delegateExecution)), List.class) : null;
        }
        return fieldList;
    }

}
