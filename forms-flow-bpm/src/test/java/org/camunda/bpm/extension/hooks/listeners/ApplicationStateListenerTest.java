package org.camunda.bpm.extension.hooks.listeners;

import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.DelegateTask;
import org.camunda.bpm.extension.commons.connector.HTTPServiceInvoker;
import org.camunda.bpm.extension.hooks.listeners.data.Application;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.io.IOException;
import java.util.Properties;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Test class for ApplicationStateListener
 */
@ExtendWith(SpringExtension.class)
public class ApplicationStateListenerTest {

    @InjectMocks
    private ApplicationStateListener applicationStateListener;

    @Mock
    private HTTPServiceInvoker httpServiceInvoker;

    @Mock
    private ApplicationAuditListener applicationAuditListener;
    
    /**
     * This test case perform a positive test over notify method in ApplicationStateListener
     * @throws IOException
     */
    @Test
    public void invokeApplicationService_with_delegateExecution_with_success() throws IOException {
        DelegateExecution delegateExecution = mock(DelegateExecution.class);
        String formUrl = "http://localhost:3001/form/id1";
        String apiUrl = "http://localhost:5000";
        String applicationStatus = "Success";
        Properties properties = mock(Properties.class);
        when(httpServiceInvoker.getProperties())
                .thenReturn(properties);
        when(properties.getProperty("api.url"))
                .thenReturn(apiUrl);
        when(delegateExecution.getVariable("formUrl")).thenReturn(formUrl);
        when(delegateExecution.getVariable("applicationStatus")).thenReturn(applicationStatus);
        when(delegateExecution.getVariable("applicationId")).thenReturn("id1");
        ResponseEntity<String> responseEntity = new ResponseEntity<>(HttpStatus.OK);
        when(httpServiceInvoker.execute(any(), any(HttpMethod.class), any(Application.class)))
                .thenReturn(responseEntity);
        doNothing().when(applicationAuditListener)
                .invokeApplicationAuditService(delegateExecution);
        applicationStateListener.notify(delegateExecution);
    }
    
    /**
     * This test case will evaluate ApplicationStateListener with a negative case
     * This test case expect the httpserviceinvoker to return internal error
     * Expectation will be to fail the case with Runtime Exception
     * @throws IOException
     */
    @Test
    public void invokeApplicationService_with_delegateExecution_with_statusCode500() throws IOException {
        DelegateExecution delegateExecution = mock(DelegateExecution.class);
        String formUrl = "http://localhost:3001/form/id1";
        String apiUrl = "http://localhost:5000";
        String applicationStatus = "Success";
        Properties properties = mock(Properties.class);
        when(httpServiceInvoker.getProperties())
                .thenReturn(properties);
        when(properties.getProperty("api.url"))
                .thenReturn(apiUrl);
        when(delegateExecution.getVariable("formUrl")).thenReturn(formUrl);
        when(delegateExecution.getVariable("applicationStatus")).thenReturn(applicationStatus);
        when(delegateExecution.getVariable("applicationId")).thenReturn("id1");
        ResponseEntity<String> responseEntity = new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        when(httpServiceInvoker.execute(any(), any(HttpMethod.class), any(Application.class)))
                .thenReturn(responseEntity);
        assertThrows(RuntimeException.class, () -> {
            applicationStateListener.notify(delegateExecution);
        });
    }
    
    /**
     * This test case will evaluate ApplicationStateListener with a negative case
     * This test case expect the formUrl to fail with ioexception 
     * Expectation will be to fail the case with Runtime Exception
     * @throws IOException
     */
    @Test
    public void invokeApplicationService_with_delegateExecution_with_ioException() throws IOException {
        DelegateExecution delegateExecution = mock(DelegateExecution.class);
        String formUrl = "http://localhost:3001/form/id1";
        String apiUrl = "http://localhost:5000";
        String applicationStatus = "Success";
        Properties properties = mock(Properties.class);
        when(httpServiceInvoker.getProperties())
                .thenReturn(properties);
        when(properties.getProperty("api.url"))
                .thenReturn(apiUrl);
        when(delegateExecution.getVariable("formUrl")).thenReturn(formUrl);
        when(delegateExecution.getVariable("applicationStatus")).thenReturn(applicationStatus);
        when(delegateExecution.getVariable("applicationId")).thenReturn("id1");
        doThrow(new IOException("Unable to read submission for: " +formUrl)).
                when(httpServiceInvoker).execute(any(), any(HttpMethod.class), any(Application.class));
        assertThrows(RuntimeException.class, () -> {
            applicationStateListener.notify(delegateExecution);
        });
    }

    /**
     * This test case will evaluate ApplicationStateListener with a positive case
     * @throws IOException
     */
    @Test
    public void invokeApplicationService_with_delegateTask_with_success() throws IOException {
        DelegateTask delegateTask = mock(DelegateTask.class);
        DelegateExecution delegateExecution = mock(DelegateExecution.class);
        String formUrl = "http://localhost:3001/form/id1";
        String apiUrl = "http://localhost:5000";
        String applicationStatus = "Success";
        when(delegateTask.getExecution())
                .thenReturn(delegateExecution);
        Properties properties = mock(Properties.class);
        when(httpServiceInvoker.getProperties())
                .thenReturn(properties);
        when(properties.getProperty("api.url"))
                .thenReturn(apiUrl);
        when(delegateExecution.getVariable("formUrl")).thenReturn(formUrl);
        when(delegateExecution.getVariable("applicationStatus")).thenReturn(applicationStatus);
        when(delegateExecution.getVariable("applicationId")).thenReturn("id1");
        ResponseEntity<String> responseEntity = new ResponseEntity<>(HttpStatus.OK);
        when(httpServiceInvoker.execute(any(), any(HttpMethod.class), any(Application.class)))
                .thenReturn(responseEntity);
        doNothing().when(applicationAuditListener)
                .invokeApplicationAuditService(delegateExecution);
        applicationStateListener.notify(delegateTask);
    }

    /**
     * This test case will evaluate ApplicationStateListener with a negative case
     * This test case expect the httpserviceinvoker to return internal error
     * Expectation will be to fail the case with Runtime Exception
     * @throws IOException
     */
    @Test
    public void invokeApplicationService_with_delegateTask_with_statusCode500() throws IOException {
        DelegateTask delegateTask = mock(DelegateTask.class);
        DelegateExecution delegateExecution = mock(DelegateExecution.class);
        String formUrl = "http://localhost:3001/form/id1";
        String apiUrl = "http://localhost:5000";
        String applicationStatus = "Success";
        when(delegateTask.getExecution())
                .thenReturn(delegateExecution);
        Properties properties = mock(Properties.class);
        when(httpServiceInvoker.getProperties())
                .thenReturn(properties);
        when(properties.getProperty("api.url"))
                .thenReturn(apiUrl);
        when(delegateExecution.getVariable("formUrl")).thenReturn(formUrl);
        when(delegateExecution.getVariable("applicationStatus")).thenReturn(applicationStatus);
        when(delegateExecution.getVariable("applicationId")).thenReturn("id1");
        ResponseEntity<String> responseEntity = new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        when(httpServiceInvoker.execute(any(), any(HttpMethod.class), any(Application.class)))
                .thenReturn(responseEntity);
        assertThrows(RuntimeException.class, () -> {
            applicationStateListener.notify(delegateTask);
        });
    }
    
    /**
     * This test case will evaluate ApplicationStateListener with a negative case
     * This test case expect the formUrl to fail with ioexception 
     * Expectation will be to fail the case with Runtime Exception
     * @throws IOException
     */
    @Test
    public void invokeApplicationService_with_delegateTask_with_ioException() throws IOException {
        DelegateTask delegateTask = mock(DelegateTask.class);
        DelegateExecution delegateExecution = mock(DelegateExecution.class);
        String formUrl = "http://localhost:3001/form/id1";
        String apiUrl = "http://localhost:5000";
        String applicationStatus = "Success";
        when(delegateTask.getExecution())
                .thenReturn(delegateExecution);
        Properties properties = mock(Properties.class);
        when(httpServiceInvoker.getProperties())
                .thenReturn(properties);
        when(properties.getProperty("api.url"))
                .thenReturn(apiUrl);
        when(delegateExecution.getVariable("formUrl")).thenReturn(formUrl);
        when(delegateExecution.getVariable("applicationStatus")).thenReturn(applicationStatus);
        when(delegateExecution.getVariable("applicationId")).thenReturn("id1");
        ResponseEntity<String> responseEntity = new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        doThrow(new IOException("Unable to read submission for: " +formUrl)).
                when(httpServiceInvoker).execute(any(), any(HttpMethod.class), any(Application.class));
        assertThrows(RuntimeException.class, () -> {
            applicationStateListener.notify(delegateTask);
        });
    }
}
