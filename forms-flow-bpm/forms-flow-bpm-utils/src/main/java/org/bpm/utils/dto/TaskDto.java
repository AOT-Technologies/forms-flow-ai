package org.bpm.utils.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.Date;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class TaskDto {
    private String id;
    private String name;
    private String assignee;
    private Date created;
    private Date due;
    private Date followUp;
    private String description;
    private String parentTaskId;
    private int priority;
    private String processDefinitionId;
    private String processInstanceId;
    private String taskDefinitionKey;
    private String tenantId;
}
