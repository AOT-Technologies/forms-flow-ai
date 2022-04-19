import React, { useState } from 'react';
import '../FormSearch/formSearch.css';
import { useDispatch, useSelector } from 'react-redux';
import { indexForms} from 'react-formio';
import { setFormLoading } from '../../../actions/checkListActions';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import {getSearchText} from "../../../apiManager/services/formatterService";
import {Button} from "react-bootstrap";
import { STAFF_DESIGNER } from '../../../constants/constants';
import { setBPMFormListSort,setBpmFormSearch,setBpmFormLoading} from '../../../actions/formActions';

const FormSearch = React.memo(() => {
  //Search query /form?type=form&title__regex=%2Fnew%2Fi  query Format title__regex= /^title/i
  const dispatch = useDispatch();
  const query = useSelector((state) => state.forms.query);
  const sort =  useSelector((state) => state.forms.sort)
  const [searchText, setSearchText] = useState(getSearchText(query?.title__regex||''));
  const bpmSort = useSelector((state)=> state.bpmForms.sort);
  const userRoles = useSelector((state) => state.user.roles);
  const isDesigner = userRoles.includes(STAFF_DESIGNER);

  // if ascending sort value is title else -title for this case
  // const isAscending = !sort.match(/^-/g);
  const isAscending = isDesigner ? !sort.match(/^-/g) : (bpmSort ==='-title'? false : true);
  //function for sorting  order
  let updatedQuery ={}
  const updateSort = () => {
    if(isDesigner){
      dispatch(setFormLoading(true));
      updatedQuery = {
        sort: `${isAscending?'-':''}title`,
      }
      dispatch(indexForms('forms', 1, updatedQuery,()=>{
        dispatch(setFormLoading(false));
      })) 
    }else{
      dispatch(setBpmFormLoading(true))
      updatedQuery = {
        sort: `${isAscending?'-':''}title`,
      }
     dispatch(setBPMFormListSort(updatedQuery.sort || ''));
     dispatch(setBpmFormLoading(false))
    }
  }

  // To handle the search option
  let searchTitle
  const handleSearch = (searchForm) => {
    if(isDesigner){
      dispatch(setFormLoading(true));
       searchTitle = searchForm ? `/${searchText}/i` : '';
      dispatch(indexForms('forms', 1, {query:{ ...query, title__regex: searchTitle}},()=>{
        dispatch(setFormLoading(false));
        setSearchText(searchForm);
      }))
    }else{
      dispatch(setBpmFormLoading(true))
     searchTitle = searchForm ? searchText : '';
     dispatch(setBpmFormSearch(searchTitle))
     setSearchText(searchTitle);
     dispatch(setBpmFormLoading(false))
    }
  }
  return (
    <>
      <div className="container main_div">
        <span className="" data-testid = "sample">
          Form
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
              placeholder="Search.."
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
                title="Press Enter key or click here to search"
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
