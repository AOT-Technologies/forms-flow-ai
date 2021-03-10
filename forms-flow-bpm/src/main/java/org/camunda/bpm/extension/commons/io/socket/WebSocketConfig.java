package org.camunda.bpm.extension.commons.io.socket;

import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * This class serves the purpose of exposing socket connection for push notifications to & from camunda.
 *
 * @author sumathi.thirumani@aot-technologies.com
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Value("${websocket.security.origin}")
    private String websocketOrigin;

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/forms-flow-bpm-socket/**").setAllowedOrigins(getOrigins()).withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic/");
        config.setApplicationDestinationPrefixes("/camunda/forms-flow-bpm-socket");
    }

    private String[] getOrigins() {
        if(StringUtils.isNotBlank(websocketOrigin)) {
            return websocketOrigin.split(",");
        }
        return new String[]{"*"};
    }

}
