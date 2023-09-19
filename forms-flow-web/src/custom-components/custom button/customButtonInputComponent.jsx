import React, { Component } from 'react';
// import { connect } from 'react-redux'; // Step 1: Import connect from react-redux

class CustomButton extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: props.data,
            value: props.value || "20",
        };
    }

    onClick() {

        console.log("Not getting the form instance and thus the submission id");

    }
    y
    render() {
        // const Width = this.state.value;
        const { label } = this.props.component;
        return (
            <button
                className="btn btn-primary"
                onClick={this.onClick.bind(this)}
            >
                {label || "custom Button"}
            </button>
        );
    }
}

// Step 2: Connect the component to the Redux store
// const mapStateToProps = (state) => {
//     return {
//         currentState: state // Assuming you have a single reducer
//         // You can also map specific parts of the state like: currentState: state.someReducer
//     };
// };

// export default connect(mapStateToProps)(CustomButton); // Step 3: Connect the component using connect
export default CustomButton;
