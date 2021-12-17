import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import {Provider} from "react-redux";
import { appState } from "../../test-redux-states/redux-state-sample";
import Insights from '../../../components/Insights/Insights';
import StoreService from '../../../services/StoreService';
import { mock1 } from './constant';
const store = StoreService.configureStore();

test('Render Insight  Component with insights prop passed', () => {

    render(<Provider store={store}><Insights isDashboardLoading={appState.insights.isDashboardLoading}
        isInsightLoading={appState.insights.isInsightLoading}
        dashboards={appState.insights.dashboardsList}
        activeDashboard={appState.insights.dashboardDetail}/>
        </Provider>);
        expect(screen.getByTestId('loading-component')).toBeInTheDocument();

});
test('Render Insight  Component with insights prop passed', () => {
    render(<Provider store={store}><Insights isDashboardLoading={mock1.isDashboardLoading}
        isInsightLoading={mock1.isInsightLoading}
        dashboards={mock1.dashboardsList}
        activeDashboard={mock1.dashboardDetail}/>
        </Provider>);
});
