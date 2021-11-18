package org.camunda.bpm.extension.hooks.controllers.mapper;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.camunda.bpm.extension.hooks.controllers.data.Task;
import org.camunda.bpm.extension.hooks.controllers.data.Variable;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.ResultSetExtractor;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
public class TaskResultSetExtractor implements ResultSetExtractor<Task> {

    private Map<String,Task> taskMap;

    @Override
    public Task extractData(ResultSet rs) throws SQLException, DataAccessException {
        String taskId = rs.getString("taskid");
        Task task = null;
        if(!taskMap.containsKey(taskId)) {
            taskMap.put(rs.getString("taskid"), new Task());
            task = taskMap.get(taskId);
            task.setId(rs.getString("taskid"));
            task.setName(rs.getString("taskname"));
            task.setAssignee(rs.getString("assignee"));
            task.setStatus(rs.getString("status"));
            task.setProcessInstanceId(rs.getString("pid"));
            task.setProcessDefinitionKey(rs.getString("processdefkey"));
            task.setTaskDefinitionKey(rs.getString("taskDefinitionKey"));
            task.setGroupName(rs.getString("groupname"));
            List<Variable> variables = new ArrayList<>();
            task.setVariables(variables);
        } else {
            task = taskMap.get(taskId);
        }
        task.getVariables().add(new Variable(rs.getString("variablename"), rs.getString("variablevalue")));
        return task;
    }
}
