export const dashboard = {
  id: 2,
  name: "sample",
  approvedGroups: [{ name: "group2", id: "group2id" }],
};

export const groups = [
  {
    id: "group2id",
    name: "group2",
    path: "/formsflow/formsflow-reviewer/redash/group2",
    subGroups: [],
    dashboards: [{ 2: "sample" }, { 1: "Freedom of Information Form" }],
  },
  {
    id: "group3id",
    name: "group3",
    path: "/formsflow/formsflow-reviewer/redash/group3",
    subGroups: [],
    dashboards: [{ 2: "sample" }],
  },
];

export const groups1 = [
  {
    id: "group1id",
    name: "group2",
    path: "/formsflow/formsflow-reviewer/redash/group2",
    subGroups: [],
    dashboards: [],
  },
  {
    id: "group3id",
    name: "group3",
    path: "/formsflow/formsflow-reviewer/redash/group3",
    subGroups: [],
    dashboards: [],
  },
];

export const approvedGroups = [
  { name: "group2", id: "group2id" },
  { name: "group3", id: "group3id" },
];

export const updatedState = {
  dashboards: [
    {
      id: 2,
      name: "sample",
    },
    {
      id: 1,
      name: "Freedom of Information Form",
    },
  ],
  isloading: false,
  iserror: false,
  groups: [
    {
      id: "group1id",
      name: "group1",
    },
    {
      id: "group2id",
      name: "group2",
    },
    { id: "group3id", name: "group3" },
    { id: "group4id", name: "group4" },
    {
      id: "group5id",
      name: "group5",
    },
    { id: "group6id", name: "group6" },
  ],
  authorizations: [
    {
      resourceId: "2",
      resourceDetails: {
        name: "sample",
      },
      roles: ["group1", "group2"],
    },
  ],
  authDashBoards: [
    {
      resourceId: "2",
      resourceDetails: {
        name: "sample",
      },
      roles: ["group1", "group2"],
    },
    {
      resourceId: "1",
      resourceDetails: { name: "Freedom of Information Form" },
      roles: [],
    },
  ],
  isDashUpdated: true,
  isGroupUpdated: true,
  isAuthRecieved: true,
  isAuthUpdated: true,
};
