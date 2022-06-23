package org.camunda.bpm.extension.hooks.listeners;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.DelegateTask;
import org.camunda.bpm.engine.delegate.Expression;
import org.camunda.bpm.extension.commons.connector.HTTPServiceInvoker;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.IOException;
import java.lang.reflect.Field;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

import static org.camunda.bpm.extension.commons.utils.VariableConstants.FORM_URL;
import static org.camunda.bpm.extension.commons.utils.VariableConstants.APPLICATION_STATUS;
import static org.camunda.bpm.extension.commons.utils.VariableConstants.APPLICATION_ID;

/**
 * BPMForm Data Pipeline Listener Test.
 * Test class for BPMFormDataPipelineListener
 */
@ExtendWith(SpringExtension.class)
public class BPMFormDataPipelineListenerTest {

    @InjectMocks
    private BPMFormDataPipelineListener bpmFormDataPipelineListener;

    @Mock
    private HTTPServiceInvoker httpServiceInvoker;

    private Expression fields;

    @BeforeEach
    public void setup() {
        try {
            Field field = bpmFormDataPipelineListener.getClass().getDeclaredField("bpmObjectMapper");
            field.setAccessible(true);
        } catch (NoSuchFieldException e) {
            e.printStackTrace();
        }
        ObjectMapper objectMapper = new ObjectMapper();
        ReflectionTestUtils.setField(this.bpmFormDataPipelineListener, "bpmObjectMapper", objectMapper);
        this.fields = mock(Expression.class);
    }

    /**
     * This test case perform positive test over notify method in BPMFormDataPipelineListener
     */
    @Test
    public void patchFormAttributes_withInput_delegateExecution_with_statusOk() throws IOException {
        DelegateExecution delegateExecution = mock(DelegateExecution.class);
        String formUrl = "http://localhost:3001/form/id1";
        Map<String, Object> variables = new HashMap<>();
        variables.put(FORM_URL, formUrl);
        when(delegateExecution.getVariables())
                .thenReturn(variables);
        when(httpServiceInvoker.execute(anyString(), any(HttpMethod.class), any(List.class)))
                .thenReturn(new ResponseEntity<>(HttpStatus.OK));
        String payload = "[\"applicationStatus\",\"applicationId\"]";
        ReflectionTestUtils.setField(bpmFormDataPipelineListener, "fields", this.fields);
        when(this.fields.getValue(delegateExecution))
                .thenReturn(payload);
        when(delegateExecution.getVariable(APPLICATION_STATUS))
                .thenReturn("New");
        when(delegateExecution.getVariable(APPLICATION_ID))
                .thenReturn(1);
        bpmFormDataPipelineListener.notify(delegateExecution);
    }
    
    /**
     * This test case will evaluate BPMFormDataPipelineListener with a negative case
     * This test case expect the httpserviceinvoker to return internal error
     * Expectation will be to fail the case with Runtimeexception
     * @throws IOException
     */
    @Test
    public void patchFormAttributes_withInput_delegateExecution_with_fieldValues() throws IOException {
        DelegateExecution delegateExecution = mock(DelegateExecution.class);
        String formUrl = "http://localhost:3001/form/id1";
        Map<String, Object> variables = new HashMap<>();
        variables.put(FORM_URL, formUrl);
        when(delegateExecution.getVariables())
                .thenReturn(variables);
        when(httpServiceInvoker.execute(anyString(), any(HttpMethod.class), any(List.class)))
                .thenReturn(new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR));
        String payload = "[\"applicationStatus\",\"applicationId\"]";
        ReflectionTestUtils.setField(bpmFormDataPipelineListener, "fields", this.fields);
        when(this.fields.getValue(delegateExecution))
                .thenReturn(payload);
        when(delegateExecution.getVariable(APPLICATION_STATUS))
                .thenReturn("New");
        when(delegateExecution.getVariable(APPLICATION_ID))
                .thenReturn(1);
        assertThrows(RuntimeException.class, () -> {
            bpmFormDataPipelineListener.notify(delegateExecution);
        });
    }

    /**
     * This test case will evaluate BPMFormDataPipelineListener with a negative case
     * This test case expect the httpserviceinvoker to return internal error
     * Expectation will be to fail the case with Runtimeexception
     * @throws IOException
     */
    @Test
    public void patchFormAttributes_withInput_delegateExecution_with_emptyFieldValues() throws IOException {
        DelegateExecution delegateExecution = mock(DelegateExecution.class);
        String formUrl = "http://localhost:3001/form/id1";
        Map<String, Object> variables = new HashMap<>();
        variables.put(FORM_URL, formUrl);
        when(delegateExecution.getVariables())
                .thenReturn(variables);
        when(httpServiceInvoker.execute(anyString(), any(HttpMethod.class), any(List.class)))
                .thenReturn(new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR));
        String payload = "[]";
        ReflectionTestUtils.setField(bpmFormDataPipelineListener, "fields", this.fields);
        when(this.fields.getValue(delegateExecution))
                .thenReturn(payload);
        when(delegateExecution.getVariable(APPLICATION_STATUS))
                .thenReturn("New");
        when(delegateExecution.getVariable(APPLICATION_ID))
                .thenReturn(1);
        assertThrows(RuntimeException.class, () -> {
            bpmFormDataPipelineListener.notify(delegateExecution);
        });
    }

    /**
     * This test case will evaluate BPMFormDataPipelineListener with a positive case
     * @throws IOException
     */
    @Test
    public void patchFormAttributes_withInput_delegateExecution_with_ioException() throws IOException {
        DelegateExecution delegateExecution = mock(DelegateExecution.class);
        String formUrl = "http://localhost:3001/form/id1";
        Map<String, Object> variables = new HashMap<>();
        variables.put(FORM_URL, formUrl);
        when(delegateExecution.getVariables())
                .thenReturn(variables);
        doThrow(new IOException("Test Failure")).when(httpServiceInvoker)
                .execute(anyString(), any(HttpMethod.class), any(List.class));
        String payload = "[]";
        ReflectionTestUtils.setField(bpmFormDataPipelineListener, "fields", this.fields);
        when(this.fields.getValue(delegateExecution))
                .thenReturn(payload);
        when(delegateExecution.getVariable(APPLICATION_STATUS))
                .thenReturn("New");
        when(delegateExecution.getVariable(APPLICATION_ID))
                .thenReturn(1);
        assertThrows(RuntimeException.class, () -> {
            bpmFormDataPipelineListener.notify(delegateExecution);
        });
    }

    /**
     * This test case will validate the behaviour with empty form Url
     * @throws IOException
     */
    @Test
    public void patchFormAttributes_withInput_delegateExecution_with_emptyFormUrl() throws IOException {
        DelegateExecution delegateExecution = mock(DelegateExecution.class);
        Map<String, Object> variables = new HashMap<>();
        when(delegateExecution.getVariables())
                .thenReturn(variables);
        Logger LOGGER = mock(Logger.class);
        ReflectionTestUtils.setField(bpmFormDataPipelineListener, "LOGGER", LOGGER);
        bpmFormDataPipelineListener.notify(delegateExecution);
        ArgumentCaptor<String> captor = ArgumentCaptor.forClass(String.class);
        verify(LOGGER).log(any(Level.class), captor.capture());
        assertEquals("Unable to read submission for null", captor.getValue());
    }
    
    /**
     * This test case will evaluate BPMFormDataPipelineListener with a negative case
     * This test case expect the httpserviceinvoker to return internal error
     * Expectation will be to fail the case with Runtimeexception
     * @throws IOException
     */
    @Test
    public void patchFormAttributes_withInput_delegateTask_with_fieldValues() throws IOException {
        DelegateTask delegateTask = mock(DelegateTask.class);
        DelegateExecution delegateExecution = mock(DelegateExecution.class);
        when(delegateTask.getExecution())
                .thenReturn(delegateExecution);
        String formUrl = "http://localhost:3001/form/id1";
        Map<String, Object> variables = new HashMap<>();
        variables.put(FORM_URL, formUrl);
        when(delegateExecution.getVariables())
                .thenReturn(variables);
        when(httpServiceInvoker.execute(anyString(), any(HttpMethod.class), any(List.class)))
                .thenReturn(new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR));
        String payload = "[\"applicationStatus\",\"applicationId\"]";
        ReflectionTestUtils.setField(bpmFormDataPipelineListener, "fields", this.fields);
        when(this.fields.getValue(delegateExecution))
                .thenReturn(payload);
        when(delegateExecution.getVariable(APPLICATION_STATUS))
                .thenReturn("New");
        when(delegateExecution.getVariable(APPLICATION_ID))
                .thenReturn(1);
        assertThrows(RuntimeException.class, () -> {
            bpmFormDataPipelineListener.notify(delegateTask);
        });
    }

    /**
     * This test case will evaluate BPMFormDataPipelineListener with a negative case
     * This test case expect the httpserviceinvoker to return internal error
     * Expectation will be to fail the case with Runtimeexception
     * @throws IOException
     */
    @Test
    public void patchFormAttributes_withInput_delegateTask_with_emptyFieldValues() throws IOException {
        DelegateTask delegateTask = mock(DelegateTask.class);
        DelegateExecution delegateExecution = mock(DelegateExecution.class);
        when(delegateTask.getExecution())
                .thenReturn(delegateExecution);
        String formUrl = "http://localhost:3001/form/id1";
        Map<String, Object> variables = new HashMap<>();
        variables.put(FORM_URL, formUrl);
        when(delegateExecution.getVariables())
                .thenReturn(variables);
        when(httpServiceInvoker.execute(anyString(), any(HttpMethod.class), any(List.class)))
                .thenReturn(new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR));
        String payload = "[]";
        ReflectionTestUtils.setField(bpmFormDataPipelineListener, "fields", this.fields);
        when(this.fields.getValue(delegateExecution))
                .thenReturn(payload);
        when(delegateExecution.getVariable(APPLICATION_STATUS))
                .thenReturn("New");
        when(delegateExecution.getVariable(APPLICATION_ID))
                .thenReturn(1);
        assertThrows(RuntimeException.class, () -> {
            bpmFormDataPipelineListener.notify(delegateTask);
        });
    }

    /**
     * This test case will evaluate BPMFormDataPipelineListener with a positive case
     * @throws IOException
     */
    @Test
    public void patchFormAttributes_withInput_delegateTask_with_ioException() throws IOException {
        DelegateTask delegateTask = mock(DelegateTask.class);
        DelegateExecution delegateExecution = mock(DelegateExecution.class);
        when(delegateTask.getExecution())
                .thenReturn(delegateExecution);
        String formUrl = "http://localhost:3001/form/id1";
        Map<String, Object> variables = new HashMap<>();
        variables.put(FORM_URL, formUrl);
        when(delegateExecution.getVariables())
                .thenReturn(variables);
        doThrow(new IOException("Test Failure")).when(httpServiceInvoker)
                .execute(anyString(), any(HttpMethod.class), any(List.class));
        String payload = "[]";
        ReflectionTestUtils.setField(bpmFormDataPipelineListener, "fields", this.fields);
        when(this.fields.getValue(delegateExecution))
                .thenReturn(payload);
        when(delegateExecution.getVariable(APPLICATION_STATUS))
                .thenReturn("New");
        when(delegateExecution.getVariable(APPLICATION_ID))
                .thenReturn(1);
        assertThrows(RuntimeException.class, () -> {
            bpmFormDataPipelineListener.notify(delegateTask);
        });
    }

    /**
     * This test case will validate the behaviour with empty form Url
     */
    @Test
    public void patchFormAttributes_withInput_delegateTask_with_emptyFormUrl(){
        DelegateTask delegateTask = mock(DelegateTask.class);
        DelegateExecution delegateExecution = mock(DelegateExecution.class);
        when(delegateTask.getExecution())
                .thenReturn(delegateExecution);
        Map<String, Object> variables = new HashMap<>();
        when(delegateExecution.getVariables())
                .thenReturn(variables);
        Logger LOGGER = mock(Logger.class);
        ReflectionTestUtils.setField(bpmFormDataPipelineListener, "LOGGER", LOGGER);
        bpmFormDataPipelineListener.notify(delegateTask);
        ArgumentCaptor<String> captor = ArgumentCaptor.forClass(String.class);
        verify(LOGGER).log(any(Level.class), captor.capture());
        assertEquals("Unable to read submission for null", captor.getValue());
    }
}
