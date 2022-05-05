package org.camunda.bpm.extension.process;

import org.camunda.bpm.engine.runtime.ProcessInstance;
import org.camunda.bpm.engine.test.Deployment;
import org.camunda.bpm.engine.test.ProcessEngineTestCase;
import org.junit.Test;

import static org.camunda.bpm.engine.test.assertions.bpmn.AbstractAssertions.processEngine;
import static org.camunda.bpm.engine.test.assertions.bpmn.BpmnAwareTests.assertThat;
import static org.camunda.bpm.engine.test.assertions.bpmn.BpmnAwareTests.complete;
import static org.camunda.bpm.engine.test.assertions.bpmn.BpmnAwareTests.task;

/**
 * Sample Workflow Test.
 * Test class for SampleWorkflow.
 */

public class SampleWorkflowTest  extends ProcessEngineTestCase {

    private static final String PROCESS_DEFINITION_KEY = "testworkflow";

    @Deployment(resources = "test-workflow.bpmn")
    public void testDeployment(){

    }

    @Test
    @Deployment(resources = "test-workflow.bpmn")
    public void testHappyPath() {
        ProcessInstance processInstance = processEngine().getRuntimeService().startProcessInstanceByKey(PROCESS_DEFINITION_KEY);
        assertThat(processInstance).isStarted();
        assertThat(task(processInstance)).isNotNull();
        complete(task(processInstance));
        assertThat(processInstance).isEnded();
    }
}
