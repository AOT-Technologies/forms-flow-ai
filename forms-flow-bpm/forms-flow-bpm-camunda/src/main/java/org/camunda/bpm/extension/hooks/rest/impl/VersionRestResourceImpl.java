package org.camunda.bpm.extension.hooks.rest.impl;

import org.camunda.bpm.engine.rest.dto.VersionDto;
import org.camunda.bpm.engine.rest.impl.VersionRestService;
import org.camunda.bpm.extension.hooks.rest.VersionRestResource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.hateoas.EntityModel;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

public class VersionRestResourceImpl implements VersionRestResource {

    private static final Logger LOG = LoggerFactory.getLogger(VersionRestResourceImpl.class);

    private static VersionRestService restService;

    public VersionRestResourceImpl(VersionRestService restService) {
        this.restService = restService;
    }

    @Override
    public EntityModel<VersionDto> getVersion() {
        VersionDto dto = restService.getVersion();
        return EntityModel.of(dto, linkTo(methodOn(VersionRestResourceImpl.class).getVersion()).withSelfRel());
    }
}
