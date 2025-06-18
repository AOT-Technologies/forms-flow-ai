import React, {useState} from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    setApplicationListActivePage,
    setCountPerpage,
    setFormSubmissionSort,
} from "../../../actions/applicationActions";
import LoadingOverlay from "react-loading-overlay-ts";
import { useTranslation } from "react-i18next";
import { CustomButton, TableFooter, NoDataFound, ConfirmModal } from "@formsflow/components";
import SortableHeader from '../../CustomComponents/SortableHeader';
import { toast } from "react-toastify";
import { deleteDraftbyId } from "../../../apiManager/services/draftService";
import { navigateToDraftEdit, navigateToViewSubmission } from "../../../helper/routerHelper";
import PropTypes from "prop-types";
import { formatDate } from "../../../helper/dateTimeHelper";


const SubmissionsAndDraftTable = ({ fetchSubmissionsAndDrafts }) => {
    const tenantKey = useSelector((state) => state.tenants?.tenantId);
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const {
        draftAndSubmissionsList,
        activePage: pageNo,
        countPerPage: limit,
        applicationCount: totalForms,
        sort: applicationSort
    } = useSelector((state) => state.applications);
    const searchFormLoading = useSelector(
        (state) => state.formCheckList.searchFormLoading
    );
    const isApplicationLoading = useSelector((state) =>
        state.applications.isApplicationLoading);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteDraftId, setDeleteDraftId] = useState('');
    const [isDeletionLoading, setIsDeletionLoading] = useState(false);

    const pageOptions = [
        { text: "5", value: 5 },
        { text: "25", value: 25 },
        { text: "50", value: 50 },
        { text: "100", value: 100 },
        { text: "All", value: totalForms },
    ];

    const handleSort = (key) => {
        const newSortOrder = applicationSort[key].sortOrder === "asc" ? "desc" : "asc";
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
        setDeleteDraftId(row.id);
        setShowDeleteModal(true);
    };

    const handleCloseActionModal = () => {
        setDeleteDraftId('');
        setShowDeleteModal(false);
    };

    const confirmDraftDelete = () => {
        setIsDeletionLoading(true);
        deleteDraftbyId(deleteDraftId)
            .then(() => {
                toast.success(t("Draft Deleted Successfully"));
                fetchSubmissionsAndDrafts();
            })
            .catch((error) => {
                toast.error(error.message);
            })
            .finally(() => { 
                setIsDeletionLoading(false);
                setShowDeleteModal(false);
            });
    };
    

    const viewSubmission = (item) => {
        navigateToViewSubmission(dispatch, tenantKey, item.formId, item.id);
    };

    const handlePageChange = (page) => {
        dispatch(setApplicationListActivePage(page));
    };

    const onSizePerPageChange = (limit) => {
        dispatch(setCountPerpage(limit));
        dispatch(setApplicationListActivePage(1));
    };




// **Extracted ternary logic into an independent variable**
const noDataMessage = !searchFormLoading ? (
    <NoDataFound
        message={t('No Submissions or Draft have been found. Create a new submission by clicking the "New Submission " button in the top right.')}
    />
) : null;

return (
    <LoadingOverlay active={isApplicationLoading} spinner text={t("Loading...")}>
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
                            <th className="w-20">
                                <SortableHeader
                                    columnKey="created"
                                    title="Submitted On"
                                    currentSort={applicationSort}
                                    handleSort={handleSort}
                                    className="gap-2"
                                />
                            </th>
                            <th className="w-20">
                                <SortableHeader
                                    columnKey="modified"
                                    title="Last Modified On"
                                    currentSort={applicationSort}
                                    handleSort={handleSort}
                                    className="gap-2"
                                />
                            </th>
                            <th className="w-12" colSpan="4">
                                <SortableHeader
                                    columnKey="type"
                                    title="Type"
                                    currentSort={applicationSort}
                                    handleSort={handleSort}
                                    className="gap-2"
                                />
                            </th>
                            <th className="w-12" colSpan="4">
                                <SortableHeader
                                    columnKey="applicationStatus"
                                    title="Status"
                                    currentSort={applicationSort}
                                    handleSort={handleSort}
                                    className="gap-2"
                                />
                            </th>
                            <th className="w-20" colSpan="4"></th>
                        </tr>
                    </thead>

                    {draftAndSubmissionsList?.applications?.length ? (
                        <tbody>
                            {draftAndSubmissionsList?.applications?.map((item) => (
                                <tr key={item.id}>
                                    <td className="w-20">
                                        <div className="d-flex">
                                            <span className="text-container">{item.id}</span>
                                        </div>
                                    </td>
                                    <td className="w-20">{formatDate(item.created)}</td>
                                    <td className="w-20">{formatDate(item.modified)}</td>
                                    <td className="w-12">
                                        <span className="d-flex align-items-center">
                                            {item.isDraft ? <span className="status-draft"></span> : <span className="status-live"></span>}
                                            {item.isDraft ? t("Draft") : t("Submission")}
                                        </span>
                                    </td>
                                    <td className="w-12">{item.isDraft ? "" : item.applicationStatus}</td>

                                    <td className="w-20 text-end">
                                        {item.isDraft ? (
                                            <div className="d-flex justify-content-end gap-2">
                                                <CustomButton
                                                    variant="secondary"
                                                    size="table"
                                                    label={t("Delete")}
                                                    onClick={() => deleteDraft(item)}
                                                    className="btn btn-secondary btn-table"
                                                    data-testid={
                                                        `delete-draft-button-${item.id}`
                                                    }
                                                    aria-label={t("Delete Draft")}
                                                />
                                                <CustomButton
                                                    variant="secondary"
                                                    size="table"
                                                    label={t("Continue")}
                                                    onClick={() => continueDraft(item)}
                                                    className="btn btn-secondary btn-table"
                                                    data-testid={
                                                        `continue-draft-button-${item.id}`
                                                    }
                                                    aria-label={t("Continue Draft edit")}
                                                />
                                            </div>
                                        ) : (
                                            <CustomButton
                                                variant="secondary"
                                                size="table"
                                                label={t("View")}
                                                onClick={() => viewSubmission(item)}
                                                className="btn btn-secondary btn-table"
                                            />
                                        )}
                                    </td>
                                </tr>
                            ))}
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
                    ) : noDataMessage}
                </table>
                
                <ConfirmModal
                show={showDeleteModal}
                primaryBtnAction={handleCloseActionModal}
                onClose={handleCloseActionModal}
                title={t("Are You Sure You Want to Delete This Draft?")}
                message={t("This action cannot be undone.")}
                secondayBtnAction={confirmDraftDelete}
                primaryBtnText={t("No, Keep This Draft")}
                secondaryBtnText={t("Yes, Delete this Draft")}
                secondoryBtndataTestid="yes-delete-button"
                primaryBtndataTestid="no-delete-button"
                primaryBtnariaLabel="No, Keep This Draft"
                secondoryBtnariaLabel="Yes, Delete this Draft"
                secondaryBtnDisable={isDeletionLoading}
                secondaryBtnLoading={isDeletionLoading}
            />
            </div>
        </div>
    </LoadingOverlay>
);
};

SubmissionsAndDraftTable.propTypes = {
    fetchSubmissionsAndDrafts: PropTypes.func.isRequired,
};

export default SubmissionsAndDraftTable;