import React from 'react';
import { InputGroup, FormControl } from 'react-bootstrap';
import { CloseIcon } from "@formsflow/components";

const customSearch = ({
  searchFormLoading,
  handleClearSearch,
  search,
  setSearch,
  handleSearch,
  placeholder,
  title
}) => {
  const inputClassNames = `d-flex align-items-center search-box-input ${
    searchFormLoading ? 'is-searching' : search ? 'has-value' : ''
  }`;

  return (
    <InputGroup className="d-flex align-items-center p-0 search-box input-group">
      <div className="form-control-with-icon col-lg-4 col-md-6 col-sm-8">
        <FormControl
          className={inputClassNames}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
          }}
          onKeyDown={(e) => (e.keyCode === 13 && handleSearch())}
          placeholder={placeholder}
          title={title}
          data-testid="form-search-input-box"
          aria-label={placeholder}
        />
        {search && (
          <span
            className={`d-flex search-box-icon ${
              searchFormLoading && 'loading' 
            }`}
            onClick={!searchFormLoading && handleClearSearch}
            data-testid="form-search-clear-button"
          >
            {searchFormLoading ? (
              <div className="search-spinner"></div>
            ) : (
              <CloseIcon width={10} height={10} />

            )}
          </span>
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
