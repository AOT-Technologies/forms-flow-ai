package org.camunda.bpm.extension.hooks.controllers.mapper;

import org.camunda.bpm.extension.hooks.controllers.data.Task;
import org.camunda.bpm.extension.hooks.controllers.data.Variable;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.camunda.bpm.extension.commons.utils.VariableConstants.GROUP_NAME;
import static org.junit.Assert.assertThrows;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(SpringExtension.class)
public class TaskResultSetExtractorTest {

    @InjectMocks
    private TaskResultSetExtractor taskResultSetExtractor;

    @Mock
    private ResultSet resultSet;

    @Test
    public void test_extractData_taskMap_with_no_taskId() throws SQLException {

        Map<String,Task> taskMapVariable = new HashMap<>();
        Task taskid1 = new Task();
        taskMapVariable.put("key",taskid1);
        taskResultSetExtractor.setTaskMap(taskMapVariable);
        when(resultSet.getString("taskid"))
                .thenReturn("taskid1");
        when(resultSet.getString("taskname"))
                .thenReturn("taskname1");
        when(resultSet.getString("assignee"))
                .thenReturn("assignee1");
        when(resultSet.getString("status"))
                .thenReturn("status1");
        when(resultSet.getString("pid"))
                .thenReturn("pid1");
        when(resultSet.getString("processdefkey"))
                .thenReturn("processdefkey1");
        when(resultSet.getString("taskDefinitionKey"))
                .thenReturn("taskDefinitionKey1");
        when(resultSet.getString(GROUP_NAME))
                .thenReturn("groupname1");
        when(resultSet.getString("variablename"))
                .thenReturn("variablename1");
        when(resultSet.getString("variablevalue"))
                .thenReturn("variablevalue1");

        Task task = taskResultSetExtractor.extractData(resultSet);
        assertEquals(task.getProcessInstanceId(),"pid1");
        assertEquals(task.getProcessDefinitionKey(),"processdefkey1");
        assertEquals(task.getTaskDefinitionKey(),"taskDefinitionKey1");
        assertEquals(task.getGroupName(),"groupname1");
        assertEquals(task.getStatus(),"status1");
        assertEquals(task.getVariables().get(0).getName(),"variablename1");
        assertEquals(task.getVariables().get(0).getValue(),"variablevalue1");
    }

    @Test
    public void test_extractData_taskMap_with_taskId() throws SQLException {

        Map<String,Task> taskMapVariable = new HashMap<>();
        Task taskid1 = new Task();
        taskMapVariable.put("taskid1",taskid1);
        taskResultSetExtractor.setTaskMap(taskMapVariable);
        when(resultSet.getString("taskid"))
                .thenReturn("taskid1");

        assertThrows(NullPointerException.class, () -> {
            taskResultSetExtractor.extractData(resultSet);
        });
    }
}
