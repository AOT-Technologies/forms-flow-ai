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
	private Expression group_id_config;
	private Expression key_deserializer_class_config;
	private Expression value_deserializer_class_config;
	private Expression group_instance_id_config;
	private Expression max_poll_records_config;
	private Expression max_poll_interval_ms_config;
	private Expression session_timeout_ms_config;
	private Expression heartbeat_interval_ms_config;
	private Expression client_dns_lookup_config;
	private Expression enable_auto_commit_config;
	private Expression auto_commit_interval_ms_config;
	private Expression partition_assigment_strategy_config;
	private Expression auto_offset_reset_config;
	private Expression fetch_min_bytes_config;
	private Expression fetch_max_bytes_config;
	private Expression fetch_max_wait_ms_config;
	private Expression metadata_max_age_config;
	private Expression max_partition_fetch_bytes;
	private Expression send_buffer_config;
	private Expression receive_buffer_config;
	private Expression client_id_config;
	private Expression client_rack_config;
	private Expression reconnect_backoff_ms_config;
	private Expression reconnect_backoff_max_ms_config;
	private Expression retry_backoff_ms_config;
	private Expression metrics_sample_window_ms_config;
	private Expression metrics_num_samples_config;
	private Expression metrics_recording_level_config;
	private Expression metric_reporter_classes_config;
	private Expression check_crcs_config;
	private Expression socket_connection_setup_timeout_ms_config;
	private Expression socket_connection_setup_timeout_max_ms_config;
	private Expression connections_max_idle_ms_config;
	private Expression request_timeout_ms_config;
	private Expression default_api_timeout_ms_config;
	private Expression interceptor_classes_config;
	private Expression exclude_internal_topics_config;
	private Expression isolation_level_config;
	private Expression default_isolation_level;
	private Expression allow_auto_create_topics_config;
	private Expression security_providers_config;

	private List<FormsflowKafkaConsumer> kafkaConsumers = new ArrayList<FormsflowKafkaConsumer>();

	private void populateProperties(FormsflowKafkaConsumer consumer, DelegateExecution execution) {
		consumer.setBoostrapServersConfig(getValue(this.bootstrap_servers_config,execution));
		consumer.setTopicName(getValue(this.topic_name,execution));
		consumer.setGroupIdConfig(getValue(this.group_id_config,execution));
		consumer.setKeyDeserializerClassConfig(getValue(this.key_deserializer_class_config,execution));
		consumer.setValueDeserializerClassConfig(getValue(this.value_deserializer_class_config,execution));
		consumer.setGroupInstanceIdConfig(getValue(this.group_instance_id_config,execution));
		consumer.setMaxPollRecordsConfig(getValue(this.max_poll_records_config,execution));
		consumer.setMaxPollIntervalMsConfig(getValue(this.max_poll_interval_ms_config,execution));
		consumer.setSessionTimeoutMsConfig(getValue(this.session_timeout_ms_config,execution));
		consumer.setHeartbeatIntervalMsConfig(getValue(this.heartbeat_interval_ms_config,execution));
		consumer.setClientDnsLookupConfig(getValue(this.client_dns_lookup_config,execution));
		consumer.setEnableAutoCommitConfig(getValue(this.enable_auto_commit_config,execution));
		consumer.setAutoCommitIntervalMsConfig(getValue(this.auto_commit_interval_ms_config,execution));
		consumer.setPartitionAssigmentStrategyConfig(getValue(this.partition_assigment_strategy_config,execution));
		consumer.setAutoOffsetResetConfig(getValue(this.auto_offset_reset_config,execution));
		consumer.setFetchMinBytesConfig(getValue(this.fetch_min_bytes_config,execution));
		consumer.setFetchMaxBytesConfig(getValue(this.fetch_max_bytes_config,execution));
		consumer.setFetchMaxWaitMsConfig(getValue(this.fetch_max_wait_ms_config,execution));
		consumer.setMetadataMaxAgeConfig(getValue(this.metadata_max_age_config,execution));
		consumer.setMaxPartitionFetchBytes(getValue(this.max_partition_fetch_bytes,execution));
		consumer.setSendBufferConfig(getValue(this.send_buffer_config,execution));
		consumer.setReceiveBufferConfig(getValue(this.receive_buffer_config,execution));
		consumer.setClientIdConfig(getValue(this.client_id_config,execution));
		consumer.setClientRackConfig(getValue(this.client_rack_config,execution));
		consumer.setReconnectBackoffMsConfig(getValue(this.reconnect_backoff_ms_config,execution));
		consumer.setReconnectBackoffMaxMsConfig(getValue(this.reconnect_backoff_max_ms_config,execution));
		consumer.setRetryBackoffMsConfig(getValue(this.retry_backoff_ms_config,execution));
		consumer.setMetricsSampleWindowMsConfig(getValue(this.metrics_sample_window_ms_config,execution));
		consumer.setMetricsNumSamplesConfig(getValue(this.metrics_num_samples_config,execution));
		consumer.setMetricsRecordingLevelConfig(getValue(this.metrics_recording_level_config,execution));
		consumer.setMetricReporterClassesConfig(getValue(this.metric_reporter_classes_config,execution));
		consumer.setCheckCrcsConfig(getValue(this.check_crcs_config,execution));
		consumer.setSocketConnectionSetupTimeoutMsConfig(getValue(this.socket_connection_setup_timeout_ms_config,execution));
		consumer.setSocketConnectionSetupTimeoutMaxMsConfig(getValue(this.socket_connection_setup_timeout_max_ms_config,execution));
		consumer.setConnectionsMaxIdleMsConfig(getValue(this.connections_max_idle_ms_config,execution));
		consumer.setRequestTimeoutMsConfig(getValue(this.request_timeout_ms_config,execution));
		consumer.setDefaultApiTimeoutMsConfig(getValue(this.default_api_timeout_ms_config,execution));
		consumer.setInterceptorClassesConfig(getValue(this.interceptor_classes_config,execution));
		consumer.setExcludeInternalTopicsConfig(getValue(this.exclude_internal_topics_config,execution));
		consumer.setIsolationLevelConfig(getValue(this.isolation_level_config,execution));
		consumer.setDefaultIsolationLevel(getValue(this.default_isolation_level,execution));
		consumer.setAllowAutoCreateTopicsConfig(getValue(this.allow_auto_create_topics_config,execution));
		consumer.setSecurityProvidersConfig(getValue(this.security_providers_config,execution));
	}
	
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
				FormsflowKafkaConsumer consumer = new FormsflowKafkaConsumer(this.runtimeService);
				populateProperties(consumer,execution);
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
