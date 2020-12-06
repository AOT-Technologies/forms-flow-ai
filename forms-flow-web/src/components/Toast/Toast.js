import React, { Component } from "react";
import { connect } from "react-redux";
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
// import { makeStyles } from '@material-ui/core/styles';


function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

// const useStyles = makeStyles((theme) => ({
//   root: {
//     width: '100%',
//     '& > * + *': {
//       marginTop: theme.spacing(2),
//     },
//   },
// }));


const Toast = class extends Component {
 
  constructor(props) {
    super(props);
    this.state = {
      open:true,
      vertical: 'top',
      horizontal: 'center'
    }
  }

  UNSAFE_componentWillMount() {
  }

  // componentDidMount() {
  //   const {
  //     severity,
  //     message
  //   } = this.props;
  // }

  handleSucessClose = () => {
    this.setState({open:false})
  };

  // handleSucessOpen = () => {
  //   const classes = useStyles();
  //   const [open, setOpen] = React.useState(false);
  //   this.setState({open:true})
  // };

  render() {
    return (
      <div className="container">
        <Snackbar 
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right'
          }}
          open={this.state.open} 
          autoHideDuration={6000} 
          onClose={this.handleSucessClose}>
          <Alert onClose={this.handleSucessClose} severity={this.props.severity} >
            {this.props.message}
          </Alert>
        </Snackbar>
      </div>
    );
  }  
};

export default connect(null, null)(Toast);
