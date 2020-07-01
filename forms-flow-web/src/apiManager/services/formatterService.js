export const taskSubmissionFormatter = (taskSubmissionData) =>{
  const res = {};
  taskSubmissionData.forEach(taskSubmission => res[taskSubmission.name] = taskSubmission.value);
  return res;
}

export const insightDashboardFormatter = (dashboardsData) =>{
  const dashboards = dashboardsData.map(dashboard => {
    return  {value:dashboard.slug, label:dashboard.name}
  });
  return dashboards;
}
