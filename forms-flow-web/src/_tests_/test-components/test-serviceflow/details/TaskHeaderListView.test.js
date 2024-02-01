import TaskHeaderListView from "../../../../components/ServiceFlow/details/TaskHeaderListView";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

let store;
let mockStore = configureStore([]);

it("Should render the Taskheader component without breaking", async() => {
  store = mockStore({
    bpmTasks: {
      taskDetail: {
        id: "123",
        name: "Review Submission",
        assignee: null,
        created: "2021-12-22T11:16:28.523+0000",
        due: null,
        followUp: null,
        delegationState: null,
        description: null,
        owner: null,
        parentTaskId: null,
        priority: 50,
        taskDefinitionKey: "reviewer",
        caseExecutionId: null,
        caseInstanceId: null,
        caseDefinitionId: null,
        suspended: false,
        formKey: null,
        tenantId: null,
        applicationStatus: "New",
        formName: "test",
        submissionDate: "2021-12-22 11:16:28.217784",
        submitterName: "sample name",
        applicationId: 35,
      },
      taskId: "test-task-id",
      processList: [],
      taskGroups: [],
      selectedFilter: "",
      listReqParams: "",
      firstResult: "",
      vissibleAttributes:{
        taskVisibleAttributes:{
          applicationId:true,
          assignee:true,
          createdDate:true,
          dueDate:true,
          followUp:true,
          groups:true,
          priority:true,
          taskTitle:true,
        }
      },
    },
    
    user: {
      userDetail: {
        preferred_username: "",
      },
    },
  });
  store.dispatch = jest.fn();
  render(
    <Provider store={store}>
      <TaskHeaderListView />
    </Provider>
  );
  
  expect(screen.getByText("Follow up Date")).toBeInTheDocument();
  expect(screen.getByText("Due Date")).toBeInTheDocument();
  expect(screen.getByText("Assign to Me")).toBeInTheDocument();
  const claimbtn = screen.getByTestId("clam-btn");
  fireEvent.click(claimbtn);
  expect(store.dispatch.mock.calls).toHaveLength(2);
});
