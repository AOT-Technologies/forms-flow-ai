import React, { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Checkbox from "@material-ui/core/Checkbox";
import Pagination from "react-js-pagination";
import { withStyles } from "@material-ui/core";
import {Errors} from 'react-formio';
import { fetchBPMFormList, fetchFormById } from "../../../apiManager/services/bpmFormServices";
import { useDispatch, useSelector } from "react-redux";
import LoadingOverlay from "react-loading-overlay";
import { setBundleFormListLoading, setBundleFormListPage, setBundleFormSearch } from "../../../actions/bundleActions";
import Loading from "../../../containers/Loading";
 

const SearchBar = ({searchText,setSearchText ,handleSearch}) => {
  return (
    <>
      <div className="form-outline">
        <input
          type="search"
          id="form1"
            
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            onChange={(e) => {
  
              setSearchText(e.target.value);
              e.target.value === "" && handleSearch();
            }}
          autoComplete="off"
          className="form-control"
          value={searchText}
          placeholder={"Search..."}
        />
      </div>
     {
      searchText ? (
        <button
        type="button"
        className="btn btn-outline-primary ml-2"
          onClick={() =>  handleSearch({clear:true})}
      >
        <i className="fa fa-times"></i>
      </button>
      ) : ""
     }
      <button
        type="button"
        className={`btn btn-outline-primary ml-2`}
        name="search-button"
        disabled={!searchText}
        onClick={() => handleSearch()}
      >
        <i className="fa fa-search"></i>
      </button>
    </>
  );
};

const StyledTableCell = withStyles(() => ({
  head: {
    backgroundColor: "#4559b5",
    color: "white",
    fontSize: "1rem",
  },
  body: {
    fontSize: "1rem",
    padding:"5px"
  },
}))(TableCell);

const FormListModal = React.memo(({
  showModal,
  handleModalChange,
  submitFormSelect
}) => {
  const dispatch = useDispatch();
  const formsAlreadySelected = useSelector(state => state.bundle?.selectedForms || []);
  const [seletedForms, setSelectedForms] = useState(formsAlreadySelected || []);
  const [seletedFormIds, setSelectedFormIds] = useState([]);
  const [searchText, setSearchText] = useState('');
 
  const forms = useSelector((state) => state.bundle?.bundleForms.forms);
 
  const pageNo = useSelector((state) => state.bundle?.bundleForms.page);
  const limit = useSelector((state) => state.bundle?.bundleForms.limit);
  const totalForms = useSelector((state) => state.bundle?.bundleForms.totalForms);
  const sortBy = useSelector((state) => state.bundle?.bundleForms.sortBy);
  const sortOrder = useSelector((state) => state.bundle?.bundleForms.sortOrder);
  const budnleSearchText = useSelector((state) => state.bundle?.bundleForms.searchText);
  const [error,setError] = useState('');

  const seachFormLoading = useSelector(
    (state) => state.bundle?.bundleForms.bundleFormLoading
  );
  const [loadingForms, setLoadingForms] = useState(false);
 
   
 

  const fetchFormList = ()=>{
    const canBudle = true;
    const formType = "";
    let filters = [pageNo, limit, sortBy, sortOrder, searchText,formType, canBudle];
    dispatch(setBundleFormListLoading(true));
    dispatch(fetchBPMFormList(...filters,()=>{
      setLoadingForms(false);
      dispatch(setBundleFormListLoading(false));
    }));
  };
  useEffect(()=>{
   if(showModal){
    setLoadingForms(true);
    fetchFormList();
   }else{
    setError("");
    setSearchText("");
    dispatch(setBundleFormSearch(""));
    dispatch(setBundleFormListPage( 1));
    setSelectedForms([]);
    setSelectedFormIds([]);
   }
  },[pageNo,showModal,budnleSearchText]);


  useEffect(() => {
    if (formsAlreadySelected?.length) {
      const ids = formsAlreadySelected.map((form) => form.formId);
      setSelectedFormIds(ids);
      setSelectedForms(formsAlreadySelected);
    }
  }, [formsAlreadySelected]);

  const handleFormSelect = (action, form) => {
      setError("");
    if (action === "select") {
      const options = "?select=path";
      fetchFormById(form.formId,options).then((res)=>{
        setSelectedFormIds((prev) => [...prev, form.formId]);
        setSelectedForms((prev) => [...prev, {...form,path:res.data.path}]);
      }).catch((err)=>{
       let error ;
      if (err.response?.data) {
        error = err.response.data;
      } else {
        error = err.message;
      }
      
      setError(error);
    
      });

    } else {
      setSelectedFormIds((prev) => prev.filter((item) => item !== form.formId));
      setSelectedForms((prev) => prev.filter((item) => item.formId !== form.formId));
    }
  };

  const handleSearch = (options)=>{

    if(options?.clear){
      setSearchText("");
      dispatch(setBundleFormSearch(""));
    }else{
      dispatch(setBundleFormSearch(searchText));
    }

    dispatch(setBundleFormListPage( options?.page ||  1));
  };
 

  return (
    <div>
      <Modal show={showModal} size="lg">
        <Modal.Header>
          <div className="d-flex justify-content-between align-items-center w-100">
            <h4>Select Form</h4>
            <span style={{ cursor: "pointer" }} onClick={handleModalChange}>
              <i className="fa fa-times" aria-hidden="true"></i>
            </span>
          </div>
        </Modal.Header>
        <Modal.Body>
         {loadingForms ?   <Loading/> : (
          <>
           <Errors errors={error} />
           <div className="d-flex mb-2">{SearchBar({handleSearch,searchText,setSearchText})}</div>
          <LoadingOverlay
                      active={seachFormLoading}
                      spinner
                      text={"Loading..."}
                    >
          <TableContainer style={{ border: "1px solid #dbdbdb" }}>
            <Table aria-label="simple table">
              <TableHead>
                <TableRow>
                  <StyledTableCell></StyledTableCell>
                  <StyledTableCell>Form Name</StyledTableCell>
                  <StyledTableCell>Type</StyledTableCell>
                  <StyledTableCell >Action</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {forms.map((form) => (
                  <>
                    <TableRow>
                      <StyledTableCell align="left">
                        <Checkbox
                          checked={seletedFormIds?.includes(form.formId)}
                          onChange={(e) => {
                            handleFormSelect(
                              e.target.checked ? "select" : "unselect",
                              form
                            );
                          }}
                          inputProps={{ "aria-label": "primary checkbox" }}
                        />
                      </StyledTableCell>
                      <StyledTableCell>{form.formName}</StyledTableCell>
                      <StyledTableCell>{form.formType}</StyledTableCell>
                      <StyledTableCell >
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() =>
                            handleFormSelect(
                              seletedFormIds?.includes(form.formId)
                                ? "unselect"
                                : "select",
                              form
                            )
                          }
                        >
                          {seletedFormIds?.includes(form.formId)
                            ? "unselect"
                            : "select"}
                        </button>
                      </StyledTableCell>
                    </TableRow>
                  </>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          </LoadingOverlay>
          </>
         )}
        
         
        </Modal.Body>
        <Modal.Footer className="justify-content-between">
         <div className="d-flex align-items-center">
         <Pagination
            activePage={pageNo}
            itemsCountPerPage={limit}
            totalItemsCount={totalForms}
            pageRangeDisplayed={5}
            itemClass="page-item"
            linkClass="page-link"
              onChange={(page)=>{handleSearch({page});}}
          />
          <span className="ml-2 mb-3">Showing {(limit * pageNo ) - (limit - 1)} to {limit * pageNo > totalForms ? totalForms : limit * pageNo  } of {totalForms}</span>
         </div>
          <button className="btn btn-primary" onClick={()=>{submitFormSelect(seletedForms);}}>Submit</button>
        </Modal.Footer>
      </Modal>
    </div>
  );
});

export default FormListModal;
