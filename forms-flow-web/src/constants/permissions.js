import { useSelector } from 'react-redux';

const userRoles = () => {
  const assignedRoles = useSelector((state) => state.user.roles || []);
  const role = (role) => assignedRoles.includes(role);

  return {
    createDesigns: role('create_designs'),
    viewDesigns: role('view_designs'),
    createBpmn: role('create_bpmn_flows'),
    manageSubflows: role('manage_subflows'),
    manageDmn: role('manage_decision_tables'),
    createSubmissions: role('create_submissions'),
    viewSubmissions: role('view_submissions'),
    viewTasks: role('view_tasks'),
    manageTasks: role('manage_tasks'),
    manageAllFilters: role('manage_all_filters'),
    createFilters: role('create_filters'),
    viewFilters: role('view_filters'),
    viewDashboards: role('view_dashboards'),
    manageIntegrations: role('manage_integrations'),
    admin: role('admin')
  };
};

export default userRoles;
