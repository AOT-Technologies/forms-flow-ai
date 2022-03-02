import React, { useState } from 'react'
import '../FormSearch/formSearch.css'
import { useDispatch, useSelector } from 'react-redux'
import { indexForms } from 'react-formio'
import InputGroup from 'react-bootstrap/InputGroup'
import FormControl from 'react-bootstrap/FormControl'
import {getSearchText} from "../../../apiManager/services/formatterService";
import {Button} from "react-bootstrap";
import { useTranslation,Translation } from "react-i18next";

const FormSearch = React.memo(() => {
  //Search query /form?type=form&title__regex=%2Fnew%2Fi  query Format title__regex= /^title/i
  const {t}=useTranslation();
  const dispatch = useDispatch();
  const { query, sort } = useSelector((state) => state.forms);
  const [searchText, setSearchText] = useState(getSearchText(query?.title__regex||''));

  // if ascending sort value is title else -title for this case
  const isAscending = !sort.match(/^-/g);

  //function for sorting in descending order
  const updateSort = () => {
    const updatedQuery = {
      sort: `${isAscending?'-':''}title`,
    }
    dispatch(indexForms('forms', 1, updatedQuery))
  }
  // To handle the search option
  const handleSearch = (searchForm) => {
    const searchTitle = searchForm ? `/${searchText}/i` : '';
    dispatch(indexForms('forms', 1, {query:{ ...query, title__regex: searchTitle }}))
  }
  return (
    <>
      <div className="container main_div">
        <span className="">
        <Translation>{(t)=>t("form")}</Translation>
          <i
            onClick={updateSort}
            className="fa fa-long-arrow-up ml-2"
            style={{ cursor: 'pointer',opacity: `${isAscending?1:0.5}`}}
          />
          <i
            onClick={updateSort}
            className="fa fa-long-arrow-down ml-1"
            style={{ cursor: 'pointer',opacity: `${isAscending?0.5:1}`}}
          />
        </span>

        <div className="input_search">
          <InputGroup className="mb-3" >
            <FormControl
              onChange={(e) => {
                setSearchText(e.target.value)
              }}
              className="mr-1"
              placeholder={t("search")}
              value={searchText}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchText)}
              style={{border:"none"}}
            />
            {searchText!=="" && (
                <Button
                    onClick={() => {
                      handleSearch('')
                    }}
                    variant="outline-secondary" title="Click to clear"
                    className='clear_button'
                    >
                  <i className="fa fa-times fa-lg" />
                </Button>
              )}
            <Button
                onClick={() => {
                  handleSearch(searchText)
                }}
                variant="outline-primary"
                title={t("formsearch_hover")}
                >
              <i className="fa fa-search fa-lg"/>
            </Button>
          </InputGroup>
        </div>
      </div>
    </>
  )
})

export default FormSearch
