package org.camunda.bpm.extension.commons.connector.support;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(SpringExtension.class)
public class AbstractAccessHandlerTest {



    @Test
    public void testGetUserBasedAccessToken() {
        final String token = "token";
        IAccessHandler iAccessHandler = mock(IAccessHandler.class);
        AbstractAccessHandler abstractAccessHandler = mock(AbstractAccessHandler.class);
        SecurityContextHolder securityContextHolder = mock(SecurityContextHolder.class);
        JwtAuthenticationToken jwtAuthenticationToken = mock(JwtAuthenticationToken.class);
        when(securityContextHolder.getContext().getAuthentication()).thenReturn(jwtAuthenticationToken);
        when(jwtAuthenticationToken.getToken().getTokenValue()).thenReturn(token);
        String userBasedAccessToken = abstractAccessHandler.getUserBasedAccessToken();
        assertEquals(userBasedAccessToken, token);
    }
}
