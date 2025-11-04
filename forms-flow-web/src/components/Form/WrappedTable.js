import React, { useMemo, forwardRef, memo } from "react";
import Paper from "@mui/material/Paper";
import { DataGrid } from "@mui/x-data-grid";
import { RefreshIcon, V8CustomButton, NewSortDownIcon } from "@formsflow/components";
import { StyleServices } from "@formsflow/service";
import PropTypes from "prop-types";

/**
 * Generic DataGrid wrapper component for listing tables across the application.
 * 
 * Features:
 * - Supports both server-side and client-side pagination/sorting
 * - Automatically injects refresh button in actions column header when onRefresh is provided
 * - Custom sort icons with consistent styling
 * - Skeleton loading overlay for better UX
 * - Extensible via dataGridProps for additional DataGrid customization
 * 
 * This component accepts all data and handlers as props to remain page-agnostic,
 * making it reusable across forms, processes, submissions, and other listing pages.
 */
const WrappedTable = forwardRef(function WrappedTable(
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
    disableColumnResize = true,
    onRefresh,
    sortingMode = "server",
    paginationMode = "server",
    noRowsLabel,
    dataGridProps = {},
  },
  ref
) {
  const iconColor = StyleServices.getCSSVariable("--ff-gray-medium-dark");

  // Custom sort icons for DataGrid - uses NewSortDownIcon with consistent styling
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

  // Enhance columns: inject refresh button into actions column header if onRefresh is provided
  // Only adds refresh button if actions column doesn't already have a custom renderHeader
  const effectiveColumns = useMemo(() => {
    return (columns || []).map((col) => {
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
      return col;
    });
  }, [columns, onRefresh, iconColor]);

  // Compose base sx styles: hide column separators when resizing is disabled
  const composedGridSx = useMemo(() => {
    const hideSeparator = disableColumnResize
      ? { "& .MuiDataGrid-columnSeparator": { display: "none !important" } }
      : {};
    return { ...hideSeparator, ...(sx || {}) };
  }, [disableColumnResize, sx]);

  // Merge base styles with any sx overrides from dataGridProps
  // Allows consumers to extend/customize DataGrid styles
  const mergedDataGridSx = useMemo(() => {
    const incomingSx = (dataGridProps && dataGridProps.sx) || {};
    return { ...composedGridSx, ...incomingSx };
  }, [composedGridSx, dataGridProps]);

  // Merge default slots with custom slots from dataGridProps
  // Allows consumers to override or extend DataGrid slots (icons, overlays, etc.)
  const finalSlots = useMemo(() => ({
    ...defaultSlots,
    ...(dataGridProps && dataGridProps.slots ? dataGridProps.slots : {}),
  }), [defaultSlots, dataGridProps]);

  // Merge default slot props with custom slot props from dataGridProps
  // Default includes skeleton loading overlay for better UX
  const finalSlotProps = useMemo(() => ({
    loadingOverlay: { variant: "skeleton", noRowsVariant: "skeleton" },
    ...(dataGridProps && dataGridProps.slotProps ? dataGridProps.slotProps : {}),
  }), [dataGridProps]);

  return (
    <Paper sx={sx}>
      <DataGrid
        ref={ref}
        {...dataGridProps}
        columns={effectiveColumns}
        rows={rows}
        rowCount={rowCount}
        loading={loading}
        sortingMode={sortingMode}
        paginationMode={paginationMode}
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
        slots={finalSlots}
        slotProps={finalSlotProps}
        localeText={noRowsLabel ? { noRowsLabel } : undefined}
        sx={mergedDataGridSx}
      />
    </Paper>
  );
});

WrappedTable.displayName = "WrappedTable";

WrappedTable.propTypes = {
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
};

export default memo(WrappedTable);

