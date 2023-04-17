package org.camunda.bpm.extension.hooks.listeners;

import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.DelegateTask;
import org.camunda.bpm.extension.commons.connector.HTTPServiceInvoker;
import org.camunda.bpm.extension.hooks.listeners.data.RequestStateData;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.io.IOException;
import java.util.Collections;
import java.util.Properties;

import static org.camunda.bpm.extension.commons.utils.VariableConstants.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.mockito.Mockito.when;

/**
 * Request State Test.
 * Test class for RequestStateListener
 */

@ExtendWith(SpringExtension.class)
public class RequestStateListenerTest {

    @InjectMocks
    private RequestStateListener requestStateListener;

    @Mock
    private HTTPServiceInvoker httpServiceInvoker;

    @Mock
    private Authentication auth;


    /**
     * RequestStateListener will be invoked with DelegateExecution parameter
     * and success
     */
    @Test
    public void invokeRequestService_with_delegateExecution_with_success() throws IOException {
        DelegateExecution delegateExecution = mock(DelegateExecution.class);
        String formUrl = "http://localhost:3001/form/id1";
        String apiUrl = "http://localhost:5000";
        String requestStatus = "Pending";
        String requestType = "Mock";
        String submittedBy = "test-user";
        Properties properties = mock(Properties.class);
        when(httpServiceInvoker.getProperties())
                .thenReturn(properties);
        when(properties.getProperty("api.url"))
                .thenReturn(apiUrl);
        when(delegateExecution.getVariable(FORM_URL)).thenReturn(formUrl);
        when(delegateExecution.getVariable(REQUEST_STATUS)).thenReturn(requestStatus);
        when(delegateExecution.getVariable(REQUEST_TYPE)).thenReturn(requestType);
        when(delegateExecution.getVariable(APPLICATION_ID)).thenReturn("id1");
        SecurityContextHolder.getContext().setAuthentication(auth);
        Jwt jwt = Jwt.withTokenValue("01298978")
                .header("type", "JWT")
                .claim("preferred_username", "test-user")
                .claim("groups", Collections.singletonList("user"))
                .claim("scope", "user openid profile")
                .build();

        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
        JwtAuthenticationToken jwtAuthenticationToken = (JwtAuthenticationToken) jwtAuthenticationConverter.convert(jwt);
        ResponseEntity<String> responseEntity = new ResponseEntity<>(HttpStatus.CREATED);
        when(httpServiceInvoker.execute(any(), any(HttpMethod.class), any(RequestStateData.class)))
                .thenReturn(responseEntity);
        requestStateListener.notify(delegateExecution);
        assertEquals(submittedBy, jwtAuthenticationToken.getToken().getClaimAsString("preferred_username"));
    }


    /**
     * Request State Listener will be invoked with DelegateExecution parameter
     * and expecting a status code as 500
     */
    @Test
    public void invokeRequestService_with_delegateExecution_with_statusCode500() throws IOException {
        DelegateExecution delegateExecution = mock(DelegateExecution.class);
        String formUrl = "http://localhost:3001/form/id1";
        String apiUrl = "http://localhost:5000";
        String requestStatus = "Pending";
        String requestType = "Mock";
        String submittedBy = "test-user";
        Properties properties = mock(Properties.class);
        when(httpServiceInvoker.getProperties())
                .thenReturn(properties);
        when(properties.getProperty("api.url"))
                .thenReturn(apiUrl);
        when(delegateExecution.getVariable(FORM_URL)).thenReturn(formUrl);
        when(delegateExecution.getVariable(REQUEST_STATUS)).thenReturn(requestStatus);
        when(delegateExecution.getVariable(REQUEST_TYPE)).thenReturn(requestType);
        when(delegateExecution.getVariable(APPLICATION_ID)).thenReturn("id1");
        when(delegateExecution.getVariable("submittedBy")).thenReturn(submittedBy);
        ResponseEntity<String> responseEntity = new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        when(httpServiceInvoker.execute(any(), any(HttpMethod.class), any(RequestStateData.class)))
                .thenReturn(responseEntity);
        assertThrows(RuntimeException.class, () -> {
            requestStateListener.notify(delegateExecution);
        });
    }

    /**
     * Request State Listener will be invoked with DelegateExecution parameter
     * and expecting IOException
     */
    @Test
    public void invokeRequestService_with_delegateExecution_with_ioException() throws IOException {
        DelegateExecution delegateExecution = mock(DelegateExecution.class);
        String formUrl = "http://localhost:3001/form/id1";
        String apiUrl = "http://localhost:5000";
        String requestStatus = "Pending";
        String requestType = "Mock";
        String submittedBy = "test-user";
        Properties properties = mock(Properties.class);
        when(httpServiceInvoker.getProperties())
                .thenReturn(properties);
        when(properties.getProperty("api.url"))
                .thenReturn(apiUrl);
        when(delegateExecution.getVariable(FORM_URL)).thenReturn(formUrl);
        when(delegateExecution.getVariable(REQUEST_STATUS)).thenReturn(requestStatus);
        when(delegateExecution.getVariable(REQUEST_TYPE)).thenReturn(requestType);
        when(delegateExecution.getVariable(APPLICATION_ID)).thenReturn("id1");
        when(delegateExecution.getVariable("submittedBy")).thenReturn(submittedBy);
        doThrow(new IOException("Unable to read submission for: " + formUrl)).
                when(httpServiceInvoker).execute(any(), any(HttpMethod.class), any(RequestStateData.class));
        assertThrows(RuntimeException.class, () -> {
            requestStateListener.notify(delegateExecution);
        });
    }

    /**
     * Request State Listener will be invoked with DelegateTask parameter and
     * success
     */
    @Test
    public void invokeRequestService_with_delegateTask_with_success() throws IOException {
        DelegateTask delegateTask = mock(DelegateTask.class);
        DelegateExecution delegateExecution = mock(DelegateExecution.class);
        String formUrl = "http://localhost:3001/form/id1";
        String apiUrl = "http://localhost:5000";
        String requestStatus = "Pending";
        String requestType = "Mock";
        String submittedBy = "test-user";
        when(delegateTask.getExecution())
                .thenReturn(delegateExecution);
        Properties properties = mock(Properties.class);
        when(httpServiceInvoker.getProperties())
                .thenReturn(properties);
        when(properties.getProperty("api.url"))
                .thenReturn(apiUrl);
        when(delegateExecution.getVariable(FORM_URL)).thenReturn(formUrl);
        when(delegateExecution.getVariable(REQUEST_STATUS)).thenReturn(requestStatus);
        when(delegateExecution.getVariable(REQUEST_TYPE)).thenReturn(requestType);
        when(delegateExecution.getVariable(APPLICATION_ID)).thenReturn("id1");
        SecurityContextHolder.getContext().setAuthentication(auth);
        Jwt jwt = Jwt.withTokenValue("72378")
                .header("type", "JWT")
                .claim("preferred_username", "test-user")
                .claim("groups", Collections.singletonList("user"))
                .claim("scope", "user openid profile")
                .build();

        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
        JwtAuthenticationToken jwtAuthenticationToken = (JwtAuthenticationToken) jwtAuthenticationConverter.convert(jwt);
        ResponseEntity<String> responseEntity = new ResponseEntity<>(HttpStatus.CREATED);
        when(httpServiceInvoker.execute(any(), any(HttpMethod.class), any(RequestStateData.class)))
                .thenReturn(responseEntity);
        requestStateListener.notify(delegateTask);
        assertEquals(submittedBy, jwtAuthenticationToken.getToken().getClaimAsString("preferred_username"));
    }

    /**
     * Request State Listener will be invoked with DelegateTask parameter and
     * expecting a status code as 500
     */
    @Test
    public void invokeRequestService_with_delegateTask_with_statusCode500() throws IOException {
        DelegateTask delegateTask = mock(DelegateTask.class);
        DelegateExecution delegateExecution = mock(DelegateExecution.class);
        String formUrl = "http://localhost:3001/form/id1";
        String apiUrl = "http://localhost:5000";
        String requestStatus = "Pending";
        String requestType = "Mock";
        String submittedBy = "test-user";
        when(delegateTask.getExecution())
                .thenReturn(delegateExecution);
        Properties properties = mock(Properties.class);
        when(httpServiceInvoker.getProperties())
                .thenReturn(properties);
        when(properties.getProperty("api.url"))
                .thenReturn(apiUrl);
        when(delegateExecution.getVariable(FORM_URL)).thenReturn(formUrl);
        when(delegateExecution.getVariable(REQUEST_STATUS)).thenReturn(requestStatus);
        when(delegateExecution.getVariable(REQUEST_TYPE)).thenReturn(requestType);
        when(delegateExecution.getVariable(APPLICATION_ID)).thenReturn("id1");
        when(delegateExecution.getVariable("submittedBy")).thenReturn(submittedBy);
        ResponseEntity<String> responseEntity = new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        when(httpServiceInvoker.execute(any(), any(HttpMethod.class), any(RequestStateData.class)))
                .thenReturn(responseEntity);
        assertThrows(RuntimeException.class, () -> {
            requestStateListener.notify(delegateTask);
        });
    }

    /**
     * Request State Listener will be invoked with DelegateTask parameter and
     * expecting IOException
     */
    @Test
    public void invokeRequestService_with_delegateTask_with_ioException() throws IOException {
        DelegateTask delegateTask = mock(DelegateTask.class);
        DelegateExecution delegateExecution = mock(DelegateExecution.class);
        String formUrl = "http://localhost:3001/form/id1";
        String apiUrl = "http://localhost:5000";
        String requestStatus = "Pending";
        String requestType = "Mock";
        String submittedBy = "test-user";
        when(delegateTask.getExecution())
                .thenReturn(delegateExecution);
        Properties properties = mock(Properties.class);
        when(httpServiceInvoker.getProperties())
                .thenReturn(properties);
        when(properties.getProperty("api.url"))
                .thenReturn(apiUrl);
        when(delegateExecution.getVariable(FORM_URL)).thenReturn(formUrl);
        when(delegateExecution.getVariable(REQUEST_STATUS)).thenReturn(requestStatus);
        when(delegateExecution.getVariable(REQUEST_TYPE)).thenReturn(requestType);
        when(delegateExecution.getVariable(APPLICATION_ID)).thenReturn("id1");
        when(delegateExecution.getVariable("submittedBy")).thenReturn(submittedBy);
        ResponseEntity<String> responseEntity = new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        doThrow(new IOException("Unable to read submission for: " + formUrl)).
                when(httpServiceInvoker).execute(any(), any(HttpMethod.class), any(RequestStateData.class));
        assertThrows(RuntimeException.class, () -> {
            requestStateListener.notify(delegateTask);
        });
    }
}
