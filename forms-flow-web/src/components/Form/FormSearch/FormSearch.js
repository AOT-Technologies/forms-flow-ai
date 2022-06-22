import React, { useState } from "react";
import "../FormSearch/formSearch.css";
import { useDispatch, useSelector } from "react-redux";
import { indexForms } from "react-formio";
import { setFormLoading } from "../../../actions/checkListActions";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import { getSearchText } from "../../../apiManager/services/formatterService";
import { Button } from "react-bootstrap";

import { STAFF_DESIGNER } from "../../../constants/constants";
import {
  setBPMFormListSort,
  setBpmFormSearch,
  setBpmFormLoading,
  setBPMFormListPage,
} from "../../../actions/formActions";
import { useTranslation, Translation } from "react-i18next";

const FormSearch = React.memo(() => {
  //Search query /form?type=form&title__regex=%2Fnew%2Fi  query Format title__regex= /^title/i
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const query = useSelector((state) => state.forms.query);
  const sort = useSelector((state) => state.forms.sort);
  const searchKey = useSelector(state => state.bpmForms.searchText);
  const [searchText, setSearchText] = useState(
    getSearchText(query?.title__regex || searchKey || "")
  );
  const userRoles = useSelector((state) => state.user.roles);
  const isDesigner = userRoles.includes(STAFF_DESIGNER);
  let sortOrder =  useSelector(state => state.bpmForms.sortOrder);


  // if ascending sort value is title else -title for this case
  // const isAscending = !sort.match(/^-/g);
  const isAscending = isDesigner
    ? !sort.match(/^-/g) : (sortOrder === 'asc') ? true : false;

    console.log("isacsending",isAscending);
    console.log("sort order",sortOrder);
  //function for sorting  order
  let updatedQuery = {};
  const updateSort = () => {
    if (isDesigner) {
      dispatch(setFormLoading(true));
      updatedQuery = {
        sort: `${isAscending ? "-" : ""}title`,
      };
      dispatch(
        indexForms("forms", 1, updatedQuery, () => {
          dispatch(setFormLoading(false));
        })
      );
    } else {
      let updatedSort;
      dispatch(setBpmFormLoading(false));
      if(sortOrder === 'asc'){
        updatedSort = "desc";
        dispatch(setBPMFormListSort(updatedSort));
      }else{
        updatedSort = "asc";
        dispatch(setBPMFormListSort(updatedSort));
      }
      dispatch(setBPMFormListPage(1));
    }
  };

  // To handle the search option
  let searchTitle;
  const handleSearch = (searchForm) => {
    if (isDesigner) {
      dispatch(setFormLoading(true));
      searchTitle = searchForm ? `/${searchText}/i` : "";
      dispatch(
        indexForms(
          "forms",
          1,
          { query: { ...query, title__regex: searchTitle } },
          () => {
            dispatch(setFormLoading(false));
            setSearchText(searchForm);
          }
        )
      );
    } else {
      dispatch(setBpmFormLoading(true));
      dispatch(setBPMFormListPage(1));
      dispatch(setBpmFormSearch(searchForm));
      setSearchText(searchForm);
      dispatch(setBpmFormLoading(false));
    }
  };

  return (
    <>
      <div className="container main_div">
        <span className="" data-testid="sample">
          <Translation>{(t) => t("Form")}</Translation>
          <i
            onClick={updateSort}
            className="fa fa-long-arrow-up ml-2"
            style={{ cursor: "pointer", opacity: `${isAscending ? 1 : 0.5}` }}
          />
          <i
            onClick={updateSort}
            className="fa fa-long-arrow-down ml-1"
            style={{ cursor: "pointer", opacity: `${!isAscending ? 1 : 0.5}`}}
          />
        </span>

        <div className="input_search">
          <InputGroup className="mb-3">
            <FormControl
              onChange={(e) => {
                setSearchText(e.target.value);
              }}
              className="mr-1"
              placeholder={t("Search...")}
              value={searchKey.length ? searchKey : searchText}
              onKeyPress={(e) => e.key === "Enter" && handleSearch(searchText)}
              style={{ border: "none" }}
            />
            {(searchText || searchKey.length) !== "" && (
              <Button
                onClick={() => {
                  handleSearch("");
                }}
                variant="outline-secondary"
                title={t("Click to clear")}
                className="clear_button"
              >
                <i className="fa fa-times fa-lg" />
              </Button>
            )}
            <Button
              onClick={() => {
                handleSearch(searchText);
              }}
              variant="outline-primary"
              title={t("Press Enter key or click here to search")}
            >
              <i className="fa fa-search fa-lg" />
            </Button>
          </InputGroup>
        </div>
      </div>
    </>
  );
});

export default FormSearch;
