package org.camunda.bpm.extension.hooks.rest;

import org.camunda.bpm.engine.rest.dto.message.CorrelationMessageDto;

import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Produces(MediaType.APPLICATION_JSON)
public interface MessageRestResource extends RestResource {

    String PATH = "/message";

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    Response deliverMessage(CorrelationMessageDto messageDto);
}
