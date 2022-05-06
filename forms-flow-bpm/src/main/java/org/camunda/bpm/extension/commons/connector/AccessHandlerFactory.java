package org.camunda.bpm.extension.commons.connector;


import org.camunda.bpm.extension.commons.connector.support.IAccessHandler;

/**
 * Access Handler Factory.
 * Factory Definition for getting appropriate access handlers based on the service id.
 */
public interface AccessHandlerFactory  {

    IAccessHandler getService(String serviceName);

}
