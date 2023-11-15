package org.camunda.bpm.extension.hooks.listeners;

import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.DelegateTask;
import org.camunda.bpm.extension.commons.connector.HTTPServiceInvoker;
import org.camunda.bpm.extension.commons.utils.RestAPIBuilderConfigProperties;
import org.camunda.bpm.extension.hooks.listeners.data.ApplicationAudit;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
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

/**
 * Application AuditListener Test.
 * Test class for ApplicationAuditListener
 */
@ExtendWith(SpringExtension.class)
public class ApplicationAuditListenerTest {

    @InjectMocks
    private ApplicationAuditListener applicationAuditListener;

    @Mock
    private HTTPServiceInvoker httpServiceInvoker;

    @Mock
    private Authentication auth;

    @Mock
    private RestAPIBuilderConfigProperties restAPIBuilderConfigProperties;

    /**
     * Application Audit Listener will be invoked with DelegateExecution parameter
     * and success
     */
    @Test
    public void invokeApplicationAuditService_with_delegateExecution_with_success() throws IOException {
        DelegateExecution delegateExecution = mock(DelegateExecution.class);
        String formUrl = "http://localhost:3001/form/id1";
        String apiUrl = "http://localhost:5000";
        String applicationStatus = "Success";
        String submittedBy = "test-user";
        String color = "#0000FF";
        Boolean isResubmit = false;
        Double percentage = 45.5;
        Properties properties = mock(Properties.class);
        when(httpServiceInvoker.getProperties())
                .thenReturn(properties);
        when(properties.getProperty("api.url"))
                .thenReturn(apiUrl);
        when(delegateExecution.getVariable(FORM_URL)).thenReturn(formUrl);
        when(delegateExecution.getVariable(APPLICATION_STATUS)).thenReturn(applicationStatus);
        when(delegateExecution.getVariable(APPLICATION_ID)).thenReturn("id1");
        when(delegateExecution.getVariable(COLOR)).thenReturn(color);
        when(delegateExecution.getVariable(PERCENTAGE)).thenReturn(percentage);
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
        when(httpServiceInvoker.execute(any(), any(HttpMethod.class), any(ApplicationAudit.class)))
                .thenReturn(responseEntity);
        applicationAuditListener.notify(delegateExecution);
        assertEquals(submittedBy, jwtAuthenticationToken.getToken().getClaimAsString("preferred_username"));
    }


    /**
     * Application Audit Listener will be invoked with DelegateExecution parameter
     * and expecting a status code as 500
     */
    @Test
    public void invokeApplicationAuditService_with_delegateExecution_with_statusCode500() throws IOException {
        DelegateExecution delegateExecution = mock(DelegateExecution.class);
        String formUrl = "http://localhost:3001/form/id1";
        String apiUrl = "http://localhost:5000";
        String applicationStatus = "Success";
        String submittedBy = "test-user";
        Properties properties = mock(Properties.class);
        when(httpServiceInvoker.getProperties())
                .thenReturn(properties);
        when(properties.getProperty("api.url"))
                .thenReturn(apiUrl);
        when(delegateExecution.getVariable(FORM_URL)).thenReturn(formUrl);
        when(delegateExecution.getVariable(APPLICATION_STATUS)).thenReturn(applicationStatus);
        when(delegateExecution.getVariable(APPLICATION_ID)).thenReturn("id1");
        when(delegateExecution.getVariable("submittedBy")).thenReturn(submittedBy);
        ResponseEntity<String> responseEntity = new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        when(httpServiceInvoker.execute(any(), any(HttpMethod.class), any(ApplicationAudit.class)))
                .thenReturn(responseEntity);
        assertThrows(RuntimeException.class, () -> {
            applicationAuditListener.notify(delegateExecution);
        });
    }

    /**
     * Application Audit Listener will be invoked with DelegateExecution parameter
     * and expecting IOException
     */
    @Test
    public void invokeApplicationAuditService_with_delegateExecution_with_ioException() throws IOException {
        DelegateExecution delegateExecution = mock(DelegateExecution.class);
        String formUrl = "http://localhost:3001/form/id1";
        String apiUrl = "http://localhost:5000";
        String applicationStatus = "Success";
        String submittedBy = "test-user";
        Properties properties = mock(Properties.class);
        when(httpServiceInvoker.getProperties())
                .thenReturn(properties);
        when(properties.getProperty("api.url"))
                .thenReturn(apiUrl);
        when(delegateExecution.getVariable(FORM_URL)).thenReturn(formUrl);
        when(delegateExecution.getVariable(APPLICATION_STATUS)).thenReturn(applicationStatus);
        when(delegateExecution.getVariable(APPLICATION_ID)).thenReturn("id1");
        when(delegateExecution.getVariable("submittedBy")).thenReturn(submittedBy);
        doThrow(new IOException("Unable to read submission for: " + formUrl)).
                when(httpServiceInvoker).execute(any(), any(HttpMethod.class), any(ApplicationAudit.class));
        assertThrows(RuntimeException.class, () -> {
            applicationAuditListener.notify(delegateExecution);
        });
    }

    /**
     * Application Audit Listener will be invoked with DelegateTask parameter and
     * success
     */
    @Test
    public void invokeApplicationAuditService_with_delegateTask_with_success() throws IOException {
        DelegateTask delegateTask = mock(DelegateTask.class);
        DelegateExecution delegateExecution = mock(DelegateExecution.class);
        String formUrl = "http://localhost:3001/form/id1";
        String apiUrl = "http://localhost:5000";
        String applicationStatus = "Success";
        String submittedBy = "test-user";
        when(delegateTask.getExecution())
                .thenReturn(delegateExecution);
        Properties properties = mock(Properties.class);
        when(httpServiceInvoker.getProperties())
                .thenReturn(properties);
        when(properties.getProperty("api.url"))
                .thenReturn(apiUrl);
        when(delegateExecution.getVariable(FORM_URL)).thenReturn(formUrl);
        when(delegateExecution.getVariable(APPLICATION_STATUS)).thenReturn(applicationStatus);
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
        when(httpServiceInvoker.execute(any(), any(HttpMethod.class), any(ApplicationAudit.class)))
                .thenReturn(responseEntity);
        applicationAuditListener.notify(delegateTask);
        assertEquals(submittedBy, jwtAuthenticationToken.getToken().getClaimAsString("preferred_username"));
    }

    /**
     * Application Audit Listener will be invoked with DelegateTask parameter and
     * expecting a status code as 500
     */
    @Test
    public void invokeApplicationAuditService_with_delegateTask_with_statusCode500() throws IOException {
        DelegateTask delegateTask = mock(DelegateTask.class);
        DelegateExecution delegateExecution = mock(DelegateExecution.class);
        String formUrl = "http://localhost:3001/form/id1";
        String apiUrl = "http://localhost:5000";
        String applicationStatus = "Success";
        String submittedBy = "test-user";
        when(delegateTask.getExecution())
                .thenReturn(delegateExecution);
        Properties properties = mock(Properties.class);
        when(httpServiceInvoker.getProperties())
                .thenReturn(properties);
        when(properties.getProperty("api.url"))
                .thenReturn(apiUrl);
        when(delegateExecution.getVariable(FORM_URL)).thenReturn(formUrl);
        when(delegateExecution.getVariable(APPLICATION_STATUS)).thenReturn(applicationStatus);
        when(delegateExecution.getVariable(APPLICATION_ID)).thenReturn("id1");
        when(delegateExecution.getVariable("submittedBy")).thenReturn(submittedBy);
        ResponseEntity<String> responseEntity = new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        when(httpServiceInvoker.execute(any(), any(HttpMethod.class), any(ApplicationAudit.class)))
                .thenReturn(responseEntity);
        assertThrows(RuntimeException.class, () -> {
            applicationAuditListener.notify(delegateTask);
        });
    }

    /**
     * Application Audit Listener will be invoked with DelegateTask parameter and
     * expecting IOException
     */
    @Test
    public void invokeApplicationAuditService_with_delegateTask_with_ioException() throws IOException {
        DelegateTask delegateTask = mock(DelegateTask.class);
        DelegateExecution delegateExecution = mock(DelegateExecution.class);
        String formUrl = "http://localhost:3001/form/id1";
        String apiUrl = "http://localhost:5000";
        String applicationStatus = "Success";
        String submittedBy = "test-user";
        when(delegateTask.getExecution())
                .thenReturn(delegateExecution);
        Properties properties = mock(Properties.class);
        when(httpServiceInvoker.getProperties())
                .thenReturn(properties);
        when(properties.getProperty("api.url"))
                .thenReturn(apiUrl);
        when(delegateExecution.getVariable(FORM_URL)).thenReturn(formUrl);
        when(delegateExecution.getVariable(APPLICATION_STATUS)).thenReturn(applicationStatus);
        when(delegateExecution.getVariable(APPLICATION_ID)).thenReturn("id1");
        when(delegateExecution.getVariable("submittedBy")).thenReturn(submittedBy);
        ResponseEntity<String> responseEntity = new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        doThrow(new IOException("Unable to read submission for: " + formUrl)).
                when(httpServiceInvoker).execute(any(), any(HttpMethod.class), any(ApplicationAudit.class));
        assertThrows(RuntimeException.class, () -> {
            applicationAuditListener.notify(delegateTask);
        });
    }

    /**
     * Application Audit Listener will be invoked with DelegateExecution parameter,
     * and success for Anonymous-user
     */
    @Test
    public void invokeApplicationAuditService_with_delegateExecution_with_success_anonymous_user() throws IOException {
        DelegateExecution delegateExecution = mock(DelegateExecution.class);
        String formUrl = "http://localhost:3001/form/id1";
        String apiUrl = "http://localhost:5000";
        String applicationStatus = "New";
        String submitterName = "Anonymous-user";
        String submittedBy = "service-account-user";
        Properties properties = mock(Properties.class);
        when(httpServiceInvoker.getProperties())
                .thenReturn(properties);
        when(properties.getProperty("api.url"))
                .thenReturn(apiUrl);
        when(delegateExecution.getVariable(FORM_URL)).thenReturn(formUrl);
        when(delegateExecution.getVariable(APPLICATION_STATUS)).thenReturn(applicationStatus);
        when(delegateExecution.getVariable(APPLICATION_ID)).thenReturn("id1");
        when(delegateExecution.getVariable(SUBMITTER_NAME)).thenReturn(submitterName);
        assertEquals("Anonymous-user", submitterName);
        assertEquals("New", applicationStatus);
        SecurityContextHolder.getContext().setAuthentication(auth);
        Jwt jwt = Jwt.withTokenValue("72378")
                .header("type", "JWT")
                .claim("preferred_username", "service-account-user")
                .claim("groups", Collections.singletonList("user"))
                .claim("scope", "user openid profile")
                .build();

        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
        JwtAuthenticationToken jwtAuthenticationToken = (JwtAuthenticationToken) jwtAuthenticationConverter.convert(jwt);
        ResponseEntity<String> responseEntity = new ResponseEntity<>(HttpStatus.CREATED);
        when(httpServiceInvoker.execute(any(), any(HttpMethod.class), any(ApplicationAudit.class)))
                .thenReturn(responseEntity);
        applicationAuditListener.notify(delegateExecution);
        assertEquals(submittedBy, jwtAuthenticationToken.getToken().getClaimAsString("preferred_username"));
    }

    /**
     * Application Audit Listener will be invoked with DelegateTask parameter and
     * success
     */
    @Test
    public void invokeApplicationAuditService_with_delegateTask_with_success_anonymous_user() throws IOException {
        DelegateTask delegateTask = mock(DelegateTask.class);
        DelegateExecution delegateExecution = mock(DelegateExecution.class);
        String formUrl = "http://localhost:3001/form/id1";
        String apiUrl = "http://localhost:5000";
        String applicationStatus = "New";
        String submitterName = "Anonymous-user";
        String submittedBy = "service-account-user";
        when(delegateTask.getExecution())
                .thenReturn(delegateExecution);
        Properties properties = mock(Properties.class);
        when(httpServiceInvoker.getProperties())
                .thenReturn(properties);
        when(properties.getProperty("api.url"))
                .thenReturn(apiUrl);
        when(delegateExecution.getVariable(FORM_URL)).thenReturn(formUrl);
        when(delegateExecution.getVariable(APPLICATION_STATUS)).thenReturn(applicationStatus);
        when(delegateExecution.getVariable(APPLICATION_ID)).thenReturn("id1");
        when(delegateExecution.getVariable(SUBMITTER_NAME)).thenReturn(submitterName);
        assertEquals("Anonymous-user", submitterName);
        assertEquals("New", applicationStatus);
        SecurityContextHolder.getContext().setAuthentication(auth);
        Jwt jwt = Jwt.withTokenValue("72378")
                .header("type", "JWT")
                .claim("preferred_username", "service-account-user")
                .claim("groups", Collections.singletonList("user"))
                .claim("scope", "user openid profile")
                .build();

        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
        JwtAuthenticationToken jwtAuthenticationToken = (JwtAuthenticationToken) jwtAuthenticationConverter.convert(jwt);
        ResponseEntity<String> responseEntity = new ResponseEntity<>(HttpStatus.CREATED);
        when(httpServiceInvoker.execute(any(), any(HttpMethod.class), any(ApplicationAudit.class)))
                .thenReturn(responseEntity);
        applicationAuditListener.notify(delegateTask);
        assertEquals(submittedBy, jwtAuthenticationToken.getToken().getClaimAsString("preferred_username"));
    }
}
