 
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux"; 
import Loading from "../../containers/Loading";
 import { useTranslation } from "react-i18next"; 
 
import {
  fetchDrafts,
} from "../../apiManager/services/draftService";
import Confirm from "../../containers/Confirm";
import Head from "../../containers/Head";
import {
  setDraftDelete,
  setDraftListLoading,
} from "../../actions/draftActions";
import { deleteDraftbyId } from "../../apiManager/services/draftService";
 import { toast } from "react-toastify";
import { textTruncate } from "../../helper/helper";
import DraftTable from "./DraftTable";
import {navigateToSubmitFormsListing, navigateToSubmitFormsDraft, navigateToSubmitFormsApplication} from "../../helper/routerHelper";

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

  const navigateToSubmitFormsRoute = () => {
    navigateToSubmitFormsListing(dispatch);
  };

  const navigateToSubmitFormsDraftRoute = () => {
    navigateToSubmitFormsDraft(dispatch);
  };
  const navigateToSubmitFormsApplicationRoute = () => {
    navigateToSubmitFormsApplication(dispatch);
  };
  const headerList = () => {
    return [
      {
        name: "All Forms",
        onClick: () => navigateToSubmitFormsRoute()//dispatch(push(`${redirectUrl}form`)),
      },
      {
        name: "Submissions",
        count: applicationCount,
        onClick: () => navigateToSubmitFormsApplicationRoute(),
      },
      {
        name: "Drafts",
        count: draftCount,
        onClick: () => navigateToSubmitFormsDraftRoute(),
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
