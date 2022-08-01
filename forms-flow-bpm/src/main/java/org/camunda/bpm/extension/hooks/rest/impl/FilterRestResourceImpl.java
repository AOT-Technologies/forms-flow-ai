package org.camunda.bpm.extension.hooks.rest.impl;

import org.camunda.bpm.engine.rest.FilterRestService;
import org.camunda.bpm.engine.rest.dto.CountResultDto;
import org.camunda.bpm.engine.rest.dto.runtime.FilterDto;
import org.camunda.bpm.extension.hooks.rest.FilterRestResource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.hateoas.CollectionModel;
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

    @Override
    public CollectionModel<FilterDto> getFilters(UriInfo uriInfo, Boolean itemCount, Integer firstResult, Integer maxResults) {
        List<FilterDto> filters = restService.getFilters(uriInfo, itemCount, firstResult, maxResults);
        return CollectionModel.of(filters,
                linkTo(methodOn(FilterRestResourceImpl.class).getFilters(uriInfo, itemCount, firstResult, maxResults)).withSelfRel().withSelfRel());
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
    public EntityModel<CountResultDto> executeCount(String id) {
        CountResultDto dto = restService.getFilter(id).executeCount();
        return EntityModel.of(dto, linkTo(methodOn(FilterRestResourceImpl.class).executeCount(id)).withSelfRel().withSelfRel());
    }

    @Override
    public EntityModel<CountResultDto> queryCount(String extendingQuery, String id) {
        CountResultDto dto = restService.getFilter(id).queryCount(extendingQuery);
        return  EntityModel.of(dto, linkTo(methodOn(FilterRestResourceImpl.class).queryCount(extendingQuery, id)).withSelfRel().withSelfRel());
    }

    @Override
    public EntityModel<CountResultDto> getFiltersCount(UriInfo uriInfo) {
        CountResultDto dto = restService.getFiltersCount(uriInfo);
        return EntityModel.of(dto, linkTo(methodOn(FilterRestResourceImpl.class).getFiltersCount(uriInfo)).withSelfRel().withSelfRel());
    }
}
