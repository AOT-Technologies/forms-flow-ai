import { addHiddenApplicationComponent } from "../../constants/applicationComponent";
import { addTenankey } from "../../helper/helper";

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
    if (newFormData.path) {
      newFormData.path = addTenankey(newFormData.path, tenantKey);
    }
    if (newFormData.name) {
      newFormData.name = addTenankey(newFormData.name, tenantKey);
    }
  }
  return newFormData;
};
