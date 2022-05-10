package org.camunda.bpm.extension.hooks.controllers;

import net.minidev.json.JSONArray;
import org.camunda.bpm.extension.hooks.controllers.data.Task;
import org.camunda.bpm.extension.hooks.controllers.data.Variable;
import org.camunda.bpm.extension.hooks.controllers.stubs.TaskStub;
import org.camunda.bpm.extension.hooks.controllers.stubs.VariableStub;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.jdbc.core.ResultSetExtractor;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.core.namedparam.SqlParameterSource;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import static org.camunda.bpm.extension.commons.utils.VariableConstants.APPLICATION_STATUS;

/**
 * Task Controller Test.
 * Test class for TaskController.
 */
@ExtendWith(SpringExtension.class)
public class TaskControllerTest {

    @InjectMocks
    private TaskController taskController;

    private MockMvc mockMvc;

    @Mock
    private Authentication auth;

    @Mock
    private NamedParameterJdbcTemplate bpmJdbcTemplate;

    @BeforeEach
    public void setup() {
        mockMvc = MockMvcBuilders.standaloneSetup(taskController).build();
        SecurityContextHolder.getContext().setAuthentication(auth);

        Map<String, Object> claims = new HashMap<>();
        JSONArray groups = new JSONArray();
        groups.add(new String("/camunda-admin"));
        groups.add(new String("/formsflow/formsflow-reviewer"));
        claims.put("groups", groups);

        OidcUser oidcUser = mock(OidcUser.class);
        when(auth.getPrincipal())
                .thenReturn(oidcUser);

        when(oidcUser.getClaims())
                .thenReturn(claims);
    }

    /**
     * This test case perform over getTasks method and success
     * Expect Status OK
     */ 
    @Test
    public void getTasks_2xxSuccessful() throws Exception {

        List<Task> tasks = new ArrayList<>();
        List<Variable> variables = new ArrayList<>();
        VariableStub variableStub = new VariableStub(APPLICATION_STATUS, "New");
        variables.add(variableStub);
        TaskStub taskStub = new TaskStub("pinst-1","pdef-1","task-1", "camunda-admin", "New", variables);
        tasks.add(taskStub);
        given(bpmJdbcTemplate.query(anyString(), any(SqlParameterSource.class), any(ResultSetExtractor.class)))
                .willReturn(tasks);
        mockMvc.perform(
                MockMvcRequestBuilders.get("/engine-rest-ext/task"))
                .andExpect(status().isOk());
    }

    /**
     * This test case perform over getTasks method and success
     * Expect Status OK
     */ 
    @Test
    public void getTasks_2xxSuccessful_with_param_taskId() throws Exception {

        List<Variable> variables = new ArrayList<>();
        VariableStub variableStub = new VariableStub(APPLICATION_STATUS, "New");
        variables.add(variableStub);
        TaskStub taskStub = new TaskStub("pinst-1","pdef-1","task-1", "camunda-admin", "New", variables);
        taskStub.setId("1");
        given(bpmJdbcTemplate.query(anyString(), any(SqlParameterSource.class), any(ResultSetExtractor.class)))
                .willReturn(taskStub);
        mockMvc.perform(
                MockMvcRequestBuilders.get("/engine-rest-ext/task/{taskid}", "1"))
                .andExpect(status().isOk());
    }
    
    /**
     * This test case perform over getTasks method and success
     * Expect Status 404 NOTFOUND
     */ 
    @Test
    public void getTasks_4xxNotFound_with_param_taskId() throws Exception {

        List<Variable> variables = new ArrayList<>();
        VariableStub variableStub = new VariableStub(APPLICATION_STATUS, "New");
        variables.add(variableStub);
        TaskStub taskStub = new TaskStub("pinst-1","pdef-1","task-1", "camunda-admin", "New", variables);
        given(bpmJdbcTemplate.query(anyString(), any(SqlParameterSource.class), any(ResultSetExtractor.class)))
                .willReturn(taskStub);
        mockMvc.perform(
                MockMvcRequestBuilders.get("/engine-rest-ext/task/{taskid}", "1"))
                .andExpect(status().is4xxClientError());
    }
}
