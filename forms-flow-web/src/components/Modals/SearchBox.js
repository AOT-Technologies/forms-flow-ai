import React from 'react';
import { InputGroup, FormControl } from 'react-bootstrap';
import PropTypes from 'prop-types';

const SearchBox = ({
    searchFormLoading,
    handleClearSearch,
    search,
    setSearch,
    handleSearch,
    placeholder,
    title
}) => {
    return (
        <>
            <InputGroup className="d-flex align-items-center p-0 search-box input-group" style={{ width: "24%" }}>
                <div className="form-control-with-icon">
                    <FormControl
                        className=" d-flex align-items-center bg-white out-line search-box"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                        }}
                        onKeyDown={(e) => (e.keyCode === 13 ? handleSearch() : "")}
                        placeholder={placeholder}
                        title={title}
                        data-testid="form-search-input-box"
                        aria-label={placeholder}
                        icon={"fa fa-times"}
                    />
                    { search && searchFormLoading ? (
                        <span className="d-flex search-box-icon spinner"> loading</span>
                    ) : (
                        search && !searchFormLoading ? (
                            <span
                                className="search-box-icon"
                                onClick={handleClearSearch}
                                data-testid="form-search-clear-button"
                            >
                                <i className="fa fa-times"></i>
                            </span>
                        ) : null
                    )}
                    
                </div>
            </InputGroup>

        </>
    );
};

SearchBox.propTypes = {
    search: PropTypes.string.isRequired,
    setSearch: PropTypes.func.isRequired,
    handleSearch: PropTypes.func.isRequired,
    handleClearSearch: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    title: PropTypes.string
};

SearchBox.defaultProps = {
    placeholder: "Search...",
    title: "Search"
};

export default SearchBox;