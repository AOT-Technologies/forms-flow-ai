package org.camunda.bpm.extension.hooks.rest.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.camunda.bpm.extension.commons.connector.HTTPServiceInvoker;

import javax.annotation.Resource;
import java.util.Properties;

public abstract class AbstractRestService {

    protected String bpmUrl;
    protected String bpmClient;
    @Resource(name = "bpmObjectMapper")
    protected ObjectMapper bpmObjectMapper;
    protected final HTTPServiceInvoker httpServiceInvoker;

    public AbstractRestService(HTTPServiceInvoker httpServiceInvoker, Properties properties){
        this.httpServiceInvoker = httpServiceInvoker;
        if(properties != null) {
            this.bpmUrl = properties.getProperty("bpm.url");
            this.bpmClient = properties.getProperty("bpm.client");
        }
    }
}
