import { Dropdown, DropdownButton } from 'react-bootstrap';
import SelectFormForDownload from '../FileUpload/SelectFormForDownload';
import FormOperations from '../FormOperations/FormOperations';
import FormSearch from '../FormSearch/FormSearch';


export  const designerColums = ()=> [
    {
        dataField:"title",
        text:<FormSearch/>,
    },
    {
        dataField:"operations",
        text:"Operations",
        formatter:(cell,row) => {
            return <FormOperations formData={row}/>;
    }
    },
    {
        dataField:'id',
        text: <SelectFormForDownload type="all" />,
        formatter:(cell,row)=> <SelectFormForDownload form={row} />
    }
];  

export  const userColumns = ()=> [
    {
        dataField:"title",
        text:<FormSearch/>,
    },
    {
        dataField:"operations",
        text:"Operations",
        formatter:(cell,row) => {
            return <FormOperations formData={row}/>;
    }
}
];
const customDropUp = ({ options, currSizePerPage, onSizePerPageChange }) => {
    return (
      <DropdownButton
        drop="down"
        variant="secondary"
        title={currSizePerPage}
        style={{ display: "inline" }}
      >
        {options.map((option) => (
          <Dropdown.Item
            key={option.text}
            type="button"
            onClick={() =>{ 
                onSizePerPageChange(option.page);
            }}
            >
            {option.text}
          </Dropdown.Item>
        ))}
      </DropdownButton>
    );
  };
const getpageList = (count) => {
    const list = [
      {
        text: "5",
        value: 5,
      },
      {
        text: "25",
        value: 25,
      },
      {
        text: "50",
        value: 50,
      },
      {
        text: "100",
        value: 100,
      },
      {
        text: "All",
        value: count,
      },
    ];
    return list;
  };

export const getoptions = (pageNo,limit,totalForms) => {
    return {
      expandRowBgColor: "rgb(173,216,230)",
      pageStartIndex: 1,
      alwaysShowAllBtns: true, // Always show next and previous button
      withFirstAndLast: true, // Hide the going to First and Last page button
      hideSizePerPage: false, // Hide the sizePerPage dropdown always
      // hidePageListOnlyOnePage: true, // Hide the pagination list when only one page
      paginationSize: 7, // the pagination bar size.
      prePageText: "<",
      nextPageText: ">",
      showTotal: true,
      Total: totalForms,
      disablePageTitle: true,
      sizePerPage: limit,
      page: pageNo,
      totalSize: totalForms,
      sizePerPageList: getpageList(limit),
      sizePerPageRenderer: customDropUp,
    };
  };

