package org.camunda.bpm.extension.hooks.listeners.execution;

import org.apache.kafka.clients.producer.*;
import org.apache.kafka.common.serialization.StringSerializer;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.ExecutionListener;
import java.util.Properties;

import org.apache.commons.lang.StringUtils;
import org.camunda.bpm.engine.delegate.Expression;
import org.camunda.bpm.extension.hooks.exceptions.ApplicationServiceException;
import org.camunda.bpm.extension.hooks.listeners.BaseListener;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import javax.annotation.Resource;
import javax.inject.Named;

import java.io.IOException;

@Named("KafkaProducerListener")
public class KafkaProducerListener extends BaseListener implements ExecutionListener {

	private static final Logger LOGGER = LoggerFactory.getLogger(KafkaProducerListener.class);

	private Expression messageKey;
	private Expression messageValue;
	private Expression bootstrap_servers_config;
	private Expression topic_name;
	private Expression key_serializer_class_config;
	private Expression value_serializer_class_config;
	private Expression client_dns_lookup_config;
	private Expression metadata_max_age_config;
	private Expression metadata_max_idle_config;
	private Expression batch_size_config;
	private Expression partitioner_adaptive_partitioning_enable_config;
	private Expression partitioner_availability_timeout_ms_config;
	private Expression partitioner_ignore_keys_config;
	private Expression acks_config;
	private Expression linger_ms_config;
	private Expression request_timeout_ms_config;
	private Expression delivery_timeout_ms_config;
	private Expression client_id_config;
	private Expression send_buffer_config;
	private Expression receive_buffer_config;
	private Expression max_request_size_config;
	private Expression reconnect_backoff_ms_config;
	private Expression reconnect_backoff_max_ms_config;
	private Expression max_block_ms_config;
	private Expression buffer_memory_config;
	private Expression retry_backoff_ms_config;
	private Expression compression_type_config;
	private Expression metrics_sample_window_ms_config;
	private Expression metrics_num_samples_config;
	private Expression metrics_recording_level_config;
	private Expression metric_reporter_classes_config;
	private Expression max_in_flight_requests_per_connection;
	private Expression retries_config;
	private Expression socket_connection_setup_timeout_ms_config;
	private Expression socket_connection_setup_timeout_max_ms_config;
	private Expression connections_max_idle_ms_config;
	private Expression partitioner_class_config;
	private Expression interceptor_classes_config;
	private Expression enable_idempotence_config;
	private Expression transaction_timeout_config;
	private Expression transactional_id_config;
	private Expression security_providers_config;

	private Properties createProducerProperties(DelegateExecution execution) {
		Properties props = new Properties();
		props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG,
				String.valueOf(this.bootstrap_servers_config.getValue(execution)));
		String keySerializer = getValue(this.key_serializer_class_config, execution);
		if (StringUtils.isNotBlank(keySerializer)) {
			props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, keySerializer);
		} else {
			props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());
		}
		String valueSerializer = getValue(this.value_serializer_class_config, execution);
		if (StringUtils.isNotBlank(valueSerializer)) {
			props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, valueSerializer);
		} else {
			props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());
		}
		String clientDns = getValue(this.client_dns_lookup_config, execution);
		if (StringUtils.isNotBlank(clientDns)) {
			props.put(ProducerConfig.CLIENT_DNS_LOOKUP_CONFIG, clientDns);
		}
		String metadataMaxAge = getValue(this.metadata_max_age_config, execution);
		if (StringUtils.isNotBlank(metadataMaxAge)) {
			props.put(ProducerConfig.METADATA_MAX_AGE_CONFIG, metadataMaxAge);
		}
		String metadataMaxIdle = getValue(this.metadata_max_idle_config, execution);
		if (StringUtils.isNotBlank(metadataMaxIdle)) {
			props.put(ProducerConfig.METADATA_MAX_IDLE_CONFIG, metadataMaxIdle);
		}
		String batchSize = getValue(this.batch_size_config, execution);
		if (StringUtils.isNotBlank(batchSize)) {
			props.put(ProducerConfig.BATCH_SIZE_CONFIG, batchSize);
		}
		String partitionerAdaptive = getValue(this.partitioner_adaptive_partitioning_enable_config, execution);
		if (StringUtils.isNotBlank(partitionerAdaptive)) {
			props.put(ProducerConfig.PARTITIONER_ADPATIVE_PARTITIONING_ENABLE_CONFIG, partitionerAdaptive);
		}
		String partitionerAvailability = getValue(this.partitioner_availability_timeout_ms_config, execution);
		if (StringUtils.isNotBlank(partitionerAvailability)) {
			props.put(ProducerConfig.PARTITIONER_AVAILABILITY_TIMEOUT_MS_CONFIG, partitionerAvailability);
		}
		String partitionerIgnore = getValue(this.partitioner_ignore_keys_config, execution);
		if (StringUtils.isNotBlank(partitionerIgnore)) {
			props.put(ProducerConfig.PARTITIONER_IGNORE_KEYS_CONFIG, partitionerIgnore);
		}
		String acksConfig = getValue(this.acks_config, execution);
		if (StringUtils.isNotBlank(acksConfig)) {
			props.put(ProducerConfig.ACKS_CONFIG, acksConfig);
		}
		String lingerConfig = getValue(this.linger_ms_config, execution);
		if (StringUtils.isNotBlank(lingerConfig)) {
			props.put(ProducerConfig.LINGER_MS_CONFIG, lingerConfig);
		}
		String requestTimeout = getValue(this.request_timeout_ms_config, execution);
		if (StringUtils.isNotBlank(requestTimeout)) {
			props.put(ProducerConfig.REQUEST_TIMEOUT_MS_CONFIG, requestTimeout);
		}
		String deliveryTimeout = getValue(this.delivery_timeout_ms_config, execution);
		if (StringUtils.isNotBlank(deliveryTimeout)) {
			props.put(ProducerConfig.DELIVERY_TIMEOUT_MS_CONFIG, deliveryTimeout);
		}
		String clientId = getValue(this.client_id_config, execution);
		if (StringUtils.isNotBlank(clientId)) {
			props.put(ProducerConfig.CLIENT_ID_CONFIG, clientId);
		}
		String sendBuffer = getValue(this.send_buffer_config, execution);
		if (StringUtils.isNotBlank(sendBuffer)) {
			props.put(ProducerConfig.SEND_BUFFER_CONFIG, sendBuffer);
		}
		String receiveBuffer = getValue(this.receive_buffer_config, execution);
		if (StringUtils.isNotBlank(receiveBuffer)) {
			props.put(ProducerConfig.RECEIVE_BUFFER_CONFIG, receiveBuffer);
		}
		String maxRequestSize = getValue(this.max_request_size_config, execution);
		if (StringUtils.isNotBlank(maxRequestSize)) {
			props.put(ProducerConfig.MAX_REQUEST_SIZE_CONFIG, maxRequestSize);
		}
		String reconnectBackoff = getValue(this.reconnect_backoff_ms_config, execution);
		if (StringUtils.isNotBlank(reconnectBackoff)) {
			props.put(ProducerConfig.RECONNECT_BACKOFF_MS_CONFIG, reconnectBackoff);
		}
		String reconnectBackoffMax = getValue(this.reconnect_backoff_max_ms_config, execution);
		if (StringUtils.isNotBlank(reconnectBackoffMax)) {
			props.put(ProducerConfig.RECONNECT_BACKOFF_MAX_MS_CONFIG, reconnectBackoffMax);
		}
		String maxBlock = getValue(this.max_block_ms_config, execution);
		if (StringUtils.isNotBlank(maxBlock)) {
			props.put(ProducerConfig.MAX_BLOCK_MS_CONFIG, maxBlock);
		}
		String bufferMemory = getValue(this.buffer_memory_config, execution);
		if (StringUtils.isNotBlank(bufferMemory)) {
			props.put(ProducerConfig.BUFFER_MEMORY_CONFIG, bufferMemory);
		}
		String retryBackoff = getValue(this.retry_backoff_ms_config, execution);
		if (StringUtils.isNotBlank(retryBackoff)) {
			props.put(ProducerConfig.RETRY_BACKOFF_MS_CONFIG, retryBackoff);
		}
		String compressionType = getValue(this.compression_type_config, execution);
		if (StringUtils.isNotBlank(compressionType)) {
			props.put(ProducerConfig.COMPRESSION_TYPE_CONFIG, compressionType);
		}
		String metricSampleWindow = getValue(this.metrics_sample_window_ms_config, execution);
		if (StringUtils.isNotBlank(metricSampleWindow)) {
			props.put(ProducerConfig.METRICS_SAMPLE_WINDOW_MS_CONFIG, metricSampleWindow);
		}
		String metricNum = getValue(this.metrics_num_samples_config, execution);
		if (StringUtils.isNotBlank(metricNum)) {
			props.put(ProducerConfig.METRICS_NUM_SAMPLES_CONFIG, metricNum);
		}
		String metricsRecording = getValue(this.metrics_recording_level_config, execution);
		if (StringUtils.isNotBlank(metricsRecording)) {
			props.put(ProducerConfig.METRICS_RECORDING_LEVEL_CONFIG, metricsRecording);
		}
		String metricReporter = getValue(this.metric_reporter_classes_config, execution);
		if (StringUtils.isNotBlank(metricReporter)) {
			props.put(ProducerConfig.METRIC_REPORTER_CLASSES_CONFIG, metricReporter);
		}
		String maxInFlight = getValue(this.max_in_flight_requests_per_connection, execution);
		if (StringUtils.isNotBlank(maxInFlight)) {
			props.put(ProducerConfig.MAX_IN_FLIGHT_REQUESTS_PER_CONNECTION, maxInFlight);
		}
		String retries = getValue(this.retries_config, execution);
		if (StringUtils.isNotBlank(retries)) {
			props.put(ProducerConfig.RETRIES_CONFIG, retries);
		}
		String socketConn = getValue(this.socket_connection_setup_timeout_ms_config, execution);
		if (StringUtils.isNotBlank(socketConn)) {
			props.put(ProducerConfig.SOCKET_CONNECTION_SETUP_TIMEOUT_MS_CONFIG, socketConn);
		}
		String socketConnMax = getValue(this.socket_connection_setup_timeout_max_ms_config, execution);
		if (StringUtils.isNotBlank(socketConnMax)) {
			props.put(ProducerConfig.SOCKET_CONNECTION_SETUP_TIMEOUT_MAX_MS_CONFIG, socketConnMax);
		}
		String connMax = getValue(this.connections_max_idle_ms_config, execution);
		if (StringUtils.isNotBlank(connMax)) {
			props.put(ProducerConfig.CONNECTIONS_MAX_IDLE_MS_CONFIG, connMax);
		}
		String partitioner = getValue(this.partitioner_class_config, execution);
		if (StringUtils.isNotBlank(partitioner)) {
			props.put(ProducerConfig.PARTITIONER_CLASS_CONFIG, partitioner);
		}
		String interceptor = getValue(this.interceptor_classes_config, execution);
		if (StringUtils.isNotBlank(interceptor)) {
			props.put(ProducerConfig.INTERCEPTOR_CLASSES_CONFIG, interceptor);
		}
		String idempotence = getValue(this.enable_idempotence_config, execution);
		if (StringUtils.isNotBlank(idempotence)) {
			props.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, idempotence);
		}
		String txnTimeout = getValue(this.transaction_timeout_config, execution);
		if (StringUtils.isNotBlank(txnTimeout)) {
			props.put(ProducerConfig.TRANSACTION_TIMEOUT_CONFIG, txnTimeout);
		}
		String txnlId = getValue(this.transactional_id_config, execution);
		if (StringUtils.isNotBlank(txnlId)) {
			props.put(ProducerConfig.TRANSACTIONAL_ID_CONFIG, txnlId);
		}
		String securityProviders = getValue(this.security_providers_config, execution);
		if (StringUtils.isNotBlank(securityProviders)) {
			props.put(ProducerConfig.SECURITY_PROVIDERS_CONFIG, securityProviders);
		}
		return props;
	}

	private String getValue(Expression expression, DelegateExecution execution) {
		return expression == null ? null : String.valueOf(expression.getValue(execution));
	}

	@Override
	public void notify(DelegateExecution execution) {
		try {
			Properties props = createProducerProperties(execution);
			Producer<String, String> producer = new KafkaProducer<>(props);
			String messageKey = getValue(this.messageKey,execution);
			String messageValue = getValue(this.messageValue,execution);
			producer.send(new ProducerRecord<>(String.valueOf(this.topic_name.getValue(execution)), messageKey, messageValue));
			LOGGER.warn("****** Message published - key:" + messageKey + " value:" + messageValue );
			producer.close();
		} catch (Exception ex) {
			handleException(execution, ExceptionSource.EXECUTION, ex);
		}
	}

	public String getListenerType() {
		return ExecutionListener.EVENTNAME_END;
	}
}
