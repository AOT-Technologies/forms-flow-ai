import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Translation } from "react-i18next";
import { Link } from "react-router-dom";
import { MULTITENANCY_ENABLED } from "../../constants/constants";
import Confirm from "../../containers/Confirm";
import { setDraftDelete } from "../../actions/draftActions";
import { deleteDraftbyId } from "../../apiManager/services/draftService";

const DraftOperations = ({ row }) => {
  const dispatch = useDispatch();
  const draftDelete = useSelector((state) => state.draft?.draftDelete);
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
  const url = `${redirectUrl}form/${row.formId}/draft/${row.id}/edit`;
  const buttonText = <Translation>{(t) => t("Edit")}</Translation>;
  const icon = "fa fa-edit";
  const deleteIcon = "fa fa-trash fa-lg delete_button";
  const deleteDraft = () => {
    dispatch(
      setDraftDelete({
        modalOpen: true,
        draftId: row.id,
      })
    );
  };
  const onYes = () => {
    dispatch(deleteDraftbyId(draftDelete.draftId));
  };
  const onNo = () => {
    dispatch(setDraftDelete({
      modalOpen :false,
      draftId:null
    }));
  };
  return (
    <>
      <Confirm
        modalOpen={draftDelete.modalOpen}
        message={`Are you sure you wish to delete the draft "${row.DraftName}"`}
        onNo={() => onNo()}
        onYes={() => onYes()}
      />
      <div>
        <Link to={url} style={{ textDecoration: "none" }}>
          <span style={{ color: "blue", cursor: "pointer" }}>
            <span>
              <i className={icon} />
              &nbsp;
            </span>
            {buttonText}
          </span>
        </Link>
        <span style={{ marginLeft: "2rem" }}>
          <span>
            <i className={deleteIcon} onClick={() => deleteDraft()} />
            &nbsp;
          </span>
        </span>
      </div>
    </>
  );
};

export default DraftOperations;
