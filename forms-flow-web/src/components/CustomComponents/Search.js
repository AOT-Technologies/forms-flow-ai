import React from 'react';
import { InputGroup, FormControl, Spinner } from 'react-bootstrap';

const customSearch = ({
  searchFormLoading,
  handleClearSearch,
  search,
  setSearch,
  handleSearch,
  placeholder,
  title
}) => {
  const inputClassNames = `d-flex align-items-center bg-white out-line search-box-input ${
    searchFormLoading ? 'is-searching' : search ? 'has-value' : ''
  }`;

  return (
    <InputGroup className="d-flex align-items-center p-0 search-box input-group">
      <div className="form-control-with-icon">
        <FormControl
          className={inputClassNames}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
          }}
          onKeyDown={(e) => (e.keyCode === 13 ? handleSearch() : "")}
          placeholder={placeholder}
          title={title}
          data-testid="form-search-input-box"
          aria-label={placeholder}
        />
        {search && searchFormLoading ? (
          <span className="d-flex search-box-icon loading">
            <Spinner animation="border" size="sm" />
          </span>
        ) : (
          search && !searchFormLoading ? (
            <span
              className="search-box-icon clear"
              onClick={handleClearSearch}
              data-testid="form-search-clear-button"
            >
              <i className="fa fa-times"></i>
            </span>
          ) : null
        )}
      </div>
    </InputGroup>
  );
};


customSearch.defaultProps = {
  placeholder: "Search...",
  title: "Search"
};

export default customSearch;
