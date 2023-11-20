package org.camunda.bpm.extension.hooks.rest.impl;

import org.camunda.bpm.engine.rest.FilterRestService;
import org.camunda.bpm.engine.rest.dto.CountResultDto;
import org.camunda.bpm.engine.rest.dto.runtime.FilterDto;
import org.camunda.bpm.extension.hooks.rest.FilterRestResource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.hateoas.EntityModel;

import javax.ws.rs.core.Request;
import javax.ws.rs.core.UriInfo;
import java.util.List;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

public class FilterRestResourceImpl implements FilterRestResource {

    private static final Logger LOG = LoggerFactory.getLogger(FilterRestResourceImpl.class);

    private final FilterRestService restService;

    public FilterRestResourceImpl(FilterRestService filterRestService) {
        restService = filterRestService;
    }

    @Deprecated
    @Override
    public List<FilterDto> getFilters(UriInfo uriInfo, Boolean itemCount, Integer firstResult, Integer maxResults) {
        return restService.getFilters(uriInfo, itemCount, firstResult, maxResults);
    }

    @Deprecated
    @Override
    public Object executeList(Request request, Integer firstResult, Integer maxResults, String id) {
        return restService.getFilter(id).executeList(request, firstResult, maxResults);

    }

    @Deprecated
    @Override
    public Object queryList(Request request, String extendingQuery, Integer firstResult, Integer maxResults, String id) {
        return restService.getFilter(id).queryList(request, extendingQuery, firstResult, maxResults);

    }

    @Deprecated
    @Override
    public EntityModel<CountResultDto> executeCount(String id) {
        CountResultDto dto = restService.getFilter(id).executeCount();
        return EntityModel.of(dto, linkTo(methodOn(FilterRestResourceImpl.class).executeCount(id)).withSelfRel().withSelfRel());
    }
}
