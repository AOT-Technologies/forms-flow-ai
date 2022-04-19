package org.camunda.bpm.extension.hooks.controllers;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import net.minidev.json.JSONArray;
import org.camunda.bpm.engine.AuthorizationService;
import org.camunda.bpm.engine.ProcessEngines;
import org.camunda.bpm.engine.authorization.AuthorizationQuery;
import org.camunda.bpm.engine.authorization.ProcessDefinitionPermissions;
import org.camunda.bpm.engine.impl.ProcessEngineImpl;
import org.camunda.bpm.extension.commons.connector.HTTPServiceInvoker;
import org.camunda.bpm.extension.hooks.controllers.stubs.AuthorizationStub;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import javax.servlet.ServletException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Test class for AdminController
 */
@ExtendWith(SpringExtension.class)
public class AdminControllerTest {

    @InjectMocks
    private AdminController adminController;

    private MockMvc mockMvc;

    @Mock
    private Authentication auth;

    @Mock
    private HTTPServiceInvoker httpServiceInvoker;


    @BeforeEach
    public void setup() {
        mockMvc = MockMvcBuilders.standaloneSetup(adminController).build();
        SecurityContextHolder.getContext().setAuthentication(auth);

        Map<String, Object> claims = new HashMap<>();
        JSONArray groups = new JSONArray();
        groups.add("camunda-admin");
        groups.add("/formsflow/formsflow-reviewer");
        claims.put("groups", groups);

        OidcUser oidcUser = mock(OidcUser.class);
        when(auth.getPrincipal())
                .thenReturn(oidcUser);

        when(oidcUser.getClaims())
                .thenReturn(claims);

        List<org.camunda.bpm.engine.authorization.Authorization> authorizationList = new ArrayList<>();
        authorizationList.add(new AuthorizationStub("test-id-1", "test-id-1", "224233456456"));
        authorizationList.add(new AuthorizationStub("test-id-1", "test-id-1", "224233456456"));


        ProcessEngineImpl processEngine = mock(ProcessEngineImpl.class);
        when(processEngine.getName()).thenReturn("default");
        AuthorizationService authorizationService = mock(AuthorizationService.class);
        AuthorizationQuery authorizationQuery = mock(AuthorizationQuery.class);
        when(processEngine.getAuthorizationService())
                .thenReturn(authorizationService);
        when(authorizationService.createAuthorizationQuery())
                .thenReturn(authorizationQuery);
        when(authorizationQuery.resourceType(anyInt()))
                .thenReturn(authorizationQuery);
        when(authorizationQuery.hasPermission(any(ProcessDefinitionPermissions.class)))
                .thenReturn(authorizationQuery);
        when(authorizationQuery.groupIdIn(any(String.class)))
                .thenReturn(authorizationQuery);
        when(authorizationQuery.list())
                .thenReturn(authorizationList);
        ProcessEngines.init();
        ProcessEngines.registerProcessEngine(processEngine);
    }

    /**
     * This test case perform a positive test over getForms with admin group name
     * Expect Status OK and content
     */
    @Test
    public void getFormsSuccess_with_adminGroupName() throws Exception {
        final String adminGroupName = "camunda-admin";
        ReflectionTestUtils.setField(adminController, "adminGroupName", adminGroupName);
        when(httpServiceInvoker.execute(any(), any(HttpMethod.class), any()))
                .thenReturn(ResponseEntity.ok("{\"totalCount\":\"2\",\"forms\":[" +
                        "{\"formId\":\"foi\",\"formName\":\"Freedom Of Information\",\"processKey\":\"224233456456\"}," +
                        "{\"formId\":\"nbl\",\"formName\":\"New Business Licence\",\"processKey\":\"456456456\"}]}"));
        mockMvc.perform(
                MockMvcRequestBuilders.get("/engine-rest-ext/form"))
                .andExpect(status().isOk())
                .andExpect(content().string("[{\"formId\":\"foi\",\"formName\":\"Freedom Of Information\",\"processKey\":\"224233456456\"},{\"formId\":\"nbl\",\"formName\":\"New Business Licence\",\"processKey\":\"456456456\"}]"));
    }

    /**
     * This test case perform a positive test over getForms without admin group name
     * Expect Status OK and content
     */
    @Test
    public void getFormsSuccess_without_adminGroupName() throws Exception {
        when(httpServiceInvoker.execute(any(), any(HttpMethod.class), any()))
                .thenReturn(ResponseEntity.ok("{\"totalCount\":\"2\",\"forms\":[" +
                        "{\"formId\":\"foi\",\"formName\":\"Freedom Of Information\",\"processKey\":\"224233456456\"}," +
                        "{\"formId\":\"nbl\",\"formName\":\"New Business Licence\",\"processKey\":\"456456456\"}]}"));
        mockMvc.perform(
                MockMvcRequestBuilders.get("/engine-rest-ext/form"))
                .andExpect(status().isOk())
                .andExpect(content().string("[{\"formId\":\"foi\",\"formName\":\"Freedom Of Information\",\"processKey\":\"224233456456\"}]"));
    }

    /**
     * Expect Status OK and empty content
     */
    @Test
    public void getFormsFailure() throws Exception {
        when(httpServiceInvoker.execute(any(), any(HttpMethod.class), any()))
                .thenReturn(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(""));
        String message = mockMvc.perform(
                MockMvcRequestBuilders.get("/engine-rest-ext/form"))
                .andExpect(content().string(""))
                .andExpect(status().isInternalServerError())
                .andReturn().getResolvedException().getMessage();
        assertEquals("Error while processing form data", message);
    }

    /*
     * Expect JSON parse exception
     */
    @Test
    public void getForms_with_parseException() throws Exception {
        when(httpServiceInvoker.execute(any(), any(HttpMethod.class), any()))
                .thenReturn(ResponseEntity.ok("{\"totalCount\":\"2\",\"forms\":[" +
                        "{:\"foi\",[]," +
                        "{\"formId\":\"nbl\",\"formName\":\"New Business Licence\",\"processKey\":\"456456456\"}]}"));
        String message = mockMvc.perform(
                MockMvcRequestBuilders.get("/engine-rest-ext/form"))
                .andExpect(content().string(""))
                .andExpect(status().isInternalServerError())
                .andReturn().getResolvedException().getMessage();
        assertEquals("Exception occurred in reading form", message);
    }

    @Test
    public void getFormsAuthorizationSuccess_with_adminGroupName() throws Exception {
        final String adminGroupName = "camunda-admin";
        ReflectionTestUtils.setField(adminController, "adminGroupName", adminGroupName);
        mockMvc.perform(
                MockMvcRequestBuilders.get("/engine-rest-ext/form/authorization"))
                .andExpect(status().isOk())
                .andExpect(content().string("{\"adminGroupEnabled\":true,\"authorizationList\":null}"));
    }

    @Test
    public void getFormsAuthorizationSuccess_without_adminGroupName() throws Exception {
        mockMvc.perform(
                MockMvcRequestBuilders.get("/engine-rest-ext/form/authorization"))
                .andExpect(status().isOk())
                .andExpect(content().string("{\"adminGroupEnabled\":false,\"authorizationList\":" +
                        "[{\"groupId\":\"test-id-1\",\"userId\":\"test-id-1\",\"resourceId\":\"224233456456\"}]}"));
    }

    /*
     * Expect JSON parse exception
     */
    @Test
    public void getForms_with_servletException() throws Exception {

        AnonymousAuthenticationToken anonymousAuthenticationToken = mock(AnonymousAuthenticationToken.class);
        when(auth.getPrincipal())
                .thenReturn(anonymousAuthenticationToken);

        when(httpServiceInvoker.execute(any(), any(HttpMethod.class), any()))
                .thenReturn(ResponseEntity.ok("{\"totalCount\":\"2\",\"forms\":[" +
                        "{:\"foi\",[]," +
                        "{\"formId\":\"nbl\",\"formName\":\"New Business Licence\",\"processKey\":\"456456456\"}]}"));
        assertThrows(ServletException.class,  () -> {
            mockMvc.perform(
                    MockMvcRequestBuilders.get("/engine-rest-ext/form"))
                    .andExpect(content().string(""));
        });
    }

}
