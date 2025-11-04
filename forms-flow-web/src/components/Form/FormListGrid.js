import React, { useMemo, useCallback, forwardRef, memo } from "react";
import Paper from "@mui/material/Paper";
import { DataGrid } from "@mui/x-data-grid";
import { useTranslation } from "react-i18next";
import { RefreshIcon, V8CustomButton, V8CustomDropdownButton, NewSortDownIcon } from "@formsflow/components";
import { StyleServices } from "@formsflow/service";
import PropTypes from "prop-types";

/**
 * Generic DataGrid wrapper for forms/processes listing.
 * Accepts all data and handlers as props to keep it page-agnostic.
 */
const FormListGrid = forwardRef(function FormListGrid(
  {
    columns = [],
    rows = [],
    rowCount = 0,
    loading = false,
    sortModel = [],
    onSortModelChange,
    paginationModel,
    onPaginationModelChange,
    getRowId = (row) => row.id,
    pageSizeOptions = [10, 25, 50, 100],
    rowHeight = 55,
    disableColumnMenu = true,
    disableRowSelectionOnClick = true,
    sx = { height: { sm: 400, md: 510, lg: 665 }, width: "100%" },
    disableColumnResize = false,
    onRefresh,
    // Action column props
    dropdownItems = [],
    isDuplicating = false,
    onActionLabelClick,
    // Legacy props for backward compatibility
    onSubmitSelect,
    onDesignerEdit,
    onProcessEdit,
    canProcessEdit,
  },
  ref
) {
  const { t } = useTranslation();
  const iconColor = StyleServices.getCSSVariable("--ff-gray-medium-dark");

  // Default sort icons for DataGrid
  const defaultSlots = useMemo(
    () => ({
      columnSortedDescendingIcon: () => (
        <div style={{ color: iconColor, fill: iconColor }}>
          <NewSortDownIcon color={iconColor} />
        </div>
      ),
      columnSortedAscendingIcon: () => (
        <div style={{ transform: "rotate(180deg)", color: iconColor, fill: iconColor }}>
          <NewSortDownIcon color={iconColor} />
        </div>
      ),
    }),
    [iconColor]
  );

  // Safe dropdown items - support both array and function
  const getDropdownItems = useCallback((row) => {
    if (typeof dropdownItems === "function") {
      const items = dropdownItems(row);
      return Array.isArray(items) ? items : [];
    }
    if (Array.isArray(dropdownItems)) {
      return dropdownItems;
    }
    return [];
  }, [dropdownItems]);

  // Enhance columns with refresh button and action handlers
  const effectiveColumns = useMemo(() => {
    return (columns || []).map((col) => {
      // Inject refresh button into header if onRefresh is provided
      if (col?.field === "actions" && !col?.renderHeader && onRefresh) {
        col = {
          ...col,
          renderHeader: () => (
            <V8CustomButton
              variant="secondary"
              icon={<RefreshIcon color={iconColor} />}
              iconOnly
              onClick={onRefresh}
            />
          ),
        };
      }

      // Inject row-level action buttons if no custom renderCell exists
      if (col?.field === "actions" && !col?.renderCell) {
        col = {
          ...col,
          renderCell: (params) => {
            // Use dropdown if dropdownItems provided
            const rowDropdownItems = getDropdownItems(params.row);
            if (rowDropdownItems.length > 0) {
              return (
                <V8CustomDropdownButton
                  label={t("Edit")}
                  variant="secondary"
                  menuPosition="right"
                  dropdownItems={rowDropdownItems}
                  disabled={isDuplicating}
                  onLabelClick={() => {
                    if (typeof onActionLabelClick === "function") {
                      onActionLabelClick(params.row);
                    } else if (typeof onDesignerEdit === "function") {
                      onDesignerEdit(params.row);
                    } else if (typeof onProcessEdit === "function" && canProcessEdit) {
                      onProcessEdit(params.row);
                    }
                  }}
                />
              );
            }

            // Fallback to simple buttons based on provided handlers
            if (typeof onSubmitSelect === "function") {
              return (
                <V8CustomButton
                  label={t("Select")}
                  variant="secondary"
                  onClick={() => onSubmitSelect(params.row)}
                />
              );
            }
            if (typeof onDesignerEdit === "function") {
              return (
                <V8CustomButton
                  label={t("Edit")}
                  variant="secondary"
                  onClick={() => onDesignerEdit(params.row)}
                />
              );
            }
            if (typeof onProcessEdit === "function" && canProcessEdit) {
              return (
                <V8CustomButton
                  label={t("Edit")}
                  variant="secondary"
                  onClick={() => onProcessEdit(params.row)}
                />
              );
            }
            return null;
          },
        };
      }
      return col;
    });
  }, [
    columns,
    onRefresh,
    iconColor,
    getDropdownItems,
    isDuplicating,
    onActionLabelClick,
    onDesignerEdit,
    onProcessEdit,
    canProcessEdit,
    onSubmitSelect,
    t,
  ]);

  // Compose sx to optionally hide column separators when resizing is disabled
  const composedGridSx = useMemo(() => {
    const hideSeparator = disableColumnResize
      ? { "& .MuiDataGrid-columnSeparator": { display: "none !important" } }
      : {};
    return { ...hideSeparator, ...(sx || {}) };
  }, [disableColumnResize, sx]);

  return (
    <Paper sx={sx}>
      <DataGrid
        ref={ref}
        columns={effectiveColumns}
        rows={rows}
        rowCount={rowCount}
        loading={loading}
        sortingMode="server"
        paginationMode="server"
        sortModel={sortModel}
        onSortModelChange={onSortModelChange}
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationModelChange}
        getRowId={getRowId}
        pageSizeOptions={pageSizeOptions}
        rowHeight={rowHeight}
        disableColumnMenu={disableColumnMenu}
        disableRowSelectionOnClick={disableRowSelectionOnClick}
        disableColumnResize={disableColumnResize}
        slots={defaultSlots}
        slotProps={{
          loadingOverlay: { variant: "skeleton", noRowsVariant: "skeleton" },
        }}
        sx={composedGridSx}
      />
    </Paper>
  );
});

FormListGrid.displayName = "FormListGrid";

FormListGrid.propTypes = {
  columns: PropTypes.array.isRequired,
  rows: PropTypes.array.isRequired,
  rowCount: PropTypes.number.isRequired,
  loading: PropTypes.bool,
  sortModel: PropTypes.array,
  onSortModelChange: PropTypes.func,
  paginationModel: PropTypes.shape({
    page: PropTypes.number,
    pageSize: PropTypes.number,
  }),
  onPaginationModelChange: PropTypes.func,
  getRowId: PropTypes.func,
  pageSizeOptions: PropTypes.arrayOf(PropTypes.number),
  rowHeight: PropTypes.number,
  disableColumnMenu: PropTypes.bool,
  disableRowSelectionOnClick: PropTypes.bool,
  sx: PropTypes.object,
  disableColumnResize: PropTypes.bool,
  onRefresh: PropTypes.func,
  dropdownItems: PropTypes.array,
  isDuplicating: PropTypes.bool,
  onActionLabelClick: PropTypes.func,
  onSubmitSelect: PropTypes.func,
  onDesignerEdit: PropTypes.func,
  onProcessEdit: PropTypes.func,
  canProcessEdit: PropTypes.bool,
};

export default memo(FormListGrid);
