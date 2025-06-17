import { useSelector } from 'react-redux';

const userRoles = () => {
  const assignedRoles = useSelector((state) => state?.user?.roles || []);
  const role = (role) => assignedRoles.includes(role);

  return {
    createDesigns: role('create_designs'),
    viewDesigns: role('view_designs'),
    createSubmissions: role('create_submissions'),
    viewSubmissionHistory: role('submission_view_history'),
    viewSubmissions: role('view_submissions'),
    viewTasks: role('view_tasks'),
    manageTasks: role('manage_tasks'),
    manageAllFilters: role('manage_all_filters'),
    createFilters: role('create_filters'),
    viewFilters: role('view_filters'),
    viewDashboards: role('view_dashboards'),
    manageIntegrations: role('manage_integrations'),
    analyzeMetricsView: role('analyze_metrics_view'),
    analyzeSubmissionView: role('analyze_submissions_view'),
    manageDashBoardAuthorizations: role('manage_dashboard_authorizations'),
    manageRoles: role('manage_roles'),
    manageUsers: role('manage_users'),
    manageLinks: role('manage_links'),
    manageAdvancedWorkFlows: role('manage_advance_workflows'),
    reviewerViewHistory: role('reviewer_view_history'),
    analyzeSubmissionsViewHistory: role('analyze_submissions_view_history'),
  };
};

export default userRoles;
