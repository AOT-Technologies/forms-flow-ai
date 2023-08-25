package org.camunda.bpm.extension.hooks.listeners.task;

import org.camunda.bpm.engine.IdentityService;
import org.camunda.bpm.engine.ProcessEngine;
import org.camunda.bpm.engine.ProcessEngineServices;
import org.camunda.bpm.engine.RuntimeService;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.DelegateTask;
import org.camunda.bpm.engine.delegate.Expression;
import org.camunda.bpm.engine.identity.User;
import org.camunda.bpm.engine.identity.UserQuery;
import org.camunda.bpm.engine.task.IdentityLink;
import org.camunda.bpm.extension.hooks.listeners.stubs.IdentityStub;
import org.camunda.bpm.extension.hooks.listeners.stubs.UserStub;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.util.*;

import static org.junit.Assert.assertEquals;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(SpringExtension.class)
public class AccessGrantNotifyListenerTest {

    @InjectMocks
    private AccessGrantNotifyListener accessGrantNotifyListener;

    @Mock
    private DelegateTask delegateTask;

    @Mock
    private DelegateExecution delegateExecution;

    @Mock
    private Expression excludeGroup;

    @Mock
    private Expression messageId;

    @Mock
    private Expression category;

    @Mock
    ProcessEngine processEngine;

    @Mock
    IdentityService identityService;

    @Mock
    ProcessEngineServices processEngineServices;

    @Mock
    RuntimeService runtimeService;

    @Test
    public void invoke_notify() {
        String id = "id1";
        String exclusionGroup = "GROUP2";
        String assignee = "";
        Map<String, Object> variables = new HashMap<>();
        variables.put("key_notify_sent_to","GROUP3");
        Set<IdentityLink> identityList = new HashSet();
        identityList.add(new IdentityStub("1", "CANDIDATE", "GROUP1", "TASK1", "PROCESS1", "TENANT-1", "Honai"));
        when(delegateTask.getCandidates())
                .thenReturn(identityList);
        when(delegateTask.getExecution())
                .thenReturn(delegateExecution);
        when(delegateTask.getExecution().getVariables())
                .thenReturn(variables);
        when(delegateTask.getId())
                .thenReturn(id);
        when(excludeGroup.getValue(delegateTask.getExecution()))
                .thenReturn(exclusionGroup);
        when(delegateTask.getTaskDefinitionKey())
                .thenReturn("key");
        when(delegateTask.getAssignee())
                .thenReturn(assignee);
        List<User> userList = new ArrayList<>();
        userList.add(new UserStub("1", "John", "Honai", "john.honai@aot-technologies.com", "password"));
        userList.add(new UserStub("2", "Peter", "Scots", "peter.scots@aot-technologies.com", "password"));
        when(delegateExecution.getProcessEngine())
                .thenReturn(processEngine);
        when(processEngine.getIdentityService())
                .thenReturn(identityService);
        UserQuery userQuery = mock(UserQuery.class);
        UserQuery userQuery1 = mock(UserQuery.class);
        when(identityService.createUserQuery())
                .thenReturn(userQuery);
        when(userQuery.memberOfGroup(anyString()))
                .thenReturn(userQuery1);
        when(userQuery1.list())
                .thenReturn(userList);
        when(delegateExecution.getProcessEngineServices())
                .thenReturn(processEngineServices);
        when(delegateExecution.getProcessEngineServices().getRuntimeService())
                .thenReturn(runtimeService);
        when(messageId.getValue(delegateExecution))
                .thenReturn("id1");
        when(category.getValue(delegateExecution))
                .thenReturn("category1");

        accessGrantNotifyListener.notify(delegateTask);
        ArgumentCaptor<String> messageIdCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<Map> messageVariableCaptor = ArgumentCaptor.forClass(Map.class);
        verify(runtimeService).startProcessInstanceByMessage(messageIdCaptor.capture(),
                messageVariableCaptor.capture());
        Map<String, Object> eMessageVariables = new HashMap<>();
        eMessageVariables.put("to", "john.honai@aot-technologies.com,peter.scots@aot-technologies.com");
        eMessageVariables.put("name", "Team");
        eMessageVariables.put("category", "category1");
        eMessageVariables.put("taskid", "id1");
        eMessageVariables.put("key_notify_sent_to","GROUP3");
        assertEquals("id1", messageIdCaptor.getValue());
        assertEquals(eMessageVariables, messageVariableCaptor.getValue());
    }

}
