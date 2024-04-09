 
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux"; 
import Loading from "../../containers/Loading";
 import { useTranslation } from "react-i18next"; 
import { MULTITENANCY_ENABLED } from "../../constants/constants";
 
import {
  fetchDrafts,
} from "../../apiManager/services/draftService";
import Confirm from "../../containers/Confirm";
import Head from "../../containers/Head";
import { push } from "connected-react-router";
import {
  setDraftDelete,
  setDraftListLoading,
} from "../../actions/draftActions";
import { deleteDraftbyId } from "../../apiManager/services/draftService";
 import { toast } from "react-toastify";
import { textTruncate } from "../../helper/helper";
import DraftTable from "./DraftTable";

export const DraftList = React.memo(() => {
  const { t } = useTranslation();
   const countPerPage = useSelector((state) => state.draft.countPerPage);
  const draftDelete = useSelector((state) => state.draft?.draftDelete);

  const isDraftListLoading = useSelector(
    (state) => state.draft.isDraftListLoading
  );
  const applicationCount = useSelector(
    (state) => state.applications.applicationCount
  );
  const draftCount = useSelector((state) => state.draft.draftCount);
  const dispatch = useDispatch();
  const page = useSelector((state) => state.draft.activePage);
  const sortOrder = useSelector((state) => state.draft.sortOrder);
  const sortBy = useSelector((state) => state.draft.sortBy);
  const draftListSearchParams = useSelector(
    (state) => state.draft.searchParams
  );
 
   const tenantKey = useSelector((state) => state.tenants?.tenantId);
   const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
   let filterParams = {
      ...draftListSearchParams,
      page: page,
      limit: countPerPage,
      sortOrder,
      sortBy
  };

 

 
 

  useEffect(() => {
    dispatch(fetchDrafts(filterParams,() => {
  
      dispatch(setDraftListLoading(false));
     
    }));
  }, [dispatch, page, countPerPage,sortOrder,sortBy,draftListSearchParams]);

  const onYes = (e) => {
    e.currentTarget.disabled = true;
    deleteDraftbyId(draftDelete.draftId)
      .then(() => {
        toast.success(t("Draft Deleted Successfully"));
        dispatch(fetchDrafts(filterParams,(err,data) => {
          if(data){
          dispatch(setDraftListLoading(false));
          }
        }));
      })
      .catch((error) => {
        toast.error(error.message);
      })
      .finally(() => {
        dispatch(
          setDraftDelete({
            modalOpen: false,
            draftId: null,
            draftName: "",
          })
        );
      });
  };

  const onNo = () => {
    dispatch(
      setDraftDelete({
        modalOpen: false,
        draftId: null,
        draftName: "",
      })
    );
  };
  if (isDraftListLoading) {
    return <Loading />;
  }

 
  const headerList = () => {
    return [
      {
        name: "Submissions",
        count: applicationCount,
        onClick: () => dispatch(push(`${redirectUrl}application`)),
        icon: "list",
      },
      {
        name: "Drafts",
        count: draftCount,
        onClick: () => dispatch(push(`${redirectUrl}draft`)),
        icon: "edit",
      },
    ];
  };
  let headOptions = headerList();


 
  return (
    <>
     <Confirm
            modalOpen={draftDelete.modalOpen}
            message=
            {
            <div>
            {t("Are you sure to delete the draft")}
            <span className="fw-bold"> {draftDelete.draftName.includes(' ') ? draftDelete.draftName : textTruncate(50,40,draftDelete.draftName)} </span>
            {t("with ID")}
            <span className="fw-bold"> {draftDelete.draftId}</span> ?
            </div>
            }

            onNo={() => onNo()}
            onYes={onYes}
          />
    <Head items={headOptions} page="Drafts" />
    <DraftTable />
    </>
  );
});

export default DraftList;
