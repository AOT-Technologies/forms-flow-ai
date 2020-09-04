package org.camunda.bpm.extension.commons.connector;


import org.camunda.bpm.extension.commons.connector.support.IAccessHandler;

/**
 * Factory Definition for getting appropriate access handlers based on the service id.
 *
 * @author sumathi.thirumani@aot-technologies.com
 */
public interface AccessHandlerFactory  {

    IAccessHandler getService(String serviceName);

}
