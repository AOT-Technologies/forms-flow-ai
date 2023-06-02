package org.camunda.bpm.extension.hooks.listeners.execution;

import java.util.Collections;
import java.util.Properties;
import java.util.concurrent.CompletableFuture;

import org.apache.commons.lang3.StringUtils;
import org.apache.kafka.clients.consumer.*;
import org.camunda.bpm.engine.RuntimeService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.apache.kafka.common.serialization.StringDeserializer;

public class FormsflowKafkaConsumer {

	private static final Logger LOGGER = LoggerFactory.getLogger(FormsflowKafkaConsumer.class);

	private RuntimeService runtimeService;
	private String boostrapServersConfig;
	private String topicName;
	private CompletableFuture<?> futureProcess;
	private boolean continueRunning = true;
	private Consumer<String, String> consumer;

	public FormsflowKafkaConsumer(RuntimeService runtimeService, String bootstrapServersConfig, String topicName) {
		this.runtimeService = runtimeService;
		this.boostrapServersConfig = bootstrapServersConfig;
		this.topicName = topicName;
	}

	public void handle(ConsumerRecord<String, String> record) {
		if (runtimeService != null) {
			String key = record.key();
			if (StringUtils.isBlank(key)) {
				key = "messageKey";
			}
			String value = record.value();
			runtimeService.createMessageCorrelation(this.topicName).processInstanceVariableEquals(key, value)
					.correlate();
		} else {
			throw new RuntimeException("RuntimeService in KafkaConsumerListener is not initialized.");
		}
	}

	public void startConsuming() {
		final Properties props = new Properties();
		props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, this.boostrapServersConfig);
		props.put(ConsumerConfig.GROUP_ID_CONFIG, "FormsFlowKafkaConsumer");
		props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
		props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());

		// Create the consumer using props.
		this.consumer = new KafkaConsumer<>(props);

		// Subscribe to the topic.
		this.consumer.subscribe(Collections.singletonList(topicName));

		this.futureProcess = CompletableFuture.supplyAsync(() -> {

			while (this.continueRunning) {
				try {
					final ConsumerRecords<String, String> records = consumer.poll(1000);
					for (ConsumerRecord<String, String> record : records) {
						handle(record);
					}
					if (!records.isEmpty()) {
						this.consumer.commitSync();
					}
				} catch (Exception ex) {
					LOGGER.error("Error on Kafka Consumer:", ex.getMessage(), ex);
				}
			}

			return null;
		});
	}

	public void stopConsuming() {
		try {
			this.continueRunning = false;
			if (this.futureProcess != null && !this.futureProcess.isDone()) {
				this.futureProcess.get();
			}
			this.consumer.close();
		} catch (Exception ex) {
			LOGGER.error("Error on cleanup of KafkaConsumerListener:", ex.getMessage(), ex);
			throw new RuntimeException(ex);
		}
	}

	public String getBoostrapServersConfig() {
		return boostrapServersConfig;
	}

	public String getTopicName() {
		return topicName;
	}

}
