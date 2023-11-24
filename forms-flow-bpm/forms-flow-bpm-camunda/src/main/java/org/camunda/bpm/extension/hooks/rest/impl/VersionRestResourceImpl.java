package org.camunda.bpm.extension.hooks.rest.impl;

import org.camunda.bpm.engine.rest.dto.VersionDto;
import org.camunda.bpm.engine.rest.impl.VersionRestService;
import org.camunda.bpm.extension.hooks.rest.VersionRestResource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class VersionRestResourceImpl implements VersionRestResource {

    private static final Logger LOG = LoggerFactory.getLogger(VersionRestResourceImpl.class);

    private static VersionRestService restService;

    public VersionRestResourceImpl(VersionRestService restService) {
        this.restService = restService;
    }

    @Override
    public VersionDto getVersion() {
        return restService.getVersion();
    }
}
