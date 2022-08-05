package org.camunda.bpm.extension.hooks.rest;

import org.camunda.bpm.engine.rest.dto.message.CorrelationMessageDto;

import javax.ws.rs.Consumes;
import javax.ws.rs.POST;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

@Produces(MediaType.APPLICATION_JSON)
public interface MessageRestResource extends RestResource {

    String PATH = "/message";

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    Response deliverMessage(CorrelationMessageDto messageDto);
}
