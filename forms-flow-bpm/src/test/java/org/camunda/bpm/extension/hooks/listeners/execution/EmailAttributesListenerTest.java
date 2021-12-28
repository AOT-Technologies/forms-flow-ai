package org.camunda.bpm.extension.hooks.listeners.execution;

import org.camunda.bpm.engine.IdentityService;
import org.camunda.bpm.engine.ProcessEngine;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.identity.User;
import org.camunda.bpm.engine.identity.UserQuery;
import org.camunda.bpm.engine.variable.Variables;
import org.junit.jupiter.api.Test;
import org.camunda.bpm.extension.hooks.listeners.stubs.UserStub;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Test class for EmailAttributesListener
 */
@ExtendWith(SpringExtension.class)
public class EmailAttributesListenerTest {

    @InjectMocks
    private EmailAttributesListener emailAttributesListener;

    /**
     * This test case perform a positive test over notify method in EmailAttributesListener
     * The to field is set on template data for validation
     * There are 4 setVariable operations are happening over DelegateExecution
     * By providing the 4 variable this test will ensure it sets properly
     */
    @Test
    public void transform_emailAttributeData_mapToExecutionData_with_templateToAddressData_and_success(){

        DelegateExecution execution = mock(DelegateExecution.class);

        Map<String,Object> variables = new HashMap<>();
        variables.put("receiverName", "Test User");
        variables.put("senderName", "John Honai");

        Map<String, Object> dmnMap = new HashMap<>();
        dmnMap.put("to", "test@aot-technologies.com");
        dmnMap.put("body", "Hi @receiverName, This is @senderName");
        dmnMap.put("subject", "Test Subject from @senderName");
        dmnMap.put("cc", "admin@aot-technologies.com");
        variables.put("template", dmnMap);

        when(execution.getVariables())
                .thenReturn(variables);

        when(execution.getVariable("groupName"))
                .thenReturn("camunda-admin");

        List<User> userList = new ArrayList<>();
        userList.add(new UserStub("1", "John", "Honai", "john.honai@aot-technologies.com", "password"));
        userList.add(new UserStub("2", "Peter", "Scots", "peter.scots@aot-technologies.com", "password"));

        ProcessEngine processEngine = mock(ProcessEngine.class);
        when(execution.getProcessEngine())
                .thenReturn(processEngine);
        IdentityService identityService = mock(IdentityService.class);
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

        emailAttributesListener.notify(execution);

        ArgumentCaptor<Object> captor = ArgumentCaptor.forClass(Object.class);
        verify(execution, times(4)).setVariable(anyString(), captor.capture());
        List<Object> allValues = captor.getAllValues();

        //Validating for the expected 4 variables set / not
        assertEquals(Variables.stringValue("Hi Test User, This is John Honai",true),allValues.get(0));
        assertEquals("Test Subject from John Honai",allValues.get(1));
        assertEquals("admin@aot-technologies.com",allValues.get(2));
        assertEquals("test@aot-technologies.com,john.honai@aot-technologies.com,peter.scots@aot-technologies.com",allValues.get(3));
    }

    /**
     * This test case perform a positive test over notify method in EmailAttributesListener
     * The to field is set on DelegateExecution data for validation
     * There are 4 setVariable operations are happening over DelegateExecution
     * By providing the 4 variable this test will ensure it sets properly
     */
    @Test
    public void transform_emailAttributeData_mapToExecutionData_with_executionToAddressData_and_success(){

        DelegateExecution execution = mock(DelegateExecution.class);

        Map<String,Object> variables = new HashMap<>();
        variables.put("to", "test@aot-technologies.com");
        variables.put("receiverName", "Test User");
        variables.put("senderName", "John Honai");

        Map<String, Object> dmnMap = new HashMap<>();
        dmnMap.put("body", "Hi @receiverName, This is @senderName");
        dmnMap.put("subject", "Test Subject from @senderName");
        dmnMap.put("cc", "admin@aot-technologies.com");
        variables.put("template", dmnMap);

        when(execution.getVariables())
                .thenReturn(variables);

        when(execution.getVariable("to"))
                .thenReturn("test@aot-technologies.com");
        when(execution.getVariable("groupName"))
                .thenReturn("camunda-admin");

        List<User> userList = new ArrayList<>();
        userList.add(new UserStub("1", "John", "Honai", "john.honai@aot-technologies.com", "password"));
        userList.add(new UserStub("2", "Peter", "Scots", "peter.scots@aot-technologies.com", "password"));

        ProcessEngine processEngine = mock(ProcessEngine.class);
        when(execution.getProcessEngine())
                .thenReturn(processEngine);
        IdentityService identityService = mock(IdentityService.class);
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

        emailAttributesListener.notify(execution);

        ArgumentCaptor<Object> captor = ArgumentCaptor.forClass(Object.class);
        verify(execution, times(4)).setVariable(anyString(), captor.capture());
        List<Object> allValues = captor.getAllValues();

        //Validating for the expected 4 variables set / not
        assertEquals(Variables.stringValue("Hi Test User, This is John Honai",true),allValues.get(0));
        assertEquals("Test Subject from John Honai",allValues.get(1));
        assertEquals("admin@aot-technologies.com",allValues.get(2));
        assertEquals("test@aot-technologies.com,john.honai@aot-technologies.com,peter.scots@aot-technologies.com",allValues.get(3));
    }

    /**
     * This test case perform a positive test over notify method in EmailAttributesListener
     * The to field is passed null in this test case
     * There are 4 setVariable operations are happening over DelegateExecution
     * By providing the 4 variable this test will ensure it sets properly
     */
    @Test
    public void transform_emailAttributeData_mapToExecutionData_with_emptyToAddressData_and_success(){

        DelegateExecution execution = mock(DelegateExecution.class);

        Map<String,Object> variables = new HashMap<>();
        variables.put("receiverName", "Test User");
        variables.put("senderName", "John Honai");

        Map<String, Object> dmnMap = new HashMap<>();
        dmnMap.put("body", "Hi @receiverName, This is @senderName");
        dmnMap.put("subject", "Test Subject from @senderName");
        dmnMap.put("cc", "admin@aot-technologies.com");
        variables.put("template", dmnMap);

        when(execution.getVariables())
                .thenReturn(variables);
        when(execution.getVariable("groupName"))
                .thenReturn("camunda-admin");

        List<User> userList = new ArrayList<>();
        userList.add(new UserStub("1", "John", "Honai", "john.honai@aot-technologies.com", "password"));
        userList.add(new UserStub("2", "Peter", "Scots", "peter.scots@aot-technologies.com", "password"));

        ProcessEngine processEngine = mock(ProcessEngine.class);
        when(execution.getProcessEngine())
                .thenReturn(processEngine);
        IdentityService identityService = mock(IdentityService.class);
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

        emailAttributesListener.notify(execution);

        ArgumentCaptor<Object> captor = ArgumentCaptor.forClass(Object.class);
        verify(execution, times(4)).setVariable(anyString(), captor.capture());
        List<Object> allValues = captor.getAllValues();

        //Validating for the expected 4 variables set / not
        assertEquals(Variables.stringValue("Hi Test User, This is John Honai",true),allValues.get(0));
        assertEquals("Test Subject from John Honai",allValues.get(1));
        assertEquals("admin@aot-technologies.com",allValues.get(2));
        assertEquals("john.honai@aot-technologies.com,peter.scots@aot-technologies.com",allValues.get(3));
    }

    /**
     * This test case perform a positive test over notify method in EmailAttributesListener
     * All fields are passed null in this test case
     * There are only 3 setVariable operations are happening over DelegateExecution
     * By providing the 3 variable this test will ensure it sets properly
     */
    @Test
    public void transform_emailAttributeData_mapToExecutionData_with_emptyData(){

        DelegateExecution execution = mock(DelegateExecution.class);

        Map<String,Object> variables = new HashMap<>();
        Map<String, Object> dmnMap = new HashMap<>();
        variables.put("template", dmnMap);

        when(execution.getVariables())
                .thenReturn(variables);
        when(execution.getVariable("groupName"))
                .thenReturn("camunda-admin");
        List<User> userList = new ArrayList<>();
        ProcessEngine processEngine = mock(ProcessEngine.class);
        when(execution.getProcessEngine())
                .thenReturn(processEngine);
        IdentityService identityService = mock(IdentityService.class);
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

        emailAttributesListener.notify(execution);

        ArgumentCaptor<Object> captor = ArgumentCaptor.forClass(Object.class);
        verify(execution, times(3)).setVariable(anyString(), captor.capture());
        List<Object> allValues = captor.getAllValues();

        //Validating for the expected 3 variables set / not
        assertEquals(Variables.stringValue(null,true),allValues.get(0));
        assertNull(allValues.get(1));
        assertEquals("",allValues.get(2));
    }
}
