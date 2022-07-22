export const setFormAndSubmissionAccess = (type, data) => {
  let ROLE = {};
  data.forEach((i) => {
    if (i.type !== "RESOURCE_ID" || i.type !== "ANONYMOUS") {
      ROLE[i.type] = i.roleId;
    }
  });

  if (ROLE.DESIGNER === undefined) {
    return [];
  }
  const CLIENT_ID = ROLE.CLIENT;
  const DESIGNER_ID = ROLE.DESIGNER;
  const REVIEWER_ID = ROLE.REVIEWER;
  switch (type) {
    case "formAccess":
      return [
        {
          type: "read_all",
          roles: [CLIENT_ID, DESIGNER_ID, REVIEWER_ID],
        },
        {
          type: "update_all",
          roles: [DESIGNER_ID],
        },
        {
          type: "delete_all",
          roles: [DESIGNER_ID],
        },
      ];
    case "submissionAccess":
      return [
        {
          roles: [DESIGNER_ID],
          type: "create_all",
        },
        {
          roles: [REVIEWER_ID],
          type: "read_all",
        },
        {
          roles: [REVIEWER_ID],
          type: "update_all",
        },
        {
          roles: [DESIGNER_ID, REVIEWER_ID],
          type: "delete_all",
        },
        {
          roles: [CLIENT_ID],
          type: "create_own",
        },
        // {
        //   roles: [CLIENT_ID],
        //   type: "create_own",
        // },
        {
          roles: [CLIENT_ID],
          type: "read_own",
        },
        {
          roles: [CLIENT_ID],
          type: "update_own",
        },
        {
          roles: [REVIEWER_ID],
          type: "delete_own",
        },
      ];
    default:
      break;
  }
};
