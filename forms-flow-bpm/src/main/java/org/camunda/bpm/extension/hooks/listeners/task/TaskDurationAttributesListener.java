package org.camunda.bpm.extension.hooks.listeners.task;

import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.DelegateTask;
import org.camunda.bpm.engine.delegate.Expression;
import org.camunda.bpm.engine.delegate.TaskListener;
import org.camunda.bpm.extension.hooks.services.IMessageEvent;
import org.camunda.bpm.extension.hooks.services.IUser;
import org.joda.time.DateTime;

import java.util.logging.Logger;

/**
 * This class is intended to set the due date in business days.
 * Currently, the system allows overriding of task due date from application UI.
 * NOTE: This class has made a assumption of applying SLA of 3 days by default. This could be overriden through the listener property.
 *
 * @author  sumathi.thirumani@aot-technologies.com
 */
public class TaskDurationAttributesListener implements TaskListener, IUser, IMessageEvent {

    private Expression SLAInDays;

    private final Logger LOGGER = Logger.getLogger(TaskDurationAttributesListener.class.getName());

    /**
     * Callback method for task create.
     * @param delegateTask
     */
    @Override
    public void notify(DelegateTask delegateTask) {
        //Set Task Creation date
        populateTaskCreateDate(delegateTask.getExecution());
        //Set Task Due date
        Integer days = this.SLAInDays != null && this.SLAInDays.getValue(delegateTask) != null ?
                Integer.valueOf(String.valueOf(this.SLAInDays.getValue(delegateTask))) : 3;
        populateTaskDueDate(delegateTask, days);
    }

    private void populateTaskCreateDate(DelegateExecution execution) {
        execution.setVariable("task_create_date",new DateTime().toString());
    }

    private void populateTaskDueDate(DelegateTask delegateTask,Integer days) {
        DateTime dueDate = addBusinessDays(new DateTime(delegateTask.getExecution().getVariable("task_create_date")),days);
        delegateTask.getExecution().setVariable("task_due_date",dueDate.toString());
        delegateTask.setDueDate(dueDate.toDate());
    }

}
