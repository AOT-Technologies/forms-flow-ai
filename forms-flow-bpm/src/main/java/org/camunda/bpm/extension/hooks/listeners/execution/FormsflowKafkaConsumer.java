package org.camunda.bpm.extension.hooks.listeners.execution;

import java.util.Collections;
import java.util.Properties;
import java.util.concurrent.CompletableFuture;

import org.apache.commons.lang3.StringUtils;
import org.apache.kafka.clients.consumer.*;
import org.camunda.bpm.engine.RuntimeService;
import org.jsoup.internal.StringUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.apache.kafka.common.serialization.StringDeserializer;

public class FormsflowKafkaConsumer {

	private static final Logger LOGGER = LoggerFactory.getLogger(FormsflowKafkaConsumer.class);

	private RuntimeService runtimeService;
	private CompletableFuture<?> futureProcess;
	private boolean continueRunning = true;
	private Consumer<String, String> consumer;
	private String boostrapServersConfig;
	private String topicName;
	private String groupIdConfig;
	private String keyDeserializerClassConfig;
	private String valueDeserializerClassConfig;
	private String groupInstanceIdConfig;
	private String maxPollRecordsConfig;
	private String maxPollIntervalMsConfig;
	private String sessionTimeoutMsConfig;
	private String heartbeatIntervalMsConfig;
	private String clientDnsLookupConfig;
	private String enableAutoCommitConfig;
	private String autoCommitIntervalMsConfig;
	private String partitionAssigmentStrategyConfig;
	private String autoOffsetResetConfig;
	private String fetchMinBytesConfig;
	private String fetchMaxBytesConfig;
	private String fetchMaxWaitMsConfig;
	private String metadataMaxAgeConfig;
	private String maxPartitionFetchBytes;
	private String sendBufferConfig;
	private String receiveBufferConfig;
	private String clientIdConfig;
	private String clientRackConfig;
	private String reconnectBackoffMsConfig;
	private String reconnectBackoffMaxMsConfig;
	private String retryBackoffMsConfig;
	private String metricsSampleWindowMsConfig;
	private String metricsNumSamplesConfig;
	private String metricsRecordingLevelConfig;
	private String metricReporterClassesConfig;
	private String checkCrcsConfig;
	private String socketConnectionSetupTimeoutMsConfig;
	private String socketConnectionSetupTimeoutMaxMsConfig;
	private String connectionsMaxIdleMsConfig;
	private String requestTimeoutMsConfig;
	private String defaultApiTimeoutMsConfig;
	private String interceptorClassesConfig;
	private String excludeInternalTopicsConfig;
	private String isolationLevelConfig;
	private String defaultIsolationLevel;
	private String allowAutoCreateTopicsConfig;
	private String securityProvidersConfig;

	public FormsflowKafkaConsumer(RuntimeService runtimeService) {
		this.runtimeService = runtimeService;
	}
	
	private Properties prepareProperties() {
		final Properties props = new Properties();
		props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, this.boostrapServersConfig);
		if(StringUtils.isBlank(this.groupIdConfig)) {
			props.put(ConsumerConfig.GROUP_ID_CONFIG, "FormsFlowKafkaConsumer");
		}else {
			props.put(ConsumerConfig.GROUP_ID_CONFIG, this.groupIdConfig);
		}
		if(StringUtils.isBlank(this.keyDeserializerClassConfig)) {
			props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
		}else {
			props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, this.keyDeserializerClassConfig);
		}
		if(StringUtil.isBlank(this.valueDeserializerClassConfig)) {
			props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
		}else {
			props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, this.valueDeserializerClassConfig);
		}
		if(StringUtils.isNotBlank(this.groupInstanceIdConfig)) {
			props.put(ConsumerConfig.GROUP_INSTANCE_ID_CONFIG, this.groupInstanceIdConfig);
		}
		if(StringUtils.isNotBlank(this.maxPollRecordsConfig)) {
			props.put(ConsumerConfig.MAX_POLL_RECORDS_CONFIG, this.maxPollRecordsConfig);
		}
		if(StringUtils.isNotBlank(this.maxPollIntervalMsConfig)) {
			props.put(ConsumerConfig.MAX_POLL_INTERVAL_MS_CONFIG, this.maxPollIntervalMsConfig);
		}
		if(StringUtils.isNotBlank(this.sessionTimeoutMsConfig)) {
			props.put(ConsumerConfig.SESSION_TIMEOUT_MS_CONFIG, this.sessionTimeoutMsConfig);
		}
		if(StringUtils.isNotBlank(this.heartbeatIntervalMsConfig)) {
			props.put(ConsumerConfig.HEARTBEAT_INTERVAL_MS_CONFIG, this.heartbeatIntervalMsConfig);
		}
		if(StringUtils.isNotBlank(this.clientDnsLookupConfig)) {
			props.put(ConsumerConfig.CLIENT_DNS_LOOKUP_CONFIG, this.clientDnsLookupConfig);
		}
		if(StringUtils.isNotBlank(this.enableAutoCommitConfig)) {
			props.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, this.enableAutoCommitConfig);
		}
		if(StringUtils.isNotBlank(this.autoCommitIntervalMsConfig)) {
			props.put(ConsumerConfig.AUTO_COMMIT_INTERVAL_MS_CONFIG, this.autoCommitIntervalMsConfig);
		}
		if(StringUtils.isNotBlank(this.partitionAssigmentStrategyConfig)) {
			props.put(ConsumerConfig.PARTITION_ASSIGNMENT_STRATEGY_CONFIG, this.partitionAssigmentStrategyConfig);
		}
		if(StringUtils.isNotBlank(this.autoOffsetResetConfig)) {
			props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, this.autoOffsetResetConfig);
		}
		if(StringUtils.isNotBlank(this.fetchMinBytesConfig)) {
			props.put(ConsumerConfig.FETCH_MIN_BYTES_CONFIG, this.fetchMinBytesConfig);
		}
		if(StringUtils.isNotBlank(this.fetchMaxBytesConfig)) {
			props.put(ConsumerConfig.FETCH_MAX_BYTES_CONFIG, this.fetchMaxBytesConfig);
		}
		if(StringUtils.isNotBlank(this.fetchMaxWaitMsConfig)) {
			props.put(ConsumerConfig.FETCH_MAX_WAIT_MS_CONFIG, this.fetchMaxWaitMsConfig);
		}
		if(StringUtils.isNotBlank(this.metadataMaxAgeConfig)) {
			props.put(ConsumerConfig.METADATA_MAX_AGE_CONFIG, this.metadataMaxAgeConfig);
		}
		if(StringUtils.isNotBlank(this.maxPartitionFetchBytes)) {
			props.put(ConsumerConfig.MAX_PARTITION_FETCH_BYTES_CONFIG, this.maxPartitionFetchBytes);
		}
		if(StringUtils.isNotBlank(this.sendBufferConfig)) {
			props.put(ConsumerConfig.SEND_BUFFER_CONFIG, this.sendBufferConfig);
		}
		if(StringUtils.isNotBlank(this.receiveBufferConfig)) {
			props.put(ConsumerConfig.RECEIVE_BUFFER_CONFIG, this.receiveBufferConfig);
		}
		if(StringUtils.isNotBlank(this.clientIdConfig)) {
			props.put(ConsumerConfig.CLIENT_ID_CONFIG, this.clientIdConfig);
		}
		if(StringUtils.isNotBlank(this.clientRackConfig)) {
			props.put(ConsumerConfig.CLIENT_RACK_CONFIG, this.clientRackConfig);
		}
		if(StringUtils.isNotBlank(this.reconnectBackoffMsConfig)) {
			props.put(ConsumerConfig.RECONNECT_BACKOFF_MS_CONFIG, this.reconnectBackoffMsConfig);
		}
		if(StringUtils.isNotBlank(this.reconnectBackoffMaxMsConfig)) {
			props.put(ConsumerConfig.RECONNECT_BACKOFF_MAX_MS_CONFIG, this.reconnectBackoffMaxMsConfig);
		}
		if(StringUtils.isNotBlank(this.retryBackoffMsConfig)) {
			props.put(ConsumerConfig.RETRY_BACKOFF_MS_CONFIG, this.retryBackoffMsConfig);
		}
		if(StringUtils.isNotBlank(this.metricsSampleWindowMsConfig)) {
			props.put(ConsumerConfig.METRICS_SAMPLE_WINDOW_MS_CONFIG, this.metricsSampleWindowMsConfig);
		}
		if(StringUtils.isNotBlank(this.metricsNumSamplesConfig)) {
			props.put(ConsumerConfig.METRICS_NUM_SAMPLES_CONFIG, this.metricsNumSamplesConfig);
		}
		if(StringUtils.isNotBlank(this.metricsRecordingLevelConfig)) {
			props.put(ConsumerConfig.METRICS_RECORDING_LEVEL_CONFIG, this.metricsRecordingLevelConfig);
		}
		if(StringUtils.isNotBlank(this.metricReporterClassesConfig)) {
			props.put(ConsumerConfig.METRIC_REPORTER_CLASSES_CONFIG, this.metricReporterClassesConfig);
		}
		if(StringUtils.isNotBlank(this.checkCrcsConfig)) {
			props.put(ConsumerConfig.CHECK_CRCS_CONFIG, this.checkCrcsConfig);
		}
		if(StringUtils.isNotBlank(this.socketConnectionSetupTimeoutMsConfig)) {
			props.put(ConsumerConfig.SOCKET_CONNECTION_SETUP_TIMEOUT_MS_CONFIG, this.socketConnectionSetupTimeoutMsConfig);
		}
		if(StringUtils.isNotBlank(this.socketConnectionSetupTimeoutMaxMsConfig)) {
			props.put(ConsumerConfig.SOCKET_CONNECTION_SETUP_TIMEOUT_MAX_MS_CONFIG, this.socketConnectionSetupTimeoutMaxMsConfig);
		}
		if(StringUtils.isNotBlank(this.connectionsMaxIdleMsConfig)) {
			props.put(ConsumerConfig.CONNECTIONS_MAX_IDLE_MS_CONFIG, this.connectionsMaxIdleMsConfig);
		}
		if(StringUtils.isNotBlank(this.requestTimeoutMsConfig)) {
			props.put(ConsumerConfig.REQUEST_TIMEOUT_MS_CONFIG, this.requestTimeoutMsConfig);
		}
		if(StringUtils.isNotBlank(this.defaultApiTimeoutMsConfig)) {
			props.put(ConsumerConfig.DEFAULT_API_TIMEOUT_MS_CONFIG, this.defaultApiTimeoutMsConfig);
		}
		if(StringUtils.isNotBlank(this.interceptorClassesConfig)) {
			props.put(ConsumerConfig.INTERCEPTOR_CLASSES_CONFIG, this.interceptorClassesConfig);
		}
		if(StringUtils.isNotBlank(this.excludeInternalTopicsConfig)) {
			props.put(ConsumerConfig.EXCLUDE_INTERNAL_TOPICS_CONFIG, this.excludeInternalTopicsConfig);
		}
		if(StringUtils.isNotBlank(this.isolationLevelConfig)) {
			props.put(ConsumerConfig.ISOLATION_LEVEL_CONFIG, this.isolationLevelConfig);
		}
		if(StringUtils.isNotBlank(this.defaultIsolationLevel)) {
			props.put(ConsumerConfig.DEFAULT_ISOLATION_LEVEL, this.defaultIsolationLevel);
		}
		if(StringUtils.isNotBlank(this.allowAutoCreateTopicsConfig)) {
			props.put(ConsumerConfig.ALLOW_AUTO_CREATE_TOPICS_CONFIG, this.allowAutoCreateTopicsConfig);
		}
		if(StringUtils.isNotBlank(this.securityProvidersConfig)) {
			props.put(ConsumerConfig.SECURITY_PROVIDERS_CONFIG, this.securityProvidersConfig);
		}
		
		return props;
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
		Properties props = prepareProperties();

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

	public void setBoostrapServersConfig(String boostrapServersConfig) {
		this.boostrapServersConfig = boostrapServersConfig;
	}

	public String getTopicName() {
		return topicName;
	}

	public void setTopicName(String topicName) {
		this.topicName = topicName;
	}

	public String getGroupIdConfig() {
		return groupIdConfig;
	}

	public void setGroupIdConfig(String groupIdConfig) {
		this.groupIdConfig = groupIdConfig;
	}

	public String getKeyDeserializerClassConfig() {
		return keyDeserializerClassConfig;
	}

	public void setKeyDeserializerClassConfig(String keyDeserializerClassConfig) {
		this.keyDeserializerClassConfig = keyDeserializerClassConfig;
	}

	public String getValueDeserializerClassConfig() {
		return valueDeserializerClassConfig;
	}

	public void setValueDeserializerClassConfig(String valueDeserializerClassConfig) {
		this.valueDeserializerClassConfig = valueDeserializerClassConfig;
	}

	public String getGroupInstanceIdConfig() {
		return groupInstanceIdConfig;
	}

	public void setGroupInstanceIdConfig(String groupInstanceIdConfig) {
		this.groupInstanceIdConfig = groupInstanceIdConfig;
	}

	public String getMaxPollRecordsConfig() {
		return maxPollRecordsConfig;
	}

	public void setMaxPollRecordsConfig(String maxPollRecordsConfig) {
		this.maxPollRecordsConfig = maxPollRecordsConfig;
	}

	public String getMaxPollIntervalMsConfig() {
		return maxPollIntervalMsConfig;
	}

	public void setMaxPollIntervalMsConfig(String maxPollIntervalMsConfig) {
		this.maxPollIntervalMsConfig = maxPollIntervalMsConfig;
	}

	public String getSessionTimeoutMsConfig() {
		return sessionTimeoutMsConfig;
	}

	public void setSessionTimeoutMsConfig(String sessionTimeoutMsConfig) {
		this.sessionTimeoutMsConfig = sessionTimeoutMsConfig;
	}

	public String getHeartbeatIntervalMsConfig() {
		return heartbeatIntervalMsConfig;
	}

	public void setHeartbeatIntervalMsConfig(String heartbeatIntervalMsConfig) {
		this.heartbeatIntervalMsConfig = heartbeatIntervalMsConfig;
	}

	public String getClientDnsLookupConfig() {
		return clientDnsLookupConfig;
	}

	public void setClientDnsLookupConfig(String clientDnsLookupConfig) {
		this.clientDnsLookupConfig = clientDnsLookupConfig;
	}

	public String getEnableAutoCommitConfig() {
		return enableAutoCommitConfig;
	}

	public void setEnableAutoCommitConfig(String enableAutoCommitConfig) {
		this.enableAutoCommitConfig = enableAutoCommitConfig;
	}

	public String getAutoCommitIntervalMsConfig() {
		return autoCommitIntervalMsConfig;
	}

	public void setAutoCommitIntervalMsConfig(String autoCommitIntervalMsConfig) {
		this.autoCommitIntervalMsConfig = autoCommitIntervalMsConfig;
	}

	public String getPartitionAssigmentStrategyConfig() {
		return partitionAssigmentStrategyConfig;
	}

	public void setPartitionAssigmentStrategyConfig(String partitionAssigmentStrategyConfig) {
		this.partitionAssigmentStrategyConfig = partitionAssigmentStrategyConfig;
	}

	public String getAutoOffsetResetConfig() {
		return autoOffsetResetConfig;
	}

	public void setAutoOffsetResetConfig(String autoOffsetResetConfig) {
		this.autoOffsetResetConfig = autoOffsetResetConfig;
	}

	public String getFetchMinBytesConfig() {
		return fetchMinBytesConfig;
	}

	public void setFetchMinBytesConfig(String fetchMinBytesConfig) {
		this.fetchMinBytesConfig = fetchMinBytesConfig;
	}

	public String getFetchMaxBytesConfig() {
		return fetchMaxBytesConfig;
	}

	public void setFetchMaxBytesConfig(String fetchMaxBytesConfig) {
		this.fetchMaxBytesConfig = fetchMaxBytesConfig;
	}

	public String getFetchMaxWaitMsConfig() {
		return fetchMaxWaitMsConfig;
	}

	public void setFetchMaxWaitMsConfig(String fetchMaxWaitMsConfig) {
		this.fetchMaxWaitMsConfig = fetchMaxWaitMsConfig;
	}

	public String getMetadataMaxAgeConfig() {
		return metadataMaxAgeConfig;
	}

	public void setMetadataMaxAgeConfig(String metadataMaxAgeConfig) {
		this.metadataMaxAgeConfig = metadataMaxAgeConfig;
	}

	public String getMaxPartitionFetchBytes() {
		return maxPartitionFetchBytes;
	}

	public void setMaxPartitionFetchBytes(String maxPartitionFetchBytes) {
		this.maxPartitionFetchBytes = maxPartitionFetchBytes;
	}

	public String getSendBufferConfig() {
		return sendBufferConfig;
	}

	public void setSendBufferConfig(String sendBufferConfig) {
		this.sendBufferConfig = sendBufferConfig;
	}

	public String getReceiveBufferConfig() {
		return receiveBufferConfig;
	}

	public void setReceiveBufferConfig(String receiveBufferConfig) {
		this.receiveBufferConfig = receiveBufferConfig;
	}

	public String getClientIdConfig() {
		return clientIdConfig;
	}

	public void setClientIdConfig(String clientIdConfig) {
		this.clientIdConfig = clientIdConfig;
	}

	public String getClientRackConfig() {
		return clientRackConfig;
	}

	public void setClientRackConfig(String clientRackConfig) {
		this.clientRackConfig = clientRackConfig;
	}

	public String getReconnectBackoffMsConfig() {
		return reconnectBackoffMsConfig;
	}

	public void setReconnectBackoffMsConfig(String reconnectBackoffMsConfig) {
		this.reconnectBackoffMsConfig = reconnectBackoffMsConfig;
	}

	public String getReconnectBackoffMaxMsConfig() {
		return reconnectBackoffMaxMsConfig;
	}

	public void setReconnectBackoffMaxMsConfig(String reconnectBackoffMaxMsConfig) {
		this.reconnectBackoffMaxMsConfig = reconnectBackoffMaxMsConfig;
	}

	public String getRetryBackoffMsConfig() {
		return retryBackoffMsConfig;
	}

	public void setRetryBackoffMsConfig(String retryBackoffMsConfig) {
		this.retryBackoffMsConfig = retryBackoffMsConfig;
	}

	public String getMetricsSampleWindowMsConfig() {
		return metricsSampleWindowMsConfig;
	}

	public void setMetricsSampleWindowMsConfig(String metricsSampleWindowMsConfig) {
		this.metricsSampleWindowMsConfig = metricsSampleWindowMsConfig;
	}

	public String getMetricsNumSamplesConfig() {
		return metricsNumSamplesConfig;
	}

	public void setMetricsNumSamplesConfig(String metricsNumSamplesConfig) {
		this.metricsNumSamplesConfig = metricsNumSamplesConfig;
	}

	public String getMetricsRecordingLevelConfig() {
		return metricsRecordingLevelConfig;
	}

	public void setMetricsRecordingLevelConfig(String metricsRecordingLevelConfig) {
		this.metricsRecordingLevelConfig = metricsRecordingLevelConfig;
	}

	public String getMetricReporterClassesConfig() {
		return metricReporterClassesConfig;
	}

	public void setMetricReporterClassesConfig(String metricReporterClassesConfig) {
		this.metricReporterClassesConfig = metricReporterClassesConfig;
	}

	public String getCheckCrcsConfig() {
		return checkCrcsConfig;
	}

	public void setCheckCrcsConfig(String checkCrcsConfig) {
		this.checkCrcsConfig = checkCrcsConfig;
	}

	public String getSocketConnectionSetupTimeoutMsConfig() {
		return socketConnectionSetupTimeoutMsConfig;
	}

	public void setSocketConnectionSetupTimeoutMsConfig(String socketConnectionSetupTimeoutMsConfig) {
		this.socketConnectionSetupTimeoutMsConfig = socketConnectionSetupTimeoutMsConfig;
	}

	public String getSocketConnectionSetupTimeoutMaxMsConfig() {
		return socketConnectionSetupTimeoutMaxMsConfig;
	}

	public void setSocketConnectionSetupTimeoutMaxMsConfig(String socketConnectionSetupTimeoutMaxMsConfig) {
		this.socketConnectionSetupTimeoutMaxMsConfig = socketConnectionSetupTimeoutMaxMsConfig;
	}

	public String getConnectionsMaxIdleMsConfig() {
		return connectionsMaxIdleMsConfig;
	}

	public void setConnectionsMaxIdleMsConfig(String connectionsMaxIdleMsConfig) {
		this.connectionsMaxIdleMsConfig = connectionsMaxIdleMsConfig;
	}

	public String getRequestTimeoutMsConfig() {
		return requestTimeoutMsConfig;
	}

	public void setRequestTimeoutMsConfig(String requestTimeoutMsConfig) {
		this.requestTimeoutMsConfig = requestTimeoutMsConfig;
	}

	public String getDefaultApiTimeoutMsConfig() {
		return defaultApiTimeoutMsConfig;
	}

	public void setDefaultApiTimeoutMsConfig(String defaultApiTimeoutMsConfig) {
		this.defaultApiTimeoutMsConfig = defaultApiTimeoutMsConfig;
	}

	public String getInterceptorClassesConfig() {
		return interceptorClassesConfig;
	}

	public void setInterceptorClassesConfig(String interceptorClassesConfig) {
		this.interceptorClassesConfig = interceptorClassesConfig;
	}

	public String getExcludeInternalTopicsConfig() {
		return excludeInternalTopicsConfig;
	}

	public void setExcludeInternalTopicsConfig(String excludeInternalTopicsConfig) {
		this.excludeInternalTopicsConfig = excludeInternalTopicsConfig;
	}

	public String getIsolationLevelConfig() {
		return isolationLevelConfig;
	}

	public void setIsolationLevelConfig(String isolationLevelConfig) {
		this.isolationLevelConfig = isolationLevelConfig;
	}

	public String getDefaultIsolationLevel() {
		return defaultIsolationLevel;
	}

	public void setDefaultIsolationLevel(String defaultIsolationLevel) {
		this.defaultIsolationLevel = defaultIsolationLevel;
	}

	public String getAllowAutoCreateTopicsConfig() {
		return allowAutoCreateTopicsConfig;
	}

	public void setAllowAutoCreateTopicsConfig(String allowAutoCreateTopicsConfig) {
		this.allowAutoCreateTopicsConfig = allowAutoCreateTopicsConfig;
	}

	public String getSecurityProvidersConfig() {
		return securityProvidersConfig;
	}

	public void setSecurityProvidersConfig(String securityProvidersConfig) {
		this.securityProvidersConfig = securityProvidersConfig;
	}

	

}
