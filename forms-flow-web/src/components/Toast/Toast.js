import React, { Component } from "react";
import { connect } from "react-redux";
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';



function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const Toast = class extends Component {
  
 
  constructor(props) {
    super(props);
    this.state = {
      open:true
    }
  }
  UNSAFE_componentWillMount() {
  }

  handleSucessClose = () => {
    this.setState({open:false})
  };
  handleSucessOpen = () => {
    this.setState({open:true})
  };

  render() {
    return (
      <div className="container">
        <Snackbar open={this.state.open} autoHideDuration={6000} onClose={this.handleSucessClose}>
          <Alert onClose={this.handleSucessClose} severity="success">
            Changes saved successfully! 
          </Alert>
        </Snackbar>
      </div>
    );
  }

  
};

export default connect(null, null)(Toast);
