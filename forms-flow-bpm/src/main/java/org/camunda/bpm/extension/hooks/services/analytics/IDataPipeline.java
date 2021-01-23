package org.camunda.bpm.extension.hooks.services.analytics;

import com.fasterxml.jackson.core.JsonProcessingException;

import java.util.Map;


/**
 * Interface to implement the data pipeline for publishing analytics to downstream.
 *
 * @author sumathi.thirumani@aot-technologies.com
 */
public interface IDataPipeline {

   enum ResponseStatus {
      SUCCESS("Analytics data pipeline successful"),
      FAILURE("Analytics data pipeline failure");

      private final String message;

      ResponseStatus(String message) {
         this.message = message;
      }

      public String getMessage() {
         return message;
      }
   }

   Map<String,Object> execute(Map<String, Object> variables) throws JsonProcessingException;
}
