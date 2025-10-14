import { addHiddenApplicationComponent } from "../../constants/applicationComponent";
import { addTenantkey } from "../../helper/helper";

export const manipulatingFormData = (
  form,
  MULTITENANCY_ENABLED,
  tenantKey,
  formAccess,
  submissionAccess
) => {
  const newFormData = addHiddenApplicationComponent(form);
  newFormData.submissionAccess = submissionAccess;
  newFormData.access = formAccess;
  if (MULTITENANCY_ENABLED && tenantKey) {
    if (newFormData.path && !newFormData.path.includes(tenantKey)) {
      newFormData.path = addTenantkey(newFormData.path, tenantKey);
    }
    if (newFormData.name && !newFormData.name.includes(tenantKey)) {
      newFormData.name = addTenantkey(newFormData.name, tenantKey);
    }
  }
  return newFormData;
};