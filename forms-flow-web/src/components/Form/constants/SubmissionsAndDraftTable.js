import React from "react";
import { useDispatch, useSelector, } from "react-redux";
import {
    setApplicationListActivePage,
    // setApplicationLoading,
    // setApplicationSortBy,
    // setApplicationSortOrder,
    setCountPerpage,
    setFormSubmissionSort,
} from "../../../actions/applicationActions";
import LoadingOverlay from "react-loading-overlay-ts";
import { useTranslation, Translation } from "react-i18next";
import { HelperServices } from "@formsflow/service";
import { CustomButton, TableFooter, NoDataFound } from "@formsflow/components";
// import userRoles from "../../../constants/permissions";
import SortableHeader from '../../CustomComponents/SortableHeader';
import { toast } from "react-toastify";
import { deleteDraftbyId } from "../../../apiManager/services/draftService";
import { navigateToDraftEdit } from "../../../helper/routerHelper";



const SubmissionsAndDraftTable = ({ fetchSubmissionsAndDrafts }) => {
    const tenantKey = useSelector((state) => state.tenants?.tenantId);
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const draftAndSubmissionsList = useSelector((state) =>
        state.applications.draftAndSubmissionsList);
    const pageNo = useSelector((state) => state.applications?.activePage);
    const limit = useSelector((state) => state.applications?.countPerPage);
    const totalForms = useSelector(
        (state) => state.applications?.applicationCount
    );
    const applicationSort = useSelector((state) => state.applications.sort);
    const searchFormLoading = useSelector(
        (state) => state.formCheckList.searchFormLoading
    );
    const isApplicationCountLoading = useSelector((state) =>
        state.process.isApplicationCountLoading);

    const pageOptions = [
        {
            text: "5",
            value: 5,
        },
        {
            text: "25",
            value: 25,
        },
        {
            text: "50",
            value: 50,
        },
        {
            text: "100",
            value: 100,
        },
        {
            text: "All",
            value: totalForms,
        },
    ];

    const handleSort = (key) => {
        const newSortOrder = applicationSort[key].sortOrder === "asc" ? "desc" : "asc";
        // Reset all other columns to default (ascending) except the active one
        const updatedSort = Object.keys(applicationSort).reduce((acc, columnKey) => {
            acc[columnKey] = { sortOrder: columnKey === key ? newSortOrder : "asc" };
            return acc;
        }, {});

        dispatch(setFormSubmissionSort({
            ...updatedSort,
            activeKey: key,
        }));
    };

    const continueDraft = (row) => {
        navigateToDraftEdit(dispatch, tenantKey, row.formId, row.id);
    };

    const deleteDraft = (row) => {
        deleteDraftbyId(row.id)
            .then(() => {
                toast.success(t("Draft Deleted Successfully"));
                fetchSubmissionsAndDrafts();
            })
            .catch((error) => {
                toast.error(error.message);
            });
    };


    const viewOrEditForm = () => {
        console.log("set veiw here");
        //TBD: Redirect to view. 
    };

    const handlePageChange = (page) => {
        dispatch(setApplicationListActivePage(page));
    };

    const onSizePerPageChange = (limit) => {
        dispatch(setCountPerpage(limit));
        dispatch(setApplicationListActivePage(1));
    };

    return (
        <LoadingOverlay active={searchFormLoading || isApplicationCountLoading} spinner text={t("Loading...")}>
            <div className="min-height-400">
                <div className="custom-tables-wrapper-application">
                    <table className="table custom-tables table-responsive-sm mb-0">
                        <thead className="table-header">
                            <tr>
                                <th className="w-20">
                                    <SortableHeader
                                        columnKey="id"
                                        title="Submission ID"
                                        currentSort={applicationSort}
                                        handleSort={handleSort}
                                        className="gap-2"
                                    />
                                </th>
                                <th className="w-13" scope="col">
                                    <SortableHeader
                                        columnKey="created"
                                        title="Submited On"
                                        currentSort={applicationSort}
                                        handleSort={handleSort}
                                        className="gap-2"
                                    />
                                </th>
                                <th className="w-20" scope="col">
                                    <SortableHeader
                                        columnKey="modified"
                                        title="Last Modified On"
                                        currentSort={applicationSort}
                                        handleSort={handleSort}
                                        className="gap-2" />
                                </th>
                                <th className="w-12" scope="col" colSpan="4">
                                    <SortableHeader
                                        columnKey="type"
                                        title="Type"
                                        currentSort={applicationSort}
                                        handleSort={handleSort}
                                        className="gap-2" />
                                </th>
                                <th className="w-12" scope="col" colSpan="4">
                                    <SortableHeader
                                        columnKey="applicationStatus"
                                        title="Status"
                                        currentSort={applicationSort}
                                        handleSort={handleSort}
                                        className="gap-2" />
                                </th>
                                <th className="w-20" colSpan="4" aria-label="Search Forms by form title"></th>
                            </tr>
                        </thead>

                        {draftAndSubmissionsList?.applications?.length ? (
                            <tbody>
                                {draftAndSubmissionsList?.applications?.map((item, index) => {
                                    return (
                                        <tr key={index}>
                                            <td className="w-20">
                                                <div className="d-flex">
                                                    <span className="text-container">{item.id}</span>
                                                </div>
                                            </td>
                                            <td className="w-13">{HelperServices?.getLocaldate(item.created)}</td>
                                            <td className="w-20">{item.modified}</td>
                                            <td className="w-12">
                                                <span data-testid={`form-status-${item._id}`} className="d-flex align-items-center">
                                                    {item.isDraft === true ? (
                                                        <span className="status-draft"></span>
                                                    ) : (
                                                        <span className="status-live"></span>
                                                    )}
                                                    {item.isDraft === true ? t("Draft") : t("Submission")}
                                                </span>
                                            </td>
                                            <td className="w-12">{item.applicationStatus}</td>

                                            <td className="w-20 text-end">
                                                {item.isDraft === true ? (
                                                    <div className="d-flex justify-content-end gap-2">
                                                        <CustomButton
                                                            variant="secondary"
                                                            size="sm"
                                                            label={t("Delete")}
                                                            onClick={() => deleteDraft(item)}
                                                            className="btn btn-secondary btn-table"
                                                            dataTestId={
                                                                `draft-delete-button-${item._id}`
                                                            }
                                                            ariaLabel="Delete Draft Button"
                                                        />
                                                        <CustomButton
                                                            variant="secondary"
                                                            size="sm"
                                                            label={t("Continue")}
                                                            onClick={() => continueDraft(item)}
                                                            className="btn btn-secondary btn-table"
                                                            dataTestId={
                                                                `draft-continue-button-${item._id}`
                                                            }
                                                            ariaLabel="Continue Draft Button"
                                                        />
                                                    </div>
                                                ) : (<CustomButton
                                                    variant="secondary"
                                                    size="sm"
                                                    label={
                                                        <Translation>
                                                            {(t) => t("View")}
                                                        </Translation>
                                                    }
                                                    onClick={() => viewOrEditForm()}
                                                    className="btn btn-secondary btn-table"
                                                    dataTestId={`form-view-button-${item._id}`}
                                                    ariaLabel="Form view button"
                                                />)}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {draftAndSubmissionsList?.applications?.length ? (
                                    <TableFooter
                                        limit={limit}
                                        activePage={pageNo}
                                        totalCount={totalForms}
                                        handlePageChange={handlePageChange}
                                        onLimitChange={onSizePerPageChange}
                                        pageOptions={pageOptions}
                                    />
                                ) : (
                                    <td colSpan={3}></td>
                                )}
                            </tbody>
                        ) : !searchFormLoading ? (
                            <NoDataFound
                                message={t('No forms have been found. Create a new form by clicking the "New Form" button in the top right.')}
                            />
                        ) : null}
                    </table>
                </div>
            </div>
        </LoadingOverlay>
    );
};

export default SubmissionsAndDraftTable;
