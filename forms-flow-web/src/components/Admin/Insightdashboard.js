import React from "react";
import BootstrapTable from 'react-bootstrap-table-next';
const InsightDashboard = React.memo((props)=> {
  //const [books, setBooks] = useState(null);
  //const dispatch = useDispatch();
  // const getProductData = async () => {
  //   try {
  //     const data = await axios.get(
  //       "https://app2.aot-technologies.com/api/dashboards?"
  //     );
  //     console.log(data);
  //     //setProduct(data.data);
  //   } catch (e) {
  //     console.log(e);
  //   }
  // };

  // useEffect(() => {
  //   getProductData();
  // }, []);
  const columns = [
    {
    dataField: 'id',
    text: 'Dashboard'
    },
   {
    dataField: 'group',
    text: 'Groups'
   },
   {
    dataField: 'select',
    text: 'select'
  }
];
// async function getData() {
//     const response = await fetch("https://www.anapioficeandfire.com/api/books");
//     const data = await res.json();

//     // store the data into our books variable
//     setBooks(data) ;
//   }
 const products = [
    { id: '1', group: 'Group 1 ' },
    { id: '2', group: 'Group 2' },
    { id: '3', group: 'Group 3' },
    { id: '4', group: 'Group 4'},
  ]
  return (
     <>
        <div className="flex-container">
          {/*<img src="/form.svg" width="30" height="30" alt="form" />*/}
          <div className="flex-item-left">
          <h3 className="task-head">
          <i className="fa fa-wpforms" aria-hidden="true"/>
             <span className="forms-text">Dashboard</span></h3>
          </div>
        </div>
        <section className="custom-grid grid-forms">
          {/* <Errors errors={errors} /> */}
          <BootstrapTable keyField='id' data={ products } columns={ columns } />
        </section>
     </>
    );
});

export default (InsightDashboard);
