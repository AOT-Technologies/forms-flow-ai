package org.camunda.bpm.extension.commons.io.socket.message;


import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.io.Serializable;
import java.util.Date;
import java.util.Map;

/**
 * Transfer object for task
 *
 * @author sumathi.thirumani@aot-technologies.com
 */
@Data
@NoArgsConstructor
@ToString
public class TaskMessage implements Serializable {

    private String assignee;
    private Date createTime;
    private String deleteReason;
    private String description;
    private Date dueDate;
    private String eventName;
    private String executionId;
    private Date followUpDate;
    private String id;
    private String name;
    private String owner;
    private int priority;
    private String processDefinitionId;
    private String processInstanceId;
    private String taskDefinitionKey;

    private Map<String,Object> variables;
}



