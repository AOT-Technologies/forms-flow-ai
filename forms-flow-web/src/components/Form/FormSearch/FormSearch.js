import React, { useState } from 'react'
import '../FormSearch/formSearch.css'
import { useDispatch, useSelector } from 'react-redux'
import { indexForms } from 'react-formio'
import { setFormSearchQuery } from '../../../actions/formActions'
import InputGroup from 'react-bootstrap/InputGroup'
import FormControl from 'react-bootstrap/FormControl'
const FormSearch = React.memo(() => {
  //Search query /form?type=form&title__regex=%2Fnew%2Fi  query Format title__regex= /^title/i
  const dispatch = useDispatch()
  const { formSearchQuery } = useSelector((state) => state.formCheckList)
  const { query, sort } = useSelector((state) => state.forms)
  const [searchText, setSearchText] = useState(formSearchQuery)
  const [clearbutton, setClearButton] = useState(formSearchQuery)

  // function for sorting in ascending order
  const sortAscending = () => {
    const updatedQuery = {
      ...query,
      title__regex: `/^${searchText}/i`,
      sort: 'title',
    }
    dispatch(indexForms('forms', 1, updatedQuery))
  }

  //function for sorting in descending order
  const sortDescending = () => {
    const updatedQuery = {
      ...query,
      title__regex: `/^${searchText}/i`,
      sort: '-title',
    }

    dispatch(indexForms('forms', 1, updatedQuery))
  }

  // To handle the search option
  const handleSearch = (searchForm) => {
    const searchTitle = searchForm ? `/^${searchForm}/i` : ''
    const updatedQuery = { ...query, title__regex: searchTitle }
    dispatch(setFormSearchQuery(searchForm))
    dispatch(indexForms('forms', 1, updatedQuery))
  }

  return (
    <>
      <div className="container main_div">
        <span className="">
          Form
          <i
            onClick={sortAscending}
            className="fa fa-long-arrow-up ml-2"
            style={{ cursor: 'pointer' }}
          />
          <i
            onClick={sortDescending}
            className="fa fa-long-arrow-down ml-1"
            style={{ cursor: 'pointer' }}
          />
        </span>

        <div className="input_search">
          <InputGroup className="mb-3">
            <FormControl
              onChange={(e) => {
                setSearchText(e.target.value)
                setClearButton(true)
              }}
              placeholder="search"
              value={searchText}
            />
            <InputGroup.Text>
              {clearbutton && (
                <a
                  onClick={() => {
                    handleSearch('')
                  }}
                  title="click to clear"
                  className="mr-3"
                >
                  <i className="fa fa-times" />
                  <p></p>
                </a>
              )}

              <a
                onClick={() => {
                  handleSearch(searchText)
                }}
              >
                <i
                  className="fa fa-search"
                  title="click to search"
                />
              </a>
            </InputGroup.Text>
          </InputGroup>
        </div>
      </div>
    </>
  )
})

export default FormSearch
