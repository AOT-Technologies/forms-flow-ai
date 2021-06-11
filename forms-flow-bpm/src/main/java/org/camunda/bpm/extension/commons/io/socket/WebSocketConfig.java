package org.camunda.bpm.extension.commons.io.socket;

import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;

import java.util.logging.Logger;

/**
 * This class serves the purpose of exposing socket connection for push notifications to & from camunda.
 *
 * @author sumathi.thirumani@aot-technologies.com
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer  {

    private final Logger LOGGER = Logger.getLogger(WebSocketConfig.class.getName());

    @Value("${websocket.security.origin}")
    private String websocketOrigin;


    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/forms-flow-bpm-socket/**").setAllowedOrigins(getOrigins())
                .withSockJS();
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
