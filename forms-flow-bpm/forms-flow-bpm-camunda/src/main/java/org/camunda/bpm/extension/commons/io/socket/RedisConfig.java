package org.camunda.bpm.extension.commons.io.socket;

import org.camunda.bpm.extension.commons.io.ITaskEvent;
import org.camunda.bpm.extension.commons.io.event.TaskEventTopicListener;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.listener.PatternTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.data.redis.listener.adapter.MessageListenerAdapter;

import java.util.logging.Logger;

/**
 * Configuration for Message Broker.
 */
@Configuration
@ConditionalOnProperty(prefix = "websocket", name= "enableRedis", havingValue = "true", matchIfMissing = false)
public class RedisConfig implements ITaskEvent {

    private final Logger LOGGER = Logger.getLogger(RedisConfig.class.getName());

//    @Autowired
//    private Properties messageBrokerProperties;

    @Value("${websocket.messageBroker.host}")
    private String messageBrokerHost;

    @Value("${websocket.messageBroker.port}")
    private String messageBrokerPort;

    @Value("${websocket.messageBroker.passcode}")
    private String messageBrokerPasscode;

    @Bean
    RedisConnectionFactory redisConnectionFactory() {
        RedisStandaloneConfiguration redisStandaloneConfiguration = new RedisStandaloneConfiguration(messageBrokerHost,Integer.valueOf(messageBrokerPort));
        redisStandaloneConfiguration.setPassword(messageBrokerPasscode);
        return new LettuceConnectionFactory(redisStandaloneConfiguration);
    }

    @Bean
    RedisMessageListenerContainer container(RedisConnectionFactory connectionFactory,
                                            @Qualifier("taskMessageListenerAdapter") MessageListenerAdapter taskMessageListenerAdapter) {
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
            container.setConnectionFactory(connectionFactory);
            container.addMessageListener(taskMessageListenerAdapter, new PatternTopic(getTopicNameForTask()));
        return container;
    }


    @Bean("taskMessageListenerAdapter")
    MessageListenerAdapter chatMessageListenerAdapter(TaskEventTopicListener taskEventTopicListener) {
        return new MessageListenerAdapter(taskEventTopicListener, getExecutorName());
    }

    @Bean
    StringRedisTemplate template(RedisConnectionFactory redisConnectionFactory) {
        return new StringRedisTemplate(redisConnectionFactory);
    }

    private String getExecutorName() { return "receiveTaskMessage";}


}
