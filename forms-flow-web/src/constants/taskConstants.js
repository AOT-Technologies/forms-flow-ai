import { Translation } from "react-i18next";

export const TASK_FILTER_LIST_DEFAULT_PARAM = {sortBy: "created",
    sortOrder: "desc",
   label:<Translation>{(t)=>t("Created")}</Translation>
  };

const DEFAULT_WORKFLOW_PROCESS_KEY = "Defaultflow";
export const DEFAULT_WORKFLOW = {label: 'Default Flow', value: DEFAULT_WORKFLOW_PROCESS_KEY};

