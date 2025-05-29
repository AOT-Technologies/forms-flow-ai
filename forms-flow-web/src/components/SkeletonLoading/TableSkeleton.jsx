import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
//takes the number of column and number of rows as props
const TableSkeleton = React.memo(({ columns, rows, cellHeight = 25}) => {
  const renderSkeletonCells = (count) =>
    Array.from({ length: count }).map((_, i) => (
      <td key={i}>
        <Skeleton height={cellHeight} />
      </td>
    ));

  const renderLastRow = () => (
    <>
      <td className="rounded-bl">
        <Skeleton height={cellHeight} />
      </td>
      <td colSpan={3} className="text-center">
        <div className="d-flex justify-content-center gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} height={40} width={40} circle />
          ))}
        </div>
      </td>
      <td className="rounded-br">
        <Skeleton height={cellHeight} />
      </td>
    </>
  );

  return (
    <div className="custom-tables-wrapper">
      <table className="table table-skeleton">
        <thead>
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i}>
                <Skeleton height={cellHeight} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => {
            const isLastRow = rowIndex === rows - 1;
            return (
              <tr key={rowIndex} className={isLastRow ? "no-border-bottom" : ""}>
                {isLastRow ? renderLastRow() : renderSkeletonCells(columns)}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
});

export default TableSkeleton;
