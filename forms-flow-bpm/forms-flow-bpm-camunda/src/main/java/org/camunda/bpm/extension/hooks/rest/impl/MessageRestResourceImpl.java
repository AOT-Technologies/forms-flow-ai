package org.camunda.bpm.extension.hooks.rest.impl;

import org.camunda.bpm.engine.rest.MessageRestService;
import org.camunda.bpm.engine.rest.dto.message.CorrelationMessageDto;
import org.camunda.bpm.extension.hooks.rest.MessageRestResource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ws.rs.core.Response;

public class MessageRestResourceImpl implements MessageRestResource {

    private static final Logger LOG = LoggerFactory.getLogger(MessageRestResourceImpl.class);

    private final MessageRestService restService;

    public MessageRestResourceImpl(MessageRestService messageRestService) {
        restService = messageRestService;
    }

    @Override
    public Response deliverMessage(CorrelationMessageDto messageDto) {
       return restService.deliverMessage(messageDto);
    }
}
