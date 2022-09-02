package org.camunda.bpm.extension.hooks.listeners;

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
import java.util.Map;

import static org.junit.Assert.assertThrows;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

import static org.camunda.bpm.extension.commons.utils.VariableConstants.FORM_URL;

/**
 * FormBPM Data Pipeline Listener Test.
 * Test class for FormBPMDataPipelineListener
 */
@ExtendWith(SpringExtension.class)
public class FormBPMDataPipelineListenerTest {

    @InjectMocks
    private FormBPMDataPipelineListener formBPMDataPipelineListener;

    @Mock
    private FormSubmissionService formSubmissionService;

    
    /**
     * This test case perform positive test over notify method in FormBPMDataPipelineListener
     * There is setVariable operations are happening over DelegateExecution
     * By providing the variable this test will ensure it sets properly
     */
    @Test
    public void syncFormVariables_with_delegateExecution_and_validFormUrl_test() throws Exception {
        DelegateExecution delegateExecution = mock(DelegateExecution.class);
        String actualFormUrl = "http://localhost:3001/form/id1";
        Map<String, Object> variables = new HashMap<>();
        variables.put(FORM_URL, actualFormUrl);
        delegateExecution.setVariable(FORM_URL, actualFormUrl);
        when(delegateExecution.getVariables())
                .thenReturn(variables);

        Map<String,Object> dataMap = new HashMap<>();
        dataMap.put("name", "john");
        when(formSubmissionService.retrieveFormValues(actualFormUrl))
                .thenReturn(dataMap);
        formBPMDataPipelineListener.notify(delegateExecution);
        ArgumentCaptor<String> captor = ArgumentCaptor.forClass(String.class);
        verify(delegateExecution, times(2)).setVariable(anyString(), captor.capture());
        assertEquals("john", captor.getValue());
    }

    /**
     * This test case perform positive test over notify method in FormBPMDataPipelineListener
     * There is setVariable operations are happening over DelegateTask
     * By providing the variable this test will ensure it sets properly
     */
    @Test
    public void syncFormVariables_with_delegateTask_and_validFormUrl_test() throws Exception {
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
		
		Map<String, Object> dataMap = new HashMap<>();
		dataMap.put("name", "john");
		when(formSubmissionService.retrieveFormValues(actualFormUrl))
				.thenReturn(dataMap);
		formBPMDataPipelineListener.notify(delegateTask);
		ArgumentCaptor<String> captor = ArgumentCaptor.forClass(String.class);
        verify(delegateExecution).setVariable(anyString(), captor.capture());
        assertEquals("john", captor.getValue());
    }
    
    /**
     * This test case perform negative test over notify method in FormBPMDataPipelineListener
     * Expectation will be to fail the case with Runtime Exception
     */
    @Test
    public void syncFormVariables_with_delegateExecution_and_exception_test() throws Exception {
		DelegateExecution delegateExecution = mock(DelegateExecution.class);
		String actualFormUrl = "http://localhost:3001/form/id1";
		Map<String, Object> variables = new HashMap<>();
		variables.put(FORM_URL, actualFormUrl);
		delegateExecution.setVariable(FORM_URL, actualFormUrl);
		when(delegateExecution.getVariables())
				.thenReturn(variables);
		doThrow(new IOException("Unable to Sync Form Variables"))
				.when(formSubmissionService).retrieveFormValues(actualFormUrl);
		assertThrows(RuntimeException.class, () -> {
			formBPMDataPipelineListener.notify(delegateExecution);
		});

    }

    /**
     * This test case perform negative test over notify method in FormBPMDataPipelineListener
     * Expectation will be to fail the case with Runtime Exception
     */
    @Test
    public void syncFormVariables_with_delegateTask_and_exception_test() throws Exception {
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
         doThrow(new IOException("Unable to Sync Form Variables"))
                 .when(formSubmissionService).retrieveFormValues(actualFormUrl);
         assertThrows(RuntimeException.class, () -> {
        	 formBPMDataPipelineListener.notify(delegateTask);
         });
    }
}
