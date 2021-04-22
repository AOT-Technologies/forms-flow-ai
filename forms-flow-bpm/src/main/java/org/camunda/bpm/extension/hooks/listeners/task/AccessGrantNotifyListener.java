package org.camunda.bpm.extension.hooks.listeners.task;

import com.nimbusds.oauth2.sdk.util.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.DelegateTask;
import org.camunda.bpm.engine.delegate.Expression;
import org.camunda.bpm.engine.delegate.TaskListener;
import org.camunda.bpm.engine.task.IdentityLink;
import org.camunda.bpm.extension.hooks.services.IMessageEvent;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.logging.Logger;

/**
 * This component is aimed at sending notification to Access Groups
 *
 * @author  sumathi.thirumani@aot-technologies.com
 */
@Component
public class AccessGrantNotifyListener implements TaskListener, IMessageEvent {

    private Expression excludeGroup;
    private Expression messageId;
    private Expression category;

    private static final Logger LOGGER = Logger.getLogger(AccessGrantNotifyListener.class.getName());

    @Value("${formbuilder.pipeline.service.bpm-url}")
    private String appcontexturl;

    /**
     * This provides the necessary information to send message.
     *
     * @param delegateTask: The task which sends the message
     */
    public void notify(DelegateTask delegateTask) {
        LOGGER.info("\n\nAccessGrantNotify listener invoked! " + delegateTask.getId());
        List<String> notifyGrp = new ArrayList<>();
        String excludeGroupValue = this.excludeGroup != null && this.excludeGroup.getValue(delegateTask) != null ?
                String.valueOf(this.excludeGroup.getValue(delegateTask)) : null;
        List<String> exclusionGroupList = new ArrayList<>();
        if(StringUtils.isNotBlank(excludeGroupValue)) {exclusionGroupList.add(excludeGroupValue.trim());}
        if(delegateTask.getExecution().getVariables().containsKey(getTrackVariable(delegateTask))) {
            String tmpData = String.valueOf(delegateTask.getExecution().getVariable(getTrackVariable(delegateTask)));
            if(StringUtils.isNotBlank(tmpData)) {
                exclusionGroupList.addAll(Arrays.asList(StringUtils.split(tmpData, "|")));
            }
        }
        List<String> accessGroupList = getModifiedGroupsForTask(delegateTask, exclusionGroupList);
        String modifedGroupStr = String.join("|",accessGroupList);
        LOGGER.info("Current Group="+excludeGroupValue+"|Modified GroupData=" + modifedGroupStr);

        if(StringUtils.isBlank(delegateTask.getAssignee()) && CollectionUtils.isNotEmpty(accessGroupList)) {
            for (String entry : accessGroupList) {
                notifyGrp.addAll(getEmailsForGroup(delegateTask.getExecution(), entry));
            }
        }

        if(CollectionUtils.isNotEmpty(notifyGrp)) {
            if(CollectionUtils.isNotEmpty(accessGroupList)) {
                delegateTask.getExecution().setVariable(getTrackVariable(delegateTask),modifedGroupStr);
            }
            sendEmailNotification(delegateTask.getExecution(), notifyGrp, delegateTask.getId());
        }
    }

    private void sendEmailNotification(DelegateExecution execution, List<String> toEmails, String taskId) {
        String toAddress = CollectionUtils.isNotEmpty(toEmails) ? StringUtils.join(toEmails,",") : null;
        if(StringUtils.isNotEmpty(toAddress)) {
            Map<String, Object> emailAttributes = new HashMap<>();
            emailAttributes.put("to", toAddress);
            emailAttributes.put("category", getCategory(execution));
            emailAttributes.put("name",getDefaultAddresseName());
            emailAttributes.put("taskid",taskId);
            log.info("Inside notify attributes:" + emailAttributes);
            execution.setVariable("taskurl", getAPIContextURL()+"/app/tasklist/default/#/?task="+taskId);
            if(StringUtils.isNotBlank(toAddress) && StringUtils.indexOf(toAddress,"@") > 0) {
                sendMessage(execution, emailAttributes,getMessageId(execution));
            }
        }
    }

    private String getAPIContextURL() {
        return StringUtils.remove(StringUtils.remove(appcontexturl, StringUtils.substringBetween(appcontexturl,"://","@")),"@");
    }

    private List<String> getModifiedGroupsForTask(DelegateTask delegateTask, List<String> exclusionGroup) {
        Set<IdentityLink> identityLinks = delegateTask.getCandidates();
        List<String> newGroupsAdded = new ArrayList<>();
        if (CollectionUtils.isNotEmpty(identityLinks)) {
            for (IdentityLink entry : identityLinks) {
                String grpId = entry.getGroupId().trim();
                if (!exclusionGroup.contains(grpId)) {
                    newGroupsAdded.add(entry.getGroupId().trim());
                }
            }
        }
        return newGroupsAdded;
    }

    private String getTrackVariable(DelegateTask delegateTask) {
        return delegateTask.getTaskDefinitionKey()+"_notify_sent_to";
    }

    private String getMessageId(DelegateExecution execution){
        return String.valueOf(this.messageId.getValue(execution));
    }

    private String getCategory(DelegateExecution execution){
        return String.valueOf(this.category.getValue(execution));
    }
}
