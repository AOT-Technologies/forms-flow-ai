package org.camunda.bpm.extension.hooks.rest.impl;

import jakarta.ws.rs.core.Request;
import jakarta.ws.rs.core.UriInfo;
import org.camunda.bpm.engine.rest.FilterRestService;
import org.camunda.bpm.engine.rest.dto.CountResultDto;
import org.camunda.bpm.engine.rest.dto.runtime.FilterDto;
import org.camunda.bpm.extension.hooks.rest.FilterRestResource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

public class FilterRestResourceImpl implements FilterRestResource {

    private static final Logger LOG = LoggerFactory.getLogger(FilterRestResourceImpl.class);

    private final FilterRestService restService;

    public FilterRestResourceImpl(FilterRestService filterRestService) {
        restService = filterRestService;
    }

    @Override
    public List<FilterDto> getFilters(UriInfo uriInfo, Boolean itemCount, Integer firstResult, Integer maxResults) {
        return restService.getFilters(uriInfo, itemCount, firstResult, maxResults);
    }

    @Override
    public Object executeList(Request request, Integer firstResult, Integer maxResults, String id) {
        return restService.getFilter(id).executeList(request, firstResult, maxResults);

    }

    @Override
    public Object queryList(Request request, String extendingQuery, Integer firstResult, Integer maxResults, String id) {
        return restService.getFilter(id).queryList(request, extendingQuery, firstResult, maxResults);

    }

    @Override
    public CountResultDto executeCount(String id) {
        return restService.getFilter(id).executeCount();
    }
}
