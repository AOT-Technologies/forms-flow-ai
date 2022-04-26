package org.camunda.bpm.extension.commons.connector.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.Assert;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.http.MediaType;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.lang.reflect.Field;
import java.util.function.Function;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * author : Shibin Thomas
 */
@ExtendWith(SpringExtension.class)
public class FormioContextProviderTest {

    @InjectMocks
    private FormioContextProvider formioContextProvider;

    @Mock
    private WebClient webClient;

    @Mock
    private FormioConfiguration formioConfiguration;

    @BeforeEach
    public void setup() {
        try {
            Field field = formioContextProvider.getClass().getDeclaredField("bpmObjectMapper");
            field.setAccessible(true);
        } catch (NoSuchFieldException e) {
            e.printStackTrace();
        }
        ObjectMapper objectMapper = new ObjectMapper();
        ReflectionTestUtils.setField(this.formioContextProvider, "bpmObjectMapper", objectMapper);
    }

    @Test
    public void test_access_token_gen_when_null_context(){
        when(formioConfiguration.getUserName())
                .thenReturn("admin@example.com");
        when(formioConfiguration.getPassword())
                .thenReturn("changeme");
        when(formioConfiguration.getAccessTokenUri())
                .thenReturn("http://localhost:3001");
        WebClient.RequestBodyUriSpec requestBodyUriSpec = mock(WebClient.RequestBodyUriSpec.class);
        WebClient.RequestHeadersSpec requestHeadersSpec = mock(WebClient.RequestHeadersSpec.class);
        //WebClient.UriSpec uriSpec = mock(WebClient.UriSpec.class);
        Mono mono = mock(Mono.class);
        when(webClient.post())
                .thenReturn(requestBodyUriSpec);
        when(requestBodyUriSpec.uri(anyString(), any(Object[].class)))
                .thenReturn(requestBodyUriSpec);
        when(requestBodyUriSpec.bodyValue(any(Object.class)))
                .thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.accept(any(MediaType.class)))
                .thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.header(anyString(), anyString()))
                .thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.exchangeToMono(any(Function.class)))
                .thenReturn(mono);

        String expected = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Il9pZCI6IjYyNGJlMGI2YTQzMWUxOTY0MmEzYzRiZSJ9LCJmb3JtIjp7Il9pZCI6IjYyNGJlMGIxYTQzMWUxOTY0MmEzYzQ0MiJ9LCJpYXQiOjE2NDkxMzk5NjAsImV4cCI6MTY0OTE2NTcxOTA4NX0.KtR1e4y3jaRHuOYBUmr9VBxsQweIrAJtdjEWsKXKrG0";
        when(mono.block())
                .thenReturn(expected);
        String actual = formioContextProvider.createFormioRequestAccessToken();
        Assert.assertEquals(expected, actual);
    }

    @Test
    public void test_access_token_gen_when_context_with_valid_token(){

    }

    @Test
    public void test_access_token_gen_when_context_with_outdated_token(){

    }

    @Test
    public void test_access_token_gen_when_401(){

    }
}
