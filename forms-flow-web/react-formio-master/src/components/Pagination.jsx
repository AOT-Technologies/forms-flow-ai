import PropTypes from 'prop-types';
import React from 'react';

const LEFT_PAGE = 'LEFT';
const RIGHT_PAGE = 'RIGHT';

function range(from, to, step = 1) {
  let i = from;
  const range = [];

  while (i <= to) {
    range.push(i);
    i += step;
  }

  return range;
}

function getPageNumbers({
  currentPage,
  pageNeighbours,
  totalPages,
}) {
  const totalNumbers = (pageNeighbours * 2) + 3;
  const totalBlocks = totalNumbers + 2;

  if (totalPages > totalBlocks) {
    const calculatedStartPage = Math.max(2, currentPage - pageNeighbours);
    const calculatedEndPage = Math.min(totalPages - 1, currentPage + pageNeighbours);
    const startPage = (calculatedStartPage === 3) ? 2 : calculatedStartPage;
    const endPage = (calculatedEndPage === (totalPages - 2)) ? (totalPages - 1) : calculatedEndPage;

    let pages = range(startPage, endPage);

    const hasLeftSpill = startPage > 2;
    const hasRightSpill = (totalPages - endPage) > 1;
    const spillOffset = totalNumbers - (pages.length + 1);
    let extraPages;

    if (hasLeftSpill && !hasRightSpill) {
      extraPages = range(startPage - spillOffset, startPage - 1);
      pages = [LEFT_PAGE, ...extraPages, ...pages];
    }
    else if (!hasLeftSpill && hasRightSpill) {
      extraPages = range(endPage + 1, endPage + spillOffset);
      pages = [...pages, ...extraPages, RIGHT_PAGE];
    }
    else {
      pages = [LEFT_PAGE, ...pages, RIGHT_PAGE];
    }

    return [1, ...pages, totalPages];
  }

  return range(1, totalPages);
}

function Pagination({
  activePage,
  pageNeighbours,
  pages,
  prev,
  next,
  onSelect,
}) {
  const pageNumbers = getPageNumbers({
    currentPage: activePage,
    pageNeighbours,
    totalPages: pages,
  });

  return (
    <nav aria-label="Page navigation">
      <ul className="pagination">
        <li className={`page-item ${(activePage === 1) ? 'disabled' : ''}`}>
          <a
            className="page-link"
            onClick={() => {
              if (activePage !== 1) {
                onSelect(activePage - 1);
              }
            }}
            href="javascript:void(0)"
          >
            {prev}
          </a>
        </li>

        {
          pageNumbers.map((page) => {
            const className = (page === activePage) ? 'active' : '';

            if ([LEFT_PAGE, RIGHT_PAGE].includes(page)) {
              return (
                <li className="page-item disabled">
                  <span className="page-link">
                    <span aria-hidden="true">...</span>
                  </span>
                </li>
              );
            }

            return (
              <li className={`page-item ${className}`} key={page}>
                <a
                  className="page-link"
                  onClick={() => onSelect(page)}
                  href="javascript:void(0)"
                >
                  {page}
                </a>
              </li>
            );
          })
        }

        <li className={`page-item ${(activePage === pages) ? 'disabled' : ''}`}>
          <a
            className="page-link"
            onClick={() => {
              if (activePage !== pages) {
                onSelect(activePage + 1);
              }
            }}
            href="javascript:void(0)"
          >
            {next}
          </a>
        </li>
      </ul>
    </nav>
  );
}

Pagination.propTypes = {
  activePage: PropTypes.number,
  pageNeighbours: PropTypes.number,
  pages: PropTypes.number.isRequired,
  prev: PropTypes.string,
  next: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
};

Pagination.defaultProps = {
  activePage: 1,
  pageNeighbours: 1,
  prev: 'Previous',
  next: 'Next',
};

export default Pagination;
