package org.camunda.bpm.extension.process;

import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import static org.camunda.bpm.engine.test.assertions.bpmn.BpmnAwareTests.assertThat;

import static org.camunda.bpm.extension.commons.utils.VariableConstants.APPLICATION_ID;
/**
 * One Step Approval Test.
 * Test class for OneStepApproval.
 */
@ExtendWith(SpringExtension.class)
public class OneStepApprovalTest /*extends ProcessEngineTestCase*/ {


    /*private static final String PROCESS_DEFINITION_KEY = "onestepapproval";

    @Mock
    private HTTPServiceInvoker httpServiceInvoker;

    @Mock
    private ApplicationAuditListener applicationAuditListener;

    @BeforeEach
    public void setup() {
        // set up java delegate to use the mocked tweet service
        ApplicationStateListener applicationStateListener = new ApplicationStateListener();
        ReflectionTestUtils.setField(applicationStateListener, "httpServiceInvoker", this.httpServiceInvoker);
        ReflectionTestUtils.setField(applicationStateListener, "applicationAuditListener", this.applicationAuditListener);
        // register a bean name with mock expression manager
        Mocks.register("httpServiceInvoker", this.httpServiceInvoker);
        Mocks.register("applicationStateListener", applicationStateListener);
    }

    @AfterAll
    static void teardown() {
        Mocks.reset();
    }

    @Deployment(resources = "one-step-approval.bpmn")
    public void testDeployment(){

    }*/

/*    @Test
    @Deployment(resources = "one-step-approval.bpmn")
    public void testHappyPath() {

        ProcessInstance processInstance = processEngine().getRuntimeService().startProcessInstanceByKey(PROCESS_DEFINITION_KEY
        ,withVariables(APPLICATION_ID, "id1"));
        assertThat(processInstance).isStarted()
                ;
        *//*complete(task(), withVariables("approved", true));
        assertThat(processInstance).isWaitingAt("bookVacationUserTask");
        complete(task());*//*
        assertThat(processInstance).isEnded();
    }*/
}
