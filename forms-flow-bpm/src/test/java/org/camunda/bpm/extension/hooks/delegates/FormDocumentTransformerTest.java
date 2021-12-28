package org.camunda.bpm.extension.hooks.delegates;

import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.extension.hooks.services.FormSubmissionService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Test class for FormDocumentTransformer
 */
@ExtendWith(SpringExtension.class)
public class FormDocumentTransformerTest {

    @InjectMocks
    private FormDocumentTransformer formDocumentTransformer;

    @Mock
    private FormSubmissionService formSubmissionService;
    
	/**
	 * This test case perform a positive test over execute method in FormDocumentTransformer
	 * There is a setVariable operations are happening over DelegateExecution
     * By providing the variable this test will ensure it sets properly
	 */
	@Test
    public void testFormDocumentTransformer_happyFlow() throws Exception {
        Map<String,Object> variables = new HashMap<>();
        variables.put("formUrl", "http://localhost:3001");
        Map<String,Object> dataMap = new HashMap<>();
        dataMap.put("applicationStatus", "New");
        DelegateExecution execution = mock(DelegateExecution.class);
        when(execution.getVariables())
        		.thenReturn(variables);
        when(formSubmissionService.retrieveFormValues(anyString()))
        		.thenReturn(dataMap);
        
        formDocumentTransformer.execute(execution);
        ArgumentCaptor<String> captor = ArgumentCaptor.forClass(String.class);
        verify(execution, times(1)).setVariable(anyString(), captor.capture());
        String expected = "New";
        String actual = captor.getValue();
        assertEquals(expected, actual);
    }
}
