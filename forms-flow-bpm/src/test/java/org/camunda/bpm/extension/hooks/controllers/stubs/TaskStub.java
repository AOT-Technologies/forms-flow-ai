package org.camunda.bpm.extension.hooks.controllers.stubs;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.camunda.bpm.extension.hooks.controllers.data.Task;
import org.camunda.bpm.extension.hooks.controllers.data.Variable;

import java.util.List;

/**
 * Task Stub.
 * Stub class for Task.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class TaskStub extends Task {

    private String processInstanceId;
    private String processDefinitionKey;
    private String taskDefinitionKey;
    private String groupName;
    private String status;
    private List<Variable> variables;
}
