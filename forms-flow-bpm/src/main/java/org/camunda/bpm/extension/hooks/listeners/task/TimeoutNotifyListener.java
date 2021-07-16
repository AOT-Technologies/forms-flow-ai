package org.camunda.bpm.extension.hooks.listeners.task;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

import com.nimbusds.oauth2.sdk.util.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.camunda.bpm.engine.delegate.*;
import org.camunda.bpm.engine.identity.User;
import org.camunda.bpm.extension.hooks.listeners.BaseListener;
import org.camunda.bpm.extension.hooks.services.IMessageEvent;
import org.joda.time.DateTime;
import org.springframework.stereotype.Component;

/**
 * Timeout Task Listener to start a message event when the deadline is due
 *
 * @author yichun.zhao@aot-technologies.com, sumathi.thirumani@aot-technologies.com
 */
@Component
public class TimeoutNotifyListener  extends BaseListener implements TaskListener, IMessageEvent {

    private Expression escalationGroup;
    private Expression messageName;
    private Expression currentDate;
    private static final Logger log = Logger.getLogger(TimeoutNotifyListener.class.getName());


    /**
     * This calculates time logic
     * and provides the necessary information to send message.
     *
     * @param delegateTask: The task which sends the message
     */
    public void notify(DelegateTask delegateTask) {
            DateTime currentDate = this.currentDate != null && this.currentDate.getValue(delegateTask) != null ?
                      new DateTime(String.valueOf(this.currentDate.getValue(delegateTask))) : new DateTime();
            DateTime dueDate = delegateTask.getDueDate() != null ? new DateTime(delegateTask.getDueDate())
                    : new DateTime(delegateTask.getExecution().getVariable("task_due_date"));
            String escalationGroup = this.escalationGroup != null && this.escalationGroup.getValue(delegateTask) != null ?
                    String.valueOf(this.escalationGroup.getValue(delegateTask)) : null;
            DateTime remindDate = addBusinessDays(dueDate, -1);
            DateTime escalateDate = addBusinessDays(dueDate,1);
            log.info("Timeout Notify listener invoked for pid="+delegateTask.getProcessInstanceId()
                    +"|due Date=" +dueDate.toLocalDate()+"|current Date="+currentDate.toLocalDate()
                    +"|escalation Date="+escalateDate.toLocalDate()
                    +"|reminder Date="+remindDate.toLocalDate());
            // Check if escalate first because reminder date is before escalation date
            if (currentDate.toLocalDate().equals(escalateDate.toLocalDate()) && StringUtils.isNotEmpty(escalationGroup)) {
                validateAssigneeAndNotify(delegateTask, "activity_escalation", escalationGroup);
            } else if (currentDate.toLocalDate().equals(remindDate.toLocalDate())) {
                validateAssigneeAndNotify(delegateTask, "activity_reminder", null);
            }
    }

    private void validateAssigneeAndNotify(DelegateTask delegateTask, String category, String escalationGroup) {
        List<String> escalationGrpEmails = new ArrayList<>();
        if(StringUtils.isNotEmpty(escalationGroup)) {
            escalationGrpEmails.addAll(getEmailsForGroup(delegateTask.getExecution(),escalationGroup));
        }
        if(StringUtils.isNotEmpty(delegateTask.getAssignee())) {
            User user = getUser(delegateTask.getExecution(),delegateTask.getAssignee());
            delegateTask.getExecution().setVariable("firstname",user.getFirstName());
            delegateTask.getExecution().setVariable("lastname",user.getLastName());
            delegateTask.getExecution().setVariable("name",user.getFirstName()+" "+user.getLastName());
            List<String> userEmails = new ArrayList<>();
            if(StringUtils.isNotEmpty(user.getEmail())) {
                userEmails.add(user.getEmail());
                sendEmailNotification(delegateTask.getExecution(), category,userEmails
                        , escalationGrpEmails,delegateTask.getId());
            }
        } else {
            delegateTask.getExecution().setVariable("name",getDefaultAddresseName());
            sendEmailNotification(delegateTask.getExecution(),category,
                    getEmailsOfUnassignedTask(delegateTask), escalationGrpEmails,delegateTask.getId());
        }
    }

    private void sendEmailNotification(DelegateExecution execution, String category, List<String> toEmails, List<String> ccEmails,String taskId) {
        String toAddress = CollectionUtils.isNotEmpty(toEmails) ? StringUtils.join(toEmails,",") : null;
        String ccAddress = CollectionUtils.isNotEmpty(ccEmails) ? StringUtils.join(ccEmails,",") : null;
        if(StringUtils.isNotEmpty(toAddress)) {
            Map<String, Object> emailAttributes = new HashMap<>();
            emailAttributes.put("to", toAddress);
            if(StringUtils.isNotEmpty(ccAddress)) {
                emailAttributes.put("cc", ccAddress);
            }
            emailAttributes.put("category", category);
            emailAttributes.put("taskid", taskId);
            log.info("Inside notify attributes:" + emailAttributes);
            if(StringUtils.isNotBlank(toAddress) && StringUtils.indexOf(toAddress,"@") > 0) {
                sendMessage(execution, emailAttributes,getMessageName(execution));
            }
        }
    }


    private String getMessageName(DelegateExecution execution){
        return String.valueOf(this.messageName.getValue(execution));
    }

}
