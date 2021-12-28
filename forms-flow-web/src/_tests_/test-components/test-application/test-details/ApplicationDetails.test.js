import React from 'react';
import { render, screen, configure } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import startCase from "lodash/startCase";
import ApplicationDetails from '../../../../components/Application/Details/ApplicationDetails';
import {getLocalDateTime} from "../../../../apiManager/services/formatterService";
import Details from "../../../../components/Application/Details";
import {useSelector} from "react-redux";
import {mockApplication1, mockApplication2} from "./constant";
import { appState } from "../../../test-redux-states/redux-state-sample";

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
  useSelector: jest.fn()
}));


//<Details application={applicationDetail}/>
beforeAll(() => configure({testIdAttribute: 'id'}));
afterEach(() => {
  useSelector.mockClear();
});

test('Render Application Detail Component with application prop passed', () => {
    render(<ApplicationDetails application={mockApplication1}/>);
    expect(screen.getByText('Application Id'));
    expect(screen.getByText('Application Name'));
    expect(screen.getByText('Created By'));
    expect(screen.getByText('Application Status'));
    expect(screen.getByText('Submitted On'));
    expect(screen.getByText('Modified On'));
});

test('Render Detail Component with application prop passed', () => {
  useSelector.mockImplementation((callback) => callback(appState));
  const {rerender} = render(<Details application={mockApplication1}/>);
  expect(screen.queryByText('Loading...')).toBeNull()
  expect(screen.getByText('Application Id'));
  expect(screen.getByTestId('application-id')).toHaveTextContent(mockApplication1.id);
  expect(screen.getByText('Application Name'));
  expect(screen.getByText('Created By'));
  expect(screen.getByText('Application Status'));
  expect(screen.getByText('Submitted On'));
  expect(screen.getByText('Modified On'));

  /** Test isApplicationDetailLoading true  condition**/

  const changeLoadingState = {...appState.applications,...{isApplicationDetailLoading:true}}
  const newState = {...appState,...{applications:changeLoadingState}}
  useSelector.mockImplementation((callback) => callback(newState));

  rerender(<Details application={mockApplication2}/>)
  expect(screen.getByText('Loading...'));
  expect(screen.queryByText('Loading...')).not.toBeNull();
  expect(screen.getByTestId('application-id')).toHaveTextContent(mockApplication2.id);
});

test('calling render Application Detail with different Props', () => {
  const {rerender} = render(<ApplicationDetails application={mockApplication1}/>);
  expect(screen.getByTestId('application-id')).toHaveTextContent(mockApplication1.id);
  expect(screen.getByTestId('application-name')).toHaveTextContent(startCase(mockApplication1.applicationName));
  expect(screen.getByTestId('application-status')).toHaveTextContent(mockApplication1.applicationStatus);
  expect(screen.getByTestId('created-by')).toHaveTextContent(mockApplication1.createdBy);
  expect(screen.getByTestId('application-created')).toHaveTextContent(getLocalDateTime(mockApplication1.created));
  expect(screen.getByTestId('application-modified')).toHaveTextContent(getLocalDateTime(mockApplication1.modified));

  // re-render the same component with different props
  rerender(<ApplicationDetails application={mockApplication2}/>)
  expect(screen.getByTestId('application-id')).toHaveTextContent(mockApplication2.id);
  expect(screen.getByTestId('application-name')).toHaveTextContent(startCase(mockApplication2.applicationName));
  expect(screen.getByTestId('application-status')).toHaveTextContent(mockApplication2.applicationStatus);
  expect(screen.getByTestId('created-by')).toHaveTextContent(mockApplication2.createdBy);
  expect(screen.getByTestId('application-created')).toHaveTextContent(getLocalDateTime(mockApplication2.created));
  expect(screen.getByTestId('application-modified')).toHaveTextContent(getLocalDateTime(mockApplication2.modified));
});
