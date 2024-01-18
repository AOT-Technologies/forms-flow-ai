package org.camunda.bpm.extension.hooks.rest;

import org.camunda.bpm.engine.rest.dto.VersionDto;
import org.springframework.hateoas.EntityModel;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

@Produces(MediaType.APPLICATION_JSON)
public interface VersionRestResource  extends RestResource{

    String PATH = "/version";

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    VersionDto getVersion();
}
