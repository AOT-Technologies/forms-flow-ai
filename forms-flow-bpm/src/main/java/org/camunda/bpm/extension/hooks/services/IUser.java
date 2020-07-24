package org.camunda.bpm.extension.hooks.services;

import com.nimbusds.oauth2.sdk.util.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.DelegateTask;
import org.camunda.bpm.engine.identity.User;
import org.camunda.bpm.engine.task.IdentityLink;
import org.joda.time.DateTime;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

/**
 * This class aimed at centralizing all user related information.
 *
 * @author sumathi.thirumani@aot-technologies.com, yichun.zhao@aot-technologies.com
 */
public interface IUser {

    default String getName(DelegateExecution execution, String userId) {
        User user = execution.getProcessEngine().getIdentityService().createUserQuery().userId(userId).singleResult();
        return user.getFirstName()+" "+user.getLastName();
    }

    default String getEmail(DelegateExecution execution, String userId) {
        User user = execution.getProcessEngine().getIdentityService().createUserQuery().userId(userId).singleResult();
        return user.getEmail();
    }

    default User getUser(DelegateExecution execution, String userId) {
        return execution.getProcessEngine().getIdentityService().createUserQuery().userId(userId).singleResult();
    }

    default String getDefaultAddresseName() {
        return "Team";
    }

    default List<String> getEmailsOfUnassignedTask(DelegateTask delegateTask) {
        Set<IdentityLink> identityLinks = delegateTask.getCandidates();
        List<String> emails = new ArrayList<>();
        if(CollectionUtils.isNotEmpty(identityLinks)) {
            for (IdentityLink entry : identityLinks) {
                if (StringUtils.isNotEmpty(entry.getGroupId())) {
                    emails.addAll(getEmailsForGroup(delegateTask.getExecution(), entry.getGroupId()));
                }
            }
        }
        return emails;
    }

    default List<String> getEmailsForGroup(DelegateExecution execution, String groupName) {
        List<String> emails = new ArrayList<>();
        if(StringUtils.isNotBlank(groupName)) {
            List<User> users =  execution.getProcessEngine().getIdentityService().createUserQuery().memberOfGroup(StringUtils.trim(groupName)).list();
            for(User entry : users) {
                if(StringUtils.isNotEmpty(entry.getEmail())) {
                    emails.add(entry.getEmail());
                }
            }
        }
        return emails;
    }

    /**
     * This adds business days to a Date object.
     * Adapted from https://stackoverflow.com/questions/1044688/addbusinessdays-and-getbusinessdays
     *
     * @param date: The date to be changed
     * @param days: The number of days to be added
     */
    default DateTime addBusinessDays(DateTime date, int days) {
        if (days == 0) return date;
        if (date.getDayOfWeek() == 6) {
            date = date.plusDays(2);
            days -= 1;
        }
        else if (date.getDayOfWeek() == 7) {
            date = date.plusDays(1);
            days -= 1;
        }
        date = date.plusDays(days / 5 * 7);
        int extraDays = days % 5;

        if (date.getDayOfWeek() + extraDays > 5) {
            extraDays += 2;
        }
        return date.plusDays(extraDays);
    }


}
