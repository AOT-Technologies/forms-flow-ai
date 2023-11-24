import { Translation } from "react-i18next";

export const TASK_FILTER_LIST_DEFAULT_PARAM = {
  sortBy: "created",
  sortOrder: "desc",
  label: <Translation>{(t) => t("Created")}</Translation>,
};

const DEFAULT_WORKFLOW_PROCESS_KEY = "Defaultflow";
export const DEFAULT_WORKFLOW = {
  label: "Default Flow",
  value: DEFAULT_WORKFLOW_PROCESS_KEY,
};

export const ACCESSIBLE_FOR_ALL_GROUPS = 'Accessible for all users';
export const PRIVATE_ONLY_YOU = 'Private (Only You)';
export const SPECIFIC_USER_OR_GROUP = 'Specific User/ Group';
