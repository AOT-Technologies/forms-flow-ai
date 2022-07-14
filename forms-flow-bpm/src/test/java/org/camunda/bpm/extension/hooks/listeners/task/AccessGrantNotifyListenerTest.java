package org.camunda.bpm.extension.hooks.listeners.task;

import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.DelegateTask;
import org.camunda.bpm.engine.delegate.Expression;
import org.camunda.bpm.engine.task.IdentityLink;
import org.camunda.bpm.extension.hooks.listeners.stubs.IdentityStub;
import org.camunda.bpm.extension.hooks.services.IUser;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import static org.camunda.bpm.extension.commons.utils.VariableConstants.FORM_URL;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

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

    @Test
    public void invoke_notify() {
        String id = "id1";
        String exclusionGroup = "GROUP2";
        String assignee = "";
       // String candidates = "candidate1";
        String applicationId1 = "63628738293";
        String applicationId2 = "7267864574";
       // String json = "[\"applicationId1\",\"applicationId2\"]";
        Map<String, Object> variables = new HashMap<>();
        variables.put("applicationId1", applicationId1);
        variables.put("applicationId2", applicationId2);

        Set<IdentityLink> identityList = new HashSet();
        identityList.add(new IdentityStub("1", "CANDIDATE", "GROUP1", "TASK1", "PROCESS1", "TENANT-1", "Honai"));
        when(delegateTask.getCandidates())
                .thenReturn(identityList);

        when(delegateTask.getExecution()).thenReturn(delegateExecution);
        when(delegateExecution.getVariables())
                .thenReturn(variables);
        when(delegateTask.getId())
                .thenReturn(id);
        when(excludeGroup.getValue(delegateTask.getExecution()))
            .thenReturn(exclusionGroup);
        //when(delegateTask.getExecution().getVariables().containsKey(any()))
         //   .thenReturn(true);

        when(delegateTask.getAssignee())
                .thenReturn(assignee);


        accessGrantNotifyListener.notify(delegateTask);
        assert(true);
    }

}
