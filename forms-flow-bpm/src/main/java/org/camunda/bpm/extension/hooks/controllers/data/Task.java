package org.camunda.bpm.extension.hooks.controllers.data;

import lombok.Data;
import org.camunda.bpm.engine.rest.dto.task.TaskDto;

import java.util.List;

@Data
public class Task  extends TaskDto {
    private String processInstanceId;
    private String processDefinitionKey;
    private String taskDefinitionKey;
    private String groupName;
    private String status;
    private List<Variable> variables;
}
