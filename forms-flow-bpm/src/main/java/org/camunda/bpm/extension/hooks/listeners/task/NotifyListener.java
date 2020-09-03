package org.camunda.bpm.extension.hooks.listeners.task;

import com.nimbusds.oauth2.sdk.util.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.camunda.bpm.engine.delegate.DelegateTask;
import org.camunda.bpm.engine.delegate.Expression;
import org.camunda.bpm.engine.delegate.TaskListener;
import org.camunda.bpm.extension.hooks.services.IMessageEvent;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

/**
 * Assignment Task Listener to start a message event when a user is assigned
 *
 * @author yichun.zhao@aot-technologies.com
 */
@Component
public class NotifyListener implements TaskListener, IMessageEvent {

    private static final Logger log = Logger.getLogger(NotifyListener.class.getName());

    private Expression messageId;
    private Expression category;

    /**
     * This provides the necessary information to send message.
     *
     * @param delegateTask: The task which sends the message
     */
    public void notify(DelegateTask delegateTask) {
        log.info("\n\nNotify listener invoked! " + delegateTask.getId());
            sendEmailNotification(delegateTask, getEmailsOfUnassignedTask(delegateTask),delegateTask.getId());
    }

    private void sendEmailNotification(DelegateTask delegateTask,List<String> toEmails,String taskId) {
        String toAddress = CollectionUtils.isNotEmpty(toEmails) ? StringUtils.join(toEmails,",") : null;
        if(StringUtils.isNotEmpty(toAddress)) {
            Map<String, Object> emailAttributes = new HashMap<>();
            emailAttributes.put("email_to", toAddress);
            emailAttributes.put("category", getCategory(delegateTask));
            emailAttributes.put("name",getDefaultAddresseName());
            emailAttributes.put("taskid",taskId);
            log.info("Inside notify attributes:" + emailAttributes);
            if(StringUtils.isNotBlank(toAddress) && StringUtils.indexOf(toAddress,"@") > 0) {
                sendMessage(delegateTask.getExecution(), emailAttributes,getMessageId(delegateTask));
            }
        }
    }


    private String getCategory(DelegateTask delegateTask){
        return String.valueOf(this.category.getValue(delegateTask));
    }

    private String getMessageId(DelegateTask delegateTask){
        return String.valueOf(this.messageId.getValue(delegateTask));
    }

}
