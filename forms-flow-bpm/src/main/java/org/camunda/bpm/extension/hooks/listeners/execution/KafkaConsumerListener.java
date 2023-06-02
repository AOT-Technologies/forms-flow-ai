package org.camunda.bpm.extension.hooks.listeners.execution;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import javax.inject.Named;

import org.apache.commons.lang3.StringUtils;
import org.camunda.bpm.engine.RuntimeService;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.ExecutionListener;
import org.camunda.bpm.engine.delegate.Expression;
import org.camunda.bpm.extension.hooks.listeners.BaseListener;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Named("KafkaConsumerListener")
public class KafkaConsumerListener extends BaseListener implements ExecutionListener {

	private static final Logger LOGGER = LoggerFactory.getLogger(KafkaConsumerListener.class);

	@Autowired
	private RuntimeService runtimeService;

	private Expression bootstrap_servers_config;
	private Expression topic_name;

	private List<FormsflowKafkaConsumer> kafkaConsumers = new ArrayList<FormsflowKafkaConsumer>();

	@Override
	public void notify(DelegateExecution execution) {
		try {
			String bootstrapServersConfig = getValue(this.bootstrap_servers_config, execution);
			String topicName = getValue(this.topic_name, execution);
			if (StringUtils.isAnyBlank(bootstrapServersConfig, topicName)) {
				throw new RuntimeException("bootstrap_servers_config or topic_name should not be empty.");
			}
			Optional<FormsflowKafkaConsumer> existingConsumer = kafkaConsumers.stream()
					.filter(consumer -> bootstrapServersConfig.equals(consumer.getBoostrapServersConfig())
							&& topicName.equals(consumer.getTopicName()))
					.findAny();
			if (!existingConsumer.isPresent()) {
				FormsflowKafkaConsumer consumer = new FormsflowKafkaConsumer(this.runtimeService,bootstrapServersConfig,topicName);
				kafkaConsumers.add(consumer);
				consumer.startConsuming();
			}
		} catch (Exception ex) {
			handleException(execution, ExceptionSource.EXECUTION, ex);
		}
	}

	private String getValue(Expression expression, DelegateExecution execution) {
		return expression == null ? null : String.valueOf(expression.getValue(execution));
	}
	
}
