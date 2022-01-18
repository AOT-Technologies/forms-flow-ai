import AddGroupModal from '../../../../components/ServiceFlow/details/AddGroupModal'
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux'
import { fireEvent, render,screen } from '@testing-library/react'

import '@testing-library/jest-dom/extend-expect';


let store;
let mockStore = configureStore([]);


it("Should render the tasklist component without breaking",()=>{
    store = mockStore({
        bpmTasks:{
            taskId:123,
            isGroupLoading:false
        }
    })
    store.dispatch = jest.fn()
    render(
    <Provider store={store}>
        <AddGroupModal modalOpen={true} groups={
   [ {"userId": null,
    "groupId": "formsflow/formsflow-reviewer",
    "type": "candidate"}]
    }/>
      </Provider> )
    expect(screen.getByText("Add a group")).toBeInTheDocument();
    expect(screen.getByText("Manage Groups")).toBeInTheDocument();
    expect(screen.getByText("You can add a group by typing a group ID into the input field and afterwards clicking the button with the plus sign.")).toBeInTheDocument();
    expect(screen.getByText("Close")).toBeInTheDocument();
    expect(screen.getByText("formsflow/formsflow-reviewer")).toBeInTheDocument();
    const element = screen.getByTestId("remove-btn");
    fireEvent.click(element);
    expect(store.dispatch.mock.calls).toHaveLength(2)
    const ip = screen.getByTestId("Group ID");
    fireEvent.change(ip,{target:{value:"test-group-id"}});
    const addbtn = screen.getByText("Add a group");
    fireEvent.click(addbtn);
    expect(store.dispatch.mock.calls).toHaveLength(4)

})