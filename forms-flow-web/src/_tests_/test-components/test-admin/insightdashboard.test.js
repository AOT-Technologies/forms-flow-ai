import React from 'react'
import { render as rtlRender,fireEvent,screen,cleanup,waitFor } from '@testing-library/react'
import {InsightDashboard} from '../../../components/Admin/Insightdashboard'
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux'
import StoreService from '../../../services/StoreService'
import { initialState } from '../../../modules/dashboardReducer';
import { updatedState } from './constants';
import { act } from 'react-dom/test-utils';

const store = StoreService.configureStore();

  const render = Component=>rtlRender(
      <Provider store={store}>
          {Component}
      </Provider>
  )

  afterEach(()=>cleanup)

  test('renders the insightdashboard component with initial state',  () => {

    render(<InsightDashboard dashboardReducer={initialState} />)
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    expect(screen.getByTestId(/loading-component/i)).toBeInTheDocument();
  });  

  test('should render the table with dashboards and groups mapped',  () => {

    render(<InsightDashboard dashboardReducer={updatedState} />)
    expect(screen.getByText(/sample/i)).toBeInTheDocument();
    expect(screen.getByText(/Freedom of Information Form/i)).toBeInTheDocument();
    expect(screen.queryAllByText(/Add/i)).toHaveLength(2)
  });  

  test("should open up the popup once the add button is clicked",async()=>{
    render(<InsightDashboard dashboardReducer={updatedState} />)
    expect(screen.queryByTestId('popup-component')).not.toBeInTheDocument();
    const element = screen.getByTestId('1');
    act(()=>{
      fireEvent.click(element);
    })
    await waitFor(()=>screen.queryAllByTestId('popup-component'))

    expect(screen.getAllByTestId('popup-component')[0]).toBeInTheDocument();
  })

  test("should remove the group once the corresponding remove is clicked",async()=>{
    render(<InsightDashboard dashboardReducer={updatedState} />)
    expect(screen.getByTestId('samplegroup2')).toBeInTheDocument();
    const element = screen.getByTestId('samplegroup2');
    act(()=>{
      fireEvent.click(element);
    });
  });
