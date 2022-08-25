package org.camunda.bpm.extension.hooks.listeners;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.DelegateTask;
import org.camunda.bpm.extension.hooks.services.FormSubmissionService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.camunda.bpm.extension.commons.utils.VariableConstants.FORM_URL;
import static org.camunda.bpm.extension.commons.utils.VariableConstants.WEB_FORM_URL;

/**
 * Form Submission Listener Test.
 * Test class for FormSubmissionListener.
 */
@ExtendWith(SpringExtension.class)
public class FormSubmissionListenerTest {

    @InjectMocks
    private FormSubmissionListener formSubmissionListener;

    @Mock
    private FormSubmissionService formSubmissionService;
    
    /**
     * This test case perform positive test over notify method in FormSubmissionListener
     * There is setVariable operations are happening over DelegateExecution
     * By providing the variable this test will ensure it sets properly
     */
    @Test
    public void createRevision_with_delegateExecution_and_validFormUrl_test() throws Exception {
        DelegateExecution delegateExecution = mock(DelegateExecution.class);
        String actualFormUrl = "http://localhost:3001/form/id1";
        String expectedFormUrl = "http://localhost:3001/form/id2";
        String actualWebFormUrl = "http://localhost:3000/form/id1";
        String expectedWebFormUrl = "http://localhost:3000/form/id2";
        Map<String, Object> variables = new HashMap<>();
        variables.put(FORM_URL, actualFormUrl);
        variables.put(WEB_FORM_URL, actualWebFormUrl);
        delegateExecution.setVariable(FORM_URL, actualFormUrl);
        delegateExecution.setVariable(WEB_FORM_URL, actualWebFormUrl);
        when(delegateExecution.getVariables())
                .thenReturn(variables);
        when(formSubmissionService.createRevision(actualFormUrl))
                .thenReturn("id2");
        when(formSubmissionService.createRevision(actualWebFormUrl))
                .thenReturn("id2");
        formSubmissionListener.notify(delegateExecution);
        ArgumentCaptor<String> captor = ArgumentCaptor.forClass(String.class);
        verify(delegateExecution, times(4)).setVariable(anyString(), captor.capture());
        List<String> allValues = captor.getAllValues();
        assertEquals(expectedFormUrl, allValues.get(2));
        assertEquals(expectedWebFormUrl, allValues.get(3));
    }
    
    /**
     * This test case perform positive test over notify method in FormSubmissionListener
     * There is setVariable operations are happening over DelegateTask
     * By providing the variable this test will ensure it sets properly
     */
    @Test
    public void createRevision_with_delegateTask_and_validFormUrl_test() throws Exception {
        DelegateTask delegateTask = mock(DelegateTask.class);
        DelegateExecution delegateExecution = mock(DelegateExecution.class);
        String actualFormUrl = "http://localhost:3001/form/id1";
        String expectedFormUrl = "http://localhost:3001/form/id2";
        String actualWebFormUrl = "http://localhost:3000/form/id1";
        String expectedWebFormUrl = "http://localhost:3000/form/id2";
        Map<String, Object> variables = new HashMap<>();
        variables.put(FORM_URL, actualFormUrl);
        variables.put(WEB_FORM_URL, actualWebFormUrl);
        delegateTask.setVariable(FORM_URL, actualFormUrl);
        delegateTask.setVariable(WEB_FORM_URL, actualWebFormUrl);
        when(delegateTask.getExecution())
                .thenReturn(delegateExecution);
        when(delegateExecution.getVariables())
                .thenReturn(variables);
        when(formSubmissionService.createRevision(actualFormUrl))
                .thenReturn("id2");
        when(formSubmissionService.createRevision(actualWebFormUrl))
                .thenReturn("id2");
        formSubmissionListener.notify(delegateExecution);
        ArgumentCaptor<String> captor = ArgumentCaptor.forClass(String.class);

        verify(delegateExecution, times(2)).setVariable(anyString(), captor.capture());
        List<String> allValues = captor.getAllValues();
        assertEquals(expectedFormUrl, allValues.get(0));
        assertEquals(expectedWebFormUrl, allValues.get(1));
    }
    
    /**
     * This test case perform negative test over notify method in FormSubmissionListener
     * Expectation will be to fail the case with Runtimeexception
     */
    @Test
    public void createRevision_with_delegateTask_and_exception_test() throws Exception {
        DelegateTask delegateTask = mock(DelegateTask.class);
        DelegateExecution delegateExecution = mock(DelegateExecution.class);
        String actualFormUrl = "http://localhost:3001/form/id1";
        Map<String, Object> variables = new HashMap<>();
        variables.put(FORM_URL, actualFormUrl);
        delegateTask.setVariable(FORM_URL, actualFormUrl);
        when(delegateTask.getExecution())
                .thenReturn(delegateExecution);
        when(delegateExecution.getVariables())
                .thenReturn(variables);
        doThrow(new IOException("Unable to read submission for: "+ actualFormUrl))
                .when(formSubmissionService).createRevision(actualFormUrl);
        assertThrows(RuntimeException.class, () -> {
            formSubmissionListener.notify(delegateTask);
        });
    }

    /**
     * This test case perform negative test over notify method in FormSubmissionListener
     * Expectation will be to fail the case with Runtimeexception
     */
    @Test
    public void createRevision_with_delegateExecution_and_exception_test() throws Exception {
        DelegateExecution delegateExecution = mock(DelegateExecution.class);
        String actualFormUrl = "http://localhost:3001/form/id1";
        Map<String, Object> variables = new HashMap<>();
        variables.put(FORM_URL, actualFormUrl);
        delegateExecution.setVariable(FORM_URL, actualFormUrl);
        when(delegateExecution.getVariables())
                .thenReturn(variables);
        doThrow(new IOException("Unable to read submission for: "+ actualFormUrl))
                .when(formSubmissionService).createRevision(actualFormUrl);
        assertThrows(RuntimeException.class, () -> {
            formSubmissionListener.notify(delegateExecution);
        });
    }
}
